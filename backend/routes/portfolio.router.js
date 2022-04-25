const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_PORTFOLIO_ROUTER = ( process.env.LOG_PORTFOLIO_ROUTER == 'true' ) ? true : false;


let Trade = require( '../models/trade.model' );
const router = require( 'express' ).Router();
const { getQuoteWithCaching, getTrades, getHoldings } = require( './utils/commonDbOps' );



router.post( '/getTrades', async ( req, res ) => {
  try {
    let trades = await getTrades( req.user._id, req.user.viewingMonth );
    let holdings = await getHoldings( req.user.viewingMonth, trades );

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