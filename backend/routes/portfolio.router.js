const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_PORTFOLIO_ROUTER = ( process.env.LOG_PORTFOLIO_ROUTER == 'true' ) ? true : false;


let Trade = require( '../models/trade.model' );
const router = require( 'express' ).Router();
const { getQuoteWithCaching } = require( './utils/commonDbOps' );

const getTrades = async ( req ) => {
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
  return trades;
};

const getHoldings = async ( req, trades ) => {


  const holdings = {};
  const tradesReversed = trades.slice().reverse();
  for ( let trade of tradesReversed ) {
    console.log( "Iterating trade.tickerSymbol: ", trade.tickerSymbol );
    console.log( "holdings: ", holdings );

    /* 
    Get market price as at req.user.viewingMonth 
      - Check if data is in MongoDB first.
      - Only go to API if data is not in MongoDB.
    */
    let quote;
    if ( trade.tickerSymbol === "US-DOLLAR" ) {
      quote = "1.0";
    }
    if ( trade.tickerSymbol !== "US-DOLLAR" ) {
      quote = await getQuoteWithCaching( trade.tickerSymbol, req.user.viewingMonth );
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
        currentPricePerUnit: parseFloat( quote ),
        currentValue: directionSign * trade.quantity * parseFloat( quote ),
      };

    }
  }

  if ( LOG && LOG_PORTFOLIO_ROUTER ) {
    console.log( "holdings: ", holdings );
  }
  return holdings;
};
router.post( '/getTrades', async ( req, res ) => {
  try {
    let trades = await getTrades( req );
    let holdings = await getHoldings( req, trades );

    /* Compute total portfolio value. */
    let portfolioValue = 0.0;
    for ( let holdingKey in holdings ) {
      portfolioValue += holdings[ holdingKey ][ "currentValue" ];
    }

    let collatedData = {
      trades: trades,
      holdings: holdings,
      portfolioValue: portfolioValue,
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