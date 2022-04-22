const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_PORTFOLIO_ROUTER = ( process.env.LOG_PORTFOLIO_ROUTER == 'true' ) ? true : false;

let Trade = require( '../models/trade.model' );
const router = require( 'express' ).Router();


router.post( '/getTrades', async ( req, res ) => {
  try {
    const trades = await Trade
      .find(
        {
          userId: req.user._id,
          yearMonth: {$lte: req.user.viewingMonth}
          
        }
      )
      .sort(
        {
          "yearMonth": "descending"
        }
      );
    if (LOG && LOG_PORTFOLIO_ROUTER) {
      console.log("In portfolio.router /getTrades, received trades from DB: \n", trades);
    }

    const holdings = {};
    trades
      .slice()
      .reverse()
      .forEach((trade) => {
        console.log("Iterating trade: ", trade);
        let directionSign = (trade.direction === "BUY") ? 1 : -1;
        if (trade.tickerSymbol in holdings) {
          holdings[trade.tickerSymbol ] += directionSign * trade.quantity;
        }
        if (!(trade.tickerSymbol in holdings)) {
          holdings[trade.tickerSymbol ] = directionSign * trade.quantity;
        }
      })
    
      if (LOG && LOG_PORTFOLIO_ROUTER) {
        console.log("holdings: ", holdings);
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
    if (LOG && LOG_PORTFOLIO_ROUTER) {
      console.log("In /getTrades, received trades from DB: \n", trades);
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