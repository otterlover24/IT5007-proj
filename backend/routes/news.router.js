const axios = require( 'axios' );
let Ticker = require( '../models/ticker.model' );
let IncomeStatement = require( '../models/incomeStatement.model' );
const router = require( 'express' ).Router();
var request = require( 'request' );
const passport = require( "passport" );

const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_NEWS_ROUTER = ( process.env.LOG_NEWS_ROUTER == 'true' ) ? true : false;

router.get(
  "/getNews",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      console.log( `In router.get(/getNews, ...).` );
      console.log( "req.user: ", req.user );

      /* Get viewingMonth for user. */
      const viewingMonthRes = await User.findOne(
        { username: req.user.username },
        { viewingMonth: 1, _id: 0 }
      );
      if ( LOG && LOG_NEWS_ROUTER ) console.log( "viewingMonthRes: ", viewingMonthRes );
      const viewingMonth = viewingMonthRes.viewingMonth;
      if ( LOG && LOG_NEWS_ROUTER ) console.log( `Got viewingMonth from MongoDB: ${viewingMonth}` );


      /* Get list of tickers that user subscribes to. */
      if ( LOG && LOG_NEWS_ROUTER ) console.log( `Printing req.user._id: ${req.user._id}` );
      const mongoRes = await Ticker.find(
        { userId: req.user._id },
      );
      if ( LOG && LOG_NEWS_ROUTER ) console.log( "mongoRes: ", mongoRes );

      /* Iterate through results in mongoRes. */
      const tickers = [];
      mongoRes.forEach( ( ticker, i_ticker ) => {
        tickers.push( ticker[ 'tickerSymbol' ] );
      } );
      if ( LOG && LOG_NEWS_ROUTER ) console.log( `tickers: ${tickers}` );

      /* 
      Check if news for ticker up to viewingMonth is available in MongoDB.
      Request from API for those that are not, 
      sorted first by report date,  
      then by ticker symbol.
      */
      const apiRes = {};
      for ( const ticker of tickers ) {
        if ( LOG && LOG_NEWS_ROUTER ) console.log( `Getting INCOME_STATEMENT data from AlphaVantage API for ${ticker}` );
        apiRes[ ticker ] = await axios.get(
          `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${process.env.VANTAGE_KEY}`
        );
      }
      if ( LOG && LOG_NEWS_ROUTER ) console.log( `Done getting INCOME_STATEMENT data for all tickers. ` );

      /* For tickers not in MongoDB, download from API and save to MongoDB. */
      const incomeStatementReports = [];
      for ( const ticker of tickers ) {
        if ( LOG && LOG_NEWS_ROUTER ) console.log( `Adding ${ticker} to incomeStatementReports.` );
        for ( const quarterlyReport of apiRes[ ticker ].data.quarterlyReports ) {
          if ( LOG && LOG_NEWS_ROUTER ) console.log( "quarterlyReport: ", quarterlyReport.fiscalDateEnding, quarterlyReport.grossProfit );
          const incomeStatementReport = new IncomeStatement( {
            tickerSymbol: ticker,
            fiscalDateEnding: quarterlyReport.fiscalDateEnding,
            reportedCurrency: quarterlyReport.reportedCurrency,
            grossProfit: quarterlyReport.grossProfit,
            totalRevenue: quarterlyReport.totalRevenue,
            netIncome: quarterlyReport.netIncome
          } );
          if ( LOG && LOG_NEWS_ROUTER ) console.log( "Income statement report created: ", incomeStatementReport.tickerSymbol, incomeStatementReport.fiscalDateEnding );
          incomeStatementReports.push( incomeStatementReport );
          incomeStatementReport.save();
        }
      }

      /* Request data from MongoDB to sort by date up to viewingMonth. */
      const incomeStatementFromDb = await IncomeStatement.find( {
        "tickerSymbol": {
          "$in": tickers,
        },
        "fiscalDateEnding": {
          "$lte": viewingMonth,
        }
      } );
      if ( LOG && LOG_NEWS_ROUTER ) console.log( "Got tickers from IncomeStatement collection: ", incomeStatementFromDb );

      /* Return to data user. */
      return res.status( 200 ).json( "getNewsResponse" );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.get( '/getNews', async ( req, res ) => {
  try {
    if ( LOG && LOG_NEWS_ROUTER ) console.log( "news.router.js:router.get:/getNews" );

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