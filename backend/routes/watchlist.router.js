const axios = require( 'axios' );
let Ticker = require( '../models/ticker.model' );
const router = require( 'express' ).Router();

const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_WATCHLIST_ROUTER = ( process.env.LOG_WATCHLIST_ROUTER == 'true' ) ? true : false;

const currMonth = '2022-03';  // TODO: change to dynamically request from MongoDB

router.post( '/addTickerToWatchlist', async ( req, res ) => {
  try {
    let { ticker } = req.body;
    if ( !ticker ) {
      return res.status( 400 ).json( { Error: "Not all fields have been entered" } );
    }

    const newTicker = new Ticker( {
      userId: req.user._id,
      tickerSymbol: ticker,
      inPortfolio: false
    } );

    newTicker
      .save()
      .then( tickerSymbol => {
        res.json( tickerSymbol );
        if ( LOG && LOW_WATCHLIST_ROUTER ) console.log( tickerSymbol );
      } )
      .catch( err => res.status( 400 ).json( { Error: err } ) );
  } catch ( err ) {
    return res.status( 500 ).json( { Error: err } );

  }
} );

router.post( '/deleteTickerFromWatchlist', async ( req, res ) => {
  try {
    let { ticker } = req.body;
    if ( !ticker ) {
      return res.status( 400 ).json( { Error: "Not all fields have been entered" } );
    }

    Ticker
      .deleteOne( { userID: req.user._id, tickerSymbol: req.body.ticker } )
      .then( tickerSymbol => {
        res.json( tickerSymbol );
        if ( LOG && LOG_WATCHLIST_ROUTER ) console.log( `Deleted from MongoDB ${tickerSymbol}.` );
      } )
      .catch( err => res.status( 400 ).json( { Error: err } ) );
  } catch ( err ) {
    return res.status( 500 ).json( { Error: err } );

  }
} );

router.get( '/getWatchlist', async ( req, res ) => {
  const tickers = await Ticker.find( { userId: req.user._id, inPortfolio: false } ).select( 'tickerSymbol -_id' );
  console.log( `tickers: ${tickers}` );
  let processedRes = [];
  for ( let ticker of tickers ) {
    console.log( `ticker: ${ticker}` );
    let filteredRes = await axios
      .get(
        'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=' +
        ticker.tickerSymbol +
        '&datatype=json' +
        '&apikey=' +
        process.env.VANTAGE_KEY
      )
      .then( apiRes => {
        if ( LOG && LOG_WATCHLIST_ROUTER ) console.log( apiRes );
        const filteredRes = {};
        for ( const property in apiRes.data[ 'Monthly Adjusted Time Series' ] ) {
          if ( property.slice( 0, 7 ) === currMonth ) {
            filteredRes[ ticker.tickerSymbol ] = apiRes.data[ 'Monthly Adjusted Time Series' ][ property ][ '5. adjusted close' ];
          }
        }
        return filteredRes;
      } );
    if ( LOG && LOG_WATCHLIST_ROUTER ) console.log( `filteredRes: ${filteredRes}` );
    processedRes.push( filteredRes );
  }
  return res.json( processedRes );
} );


module.exports = router;