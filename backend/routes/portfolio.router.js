const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_PORTFOLIO_ROUTER = ( process.env.LOG_PORTFOLIO_ROUTER == 'true' ) ? true : false;

const axios = require( 'axios' );
let Trade = require( '../models/trade.model' );
const router = require( 'express' ).Router();


router.post( '/getTrades', async ( req, res ) => {
  try {
    const trades = await Trade
      .find(
        {
          userId: req.user._id,
          yearMonth: { $lte: req.user.viewingMonth }

        }
      )
      .sort(
        {
          "yearMonth": "descending"
        }
      );
    if ( LOG && LOG_PORTFOLIO_ROUTER ) {
      console.log( "In portfolio.router /getTrades, received trades from DB: \n", trades );
    }

    const holdings = {};
    const tradesReversed = trades.slice().reverse();
    for ( let trade of tradesReversed ) {
      console.log( "Iterating trade.tickerSymbol: ", trade.tickerSymbol );
      console.log( "holdings: ", holdings );

      /* Get market price as at req.user.viewingMonth */
      let quote;
      if ( trade.tickerSymbol === "US-DOLLAR" ) {
        quote = "1.0";
      }
      if ( trade.tickerSymbol !== "US-DOLLAR" ) {
        let apiUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=' +
          trade.tickerSymbol +
          '&datatype=json' +
          '&apikey=' +
          process.env.VANTAGE_KEY;



        quote = await axios
          .get( apiUrl )
          .then( apiRes => {
            for ( const property in apiRes.data[ 'Monthly Adjusted Time Series' ] ) {
              console.log( "property: ", property );
              console.log( "property.slice(0, 7): ", property.slice( 0, 7 ) );
              console.log( "req.user.latestMonth: ", req.user.latestMonth );
              if ( property.slice( 0, 7 ) === req.user.latestMonth ) {
                return apiRes.data[ 'Monthly Adjusted Time Series' ][ property ][ '5. adjusted close' ];
              }
            }
            return;
          } );
      }


      let directionSign = ( trade.direction === "BUY" ) ? 1 : -1;
      if ( trade.tickerSymbol in holdings ) {
        console.log( "debug holdings[trade.tickerSymbol]: ", holdings[ trade.tickerSymbol ] );
        holdings[ trade.tickerSymbol ][ "quantity" ] += directionSign * trade.quantity;
      }
      if ( !( trade.tickerSymbol in holdings ) ) {
        holdings[ trade.tickerSymbol ] = {
          tickerSymbol: trade.tickerSymbol,
          quantity: directionSign * trade.quantity,
          currentPricePerUnit: parseFloat(quote),
          currentValue: directionSign * trade.quantity * parseFloat(quote),
        };

      }
    }



    if ( LOG && LOG_PORTFOLIO_ROUTER ) {
      console.log( "holdings: ", holdings );
    }

    let collatedData = {
      trades: trades,
      holdings: holdings
    };

    return res.json( collatedData );
  }
  catch ( err ) {
    if ( LOG && LOG_PORTFOLIO_ROUTER ) {
      console.log( "Error in portfolio.router.post('/getTrades, ...): \n", err );
    }
    return res.status( 500 ).json( { Error: err } );
  }
} );


router.post( '/updateHoldings', async ( req, res ) => {
  try {
    const trades = await Trade
      .find(
        {
          userId: req.user._id
        }
      )
      .sort(
        {
          "yearMonth": "descending"
        }
      );
    if ( LOG && LOG_PORTFOLIO_ROUTER ) {
      console.log( "In /getTrades, received trades from DB: \n", trades );
    }
    return res.json( trades );
  }
  catch ( err ) {
    if ( LOG && LOG_PORTFOLIO_ROUTER ) {
      console.log( "Error in portfolio.router.post('/getTrades, ...): \n", err );
    }
    return res.status( 500 ).json( { Error: err } );
  }
} );



module.exports = router;