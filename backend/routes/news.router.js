const axios = require( 'axios' );
const router = require( 'express' ).Router();
var request = require( 'request' );
const passport = require( "passport" );
let Ticker = require( '../models/ticker.model' );
let User = require( "../models/user.model" );
let IncomeStatement = require( '../models/incomeStatement.model' );

const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_NEWS_ROUTER = ( process.env.LOG_NEWS_ROUTER == 'true' ) ? true : false;
const LOG_NEWS_ROUTER_FIND_ONE_AND_UPDATE = ( process.env.LOG_NEWS_ROUTER_FIND_ONE_AND_UPDATE == 'true' ) ? true : false;

router.get(
  "/getNews",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      console.log( `In router.get(/getNews, ...).` );
      console.log( "req.user: ", req.user );

      /* Get viewingMonth for user. */
      let viewingMonthRes = await User.findOne(
        { username: req.user.username },
        { viewingMonth: 1, _id: 0 }
      );
      if ( LOG && LOG_NEWS_ROUTER ) console.log( "viewingMonthRes: ", viewingMonthRes );
      let viewingMonth = viewingMonthRes.viewingMonth;
      if ( LOG && LOG_NEWS_ROUTER ) console.log( `Got viewingMonth from MongoDB: ${viewingMonth}` );


      /* Get list of tickers that user subscribes to. */
      if ( LOG && LOG_NEWS_ROUTER ) console.log( `Printing req.user._id: ${req.user._id}` );
      let mongoTickerRes = await Ticker.find(
        { userId: req.user._id },
      );

      /* 
      - Iterate through tickers in portfolio or watchlist contained in `mongoTickerRes`
        - Try to get reports up to `viewingMonth`
        - For ticker symbols with report up to `viewingMonth`:
          - Store tickerSymbol in `tickersWithEntryInDb` array.
        - For tickers without report up to `viewingMonth`:
          - Store tickerSymbol in `tickersWithoutEntryInDb` array.
        - Combine the two in allTickers array.
      */
      let tickersWithEntryInDb = [];
      let tickersWithoutEntryInDb = [];
      let allTickers = [];
      if ( LOG && LOG_NEWS_ROUTER ) console.log( "Before mongoTickerRes.forEach, mongoTickerRes = ", mongoTickerRes );
      for ( const ticker of mongoTickerRes ) {
        let tickerSymbol = ticker[ 'tickerSymbol' ];
        if ( LOG && LOG_NEWS_ROUTER ) console.log( "In mongoTickerRes.forEach loop. tickerSymbol: ", tickerSymbol, "viewingMonth: ", viewingMonth );
        let incomeStatementViewingMonthForTicker = await IncomeStatement.findOne(
          {
            tickerSymbol: tickerSymbol,
            fiscalDateEnding: viewingMonth,
          }
        );
        if ( LOG && LOG_NEWS_ROUTER ) console.log( "incomeStatementViewingMonthForTicker: ", incomeStatementViewingMonthForTicker );
        if ( incomeStatementViewingMonthForTicker ) {
          if ( LOG && LOG_NEWS_ROUTER ) console.log( `In truthy case, push ${tickerSymbol} to tickersWithEntryInDb` );
          tickersWithEntryInDb.push( tickerSymbol );
        }
        if ( !incomeStatementViewingMonthForTicker ) {
          if ( LOG && LOG_NEWS_ROUTER ) console.log( `In falsy case, push ${tickerSymbol} to tickersWithoutEntryInDb` );
          tickersWithoutEntryInDb.push( tickerSymbol );
        }
      }
      allTickers = tickersWithEntryInDb.concat(tickersWithoutEntryInDb);

      if ( LOG && LOG_NEWS_ROUTER ) {
        console.log( `After mongoTickerRes.forEach, tickersWithEntryInDb: ${tickersWithEntryInDb}` );
        console.log( `After mongoTickerRes.forEach, tickersWithoutEntryInDb: ${tickersWithoutEntryInDb}` );
        console.log( `After mongoTickerRes.forEach, allTickers: ${allTickers}` );
      }

      /* 
      For tickers in `tickersWithoutEntryInDb` without INCOME_STATEMENT data for viewing month:
        - download data from AlphaVantage API
        - use Mongoose `findOneAndUpdate()` with `upsert` option to avoid duplication or non-existent entry.
        - sorted income statement reports
            - first by report date,  
            - then by ticker symbol.
      */

      /* 
        - download data from AlphaVantage API
      */
      let apiRes = {};
      for ( let ticker of tickersWithoutEntryInDb ) {
        if ( LOG && LOG_NEWS_ROUTER ) console.log( `Getting INCOME_STATEMENT data from AlphaVantage API for ${ticker}` );
        apiRes[ ticker ] = await axios.get(
          `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${process.env.VANTAGE_KEY}`
        );
      }
      if ( LOG && LOG_NEWS_ROUTER ) console.log( `Done getting INCOME_STATEMENT data for all tickers. ` );

      /* 
        - use Mongoose `findOneAndUpdate()` with `upsert` option to avoid duplication or non-existent entry.
      */
      for ( let tickerSymbol of tickersWithoutEntryInDb ) {
        for ( let quarterlyReport of apiRes[ tickerSymbol ].data.quarterlyReports ) {
          if ( LOG && LOG_NEWS_ROUTER ) console.log( "quarterlyReport: ", quarterlyReport.fiscalDateEnding, quarterlyReport.grossProfit );
          let incomeStatementReportUpdate = {
            tickerSymbol: tickerSymbol,
            fiscalDateEnding: quarterlyReport.fiscalDateEnding.slice( 0, 7 ),
            reportedCurrency: quarterlyReport.reportedCurrency,
            grossProfit: quarterlyReport.grossProfit,
            totalRevenue: quarterlyReport.totalRevenue,
            netIncome: quarterlyReport.netIncome
          };

          let incomeStatementReportsDoc = await IncomeStatement.findOneAndUpdate(
            {
              tickerSymbol: incomeStatementReportUpdate.tickerSymbol,
              fiscalDateEnding: incomeStatementReportUpdate.fiscalDateEnding,
            },
            incomeStatementReportUpdate,
            {
              new: true,
              upsert: true
            }
          );
          if ( LOG && LOG_NEWS_ROUTER && LOG_NEWS_ROUTER_FIND_ONE_AND_UPDATE ) {
            console.log( "incomeStatmentReports" );
            console.log( incomeStatementReportsDoc );
          }
        }
      }



      /* 
        - sorted income statement reports
            - first by report date,  
            - then by ticker symbol.
      */
      let incomeStatementFromDb = await IncomeStatement
        .find( {
          "tickerSymbol": {
            "$in": allTickers,
          },
          "fiscalDateEnding": {
            "$lte": viewingMonth,
          }
        } )
        .sort(
          {
            "fiscalDateEnding": "descending",
          }
        )
      ;
      if ( LOG && LOG_NEWS_ROUTER ){
        console.log( "req.user: ", req.user );
        console.log( "Got tickers from IncomeStatement collection: ", incomeStatementFromDb );
      }

      /* Return to data user. */
      return res.status( 200 ).json( incomeStatementFromDb );
    } catch ( err ) {
      if (LOG && LOG_NEWS_ROUTER) {
        console.log("Error in router.get(/getNews, ...): \n", err);
      }
      return res.status( 500 ).json( { Error: err } );
    }
  }
);



module.exports = router;