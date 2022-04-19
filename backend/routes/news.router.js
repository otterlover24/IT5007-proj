const axios = require( 'axios' );
let Ticker = require( '../models/ticker.model' );
const router = require( 'express' ).Router();
var request = require( 'request' );
const passport = require( "passport" );


router.get(
  "/getNews",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      console.log( `In router.get(/getNews, ...).` );

      /* Get list of tickers that user subscribes to. */
      console.log( `Printing req.user._id: ${req.user._id}` );
      const mongoRes = await Ticker.find(
        { userId: req.user._id },
      );
      console.log( "mongoRes: ", mongoRes );

      /* Iterate through results in mongoRes. */
      const tickers = [];
      mongoRes.forEach( ( ticker, i_ticker ) => {
        tickers.push( ticker[ 'tickerSymbol' ] );
      } );
      console.log( `tickers: ${tickers}` );

      /* 
      Check if news for ticker up to viewingMonth is available in MongoDB.
      Request from API for those that are not, 
      sorted first by report date, 
      then by ticker symbol.
      */
      const apiRes = {};
      const apiResRequest = {};
      for ( const ticker of tickers ) {
        apiRes[ticker] = await axios.get(
          `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${process.env.VANTAGE_KEY}`
        );

        console.log(`LogApiRes for ${ticker}\n`, apiRes[ticker].data.quarterlyReports);
      }

      /* Sort by date up to viewingMonth. */
      const reports = []
      for (const ticker in apiRes) {
        for (const quarterlyReport in apiRes[ticker]) {
          // console.log("quarterly report");
        }
      }

      /* Return to data user. */

      /* Return late */
      return res.status( 200 ).json( "getNewsResponse" );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.get( '/getNews', async ( req, res ) => {
  try {
    console.log( "news.router.js:router.get:/getNews" );

    /* Get list of tickers from watchlist and portfolio. */

    var url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=TSLA&apikey=process.env.VANTAGE_KEY`;

    request.get( {
      url: url,
      json: true,
      headers: { 'User-Agent': 'request' }
    }, ( err, res, data ) => {
      if ( err ) {
        console.log( 'Error:', err );
      } else if ( res.statusCode !== 200 ) {
        console.log( 'Status:', res.statusCode );
      } else {
        // data is successfully parsed as a JSON object:
        console.log( data );
      }
    } );
  } catch ( err ) {
    return res.status( 500 ).json( { Error: err } );

  }
} );


module.exports = router;