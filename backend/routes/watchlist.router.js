const axios = require( 'axios' );
let Ticker = require( '../models/ticker.model' );
const router = require( 'express' ).Router();
const { getQuoteWithCaching, getQuotesUptoYearMonthWithCaching } = require( './utils/commonDbOps' );

const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_WATCHLIST_ROUTER = ( process.env.LOG_WATCHLIST_ROUTER == 'true' ) ? true : false;
const LOG_WATCHLIST_ROUTER_GET_WATCHLIST = ( process.env.LOG_WATCHLIST_ROUTER_GET_WATCHLIST == 'true' ) ? true : false;


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

    let tickerDoc = await Ticker.findOneAndUpdate(
      {
        userId: req.user._id,
        tickerSymbol: ticker,
        inPortfolio: false,
      },
      newTicker,
      {
        new: true,
        upsert: true
      }
    );
    if ( LOG && LOG_WATCHLIST_ROUTER ) {
      console.log( "tickerDoc: ", tickerDoc );
    }
    res.status( 200 ).json( tickerDoc );

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
      .deleteMany( { userId: req.user._id, tickerSymbol: req.body.ticker, inPortfolio: false } )
      .then( tickerSymbol => {
        res.json( tickerSymbol );
        if ( LOG && LOG_WATCHLIST_ROUTER ) {
          console.log( `Ticker.deleteMany(userID: req.user._id = ${req.user._id}, tickerSymbol: req.body.ticker = ${req.body.ticker}, inPortfolio = false)` );
          console.log( `Deleted from MongoDB ${tickerSymbol}.` );
        }
      } )
      .catch( err => res.status( 400 ).json( { Error: err } ) );
  } catch ( err ) {
    return res.status( 500 ).json( { Error: err } );

  }
} );

router.get( '/getWatchlist', async ( req, res ) => {
  const tickers = await Ticker
    .find( { userId: req.user._id, inPortfolio: false } )
    .select( 'tickerSymbol -_id' );
  if ( LOG && LOG_WATCHLIST_ROUTER && LOG_WATCHLIST_ROUTER_GET_WATCHLIST ) console.log( `tickers: ${tickers}` );


  return res.json( tickers );
} );

router.get( '/getWatchlistQuotes', async ( req, res ) => {
  const tickers = await Ticker
    .find( { userId: req.user._id, inPortfolio: false } )
    .select( 'tickerSymbol -_id' );
  if ( LOG && LOG_WATCHLIST_ROUTER && LOG_WATCHLIST_ROUTER_GET_WATCHLIST ) console.log( `tickers: ${tickers}` );

  let processedRes = [];
  for ( let ticker of tickers ) {

    if ( LOG && LOG_WATCHLIST_ROUTER && LOG_WATCHLIST_ROUTER_GET_WATCHLIST ) {
      console.log( `ticker: ${ticker}` );
    }

    let apiRes = await getQuoteWithCaching( ticker.tickerSymbol, req.user.viewingMonth );
    console.log( "Got from getQuoteWithCaching apiRes: ", apiRes );

    const filteredRes = {};
    filteredRes[ ticker.tickerSymbol ] = apiRes;

    processedRes.push( filteredRes );

  }

  return res.json( processedRes );
} );


router.get( '/getWatchlistQuotesUptoYearMonth', async ( req, res ) => {

  const tickers = await Ticker
    .find( { userId: req.user._id, inPortfolio: false } )
    .select( 'tickerSymbol -_id' );
  if ( LOG && LOG_WATCHLIST_ROUTER && LOG_WATCHLIST_ROUTER_GET_WATCHLIST ) console.log( `tickers: ${tickers}` );

  let processedRes = [];
  for ( let ticker of tickers ) {

    if ( LOG && LOG_WATCHLIST_ROUTER && LOG_WATCHLIST_ROUTER_GET_WATCHLIST ) {
      console.log( `ticker: ${ticker}` );
    }

    let apiRes = await getQuotesUptoYearMonthWithCaching( ticker.tickerSymbol, req.user.viewingMonth );
    console.log( "Got from getQuoteUptoYearMonthWithCaching apiRes: ", apiRes );
    if ( apiRes === undefined || apiRes === null || apiRes.length <= 0) {
      let errorMessage = `Could not retrieve quote for ${ticker.tickerSymbol}`;
      console.error( errorMessage );
      return res
        .status( 400 )
        .send( { errorMessage } );
    }

    const filteredRes = {};
    filteredRes[ ticker.tickerSymbol ] = apiRes;

    processedRes.push( filteredRes );

  }

  return res.json( processedRes );
} );


module.exports = router;