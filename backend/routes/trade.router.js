const LOG = ( process.env.LOG === 'true' ) ? true : false;
const LOG_TRADE_ROUTER = ( process.env.LOG_TRADE_ROUTER === 'true' ) ? true : false;

const router = require( 'express' ).Router();
let Trade = require( '../models/trade.model' );
const { getQuoteWithCaching } = require( './utils/commonDbOps' );



router.post( '/submitTrade', async ( req, res ) => {
  try {
    if ( LOG && LOG_TRADE_ROUTER ) {
      console.log( "In submitTradeMiddleware" );
      console.log( "req.user: ", req.user );
      console.log( "userId: ", req.user._id );
      console.log( "Received request at /submitTrade, req.body: ", req.body );
    }


    /* Input parsing and validation. */
    let { tickerSymbol, price, quantity, direction } = req.body;
    if ( !tickerSymbol || !price || !quantity || !direction ) {
      return res.status( 400 ).json( { Error: "Not all fields for submitting trade have been entered." } );
    }
    if ( !( direction === "BUY" || direction === "SELL" ) ) {
      return res.status( 400 ).json( { Error: "Direction field must be BUY or SELL." } );
    }
    let directionSign = ( direction === "BUY" ) ? 1 : -1;
    try {
      price = parseInt( price );
      quantity = parseInt( quantity );
    }
    catch ( err ) {
      console.log( "Error in router.post(/submitTrade,...) while input parsing and validation", err );
      return res.status( 400 ).json( { Error: "Error parsing input price or quantity for trade." } );
    }

    let newTrade = new Trade(
      {
        userId: req.user._id,
        yearMonth: req.user.latestMonth,
        tickerSymbol,
        price,
        quantity,
        direction,
      }
    );

    if ( LOG && LOG_TRADE_ROUTER ) {
      console.log( "newTrade: ", newTrade );
    }

    await newTrade
      .save()
      .then( trade => {
        if ( LOG && LOG_TRADE_ROUTER ) {
          console.log( "newTrade.save() successful." );
          console.log( "trade: \n", trade );
        }
        if ( trade.tickerSymbol === "TESTFAILURE" ) {
          return res.status( 400 ).json( { Error: "TESTFAILURE returns failure" } );
        }
      } )
      .catch( err => {
        if ( LOG && LOG_TRADE_ROUTER ) {
          console.log( "newTrade.save() threw error:" );
          console.log( "err: \n", err );
        }
        return res.status( 400 ).json( { Error: err } );
      } );

    /* 
    Record offsetting change to cash balance.
      - Don't do so for ticker US-DOLLAR used for balance initialization.
     */
    if ( tickerSymbol !== "US-DOLLAR" ) {
      let newTradeCash = new Trade(
        {
          userId: req.user._id,
          yearMonth: req.user.latestMonth,
          tickerSymbol: "US-DOLLAR",
          price: 1.0,
          quantity: price * quantity,
          direction: ( direction === "BUY" ) ? "SELL" : "Buy",
        }
      );

      await newTradeCash
        .save()
        .then( trade => {
          if ( LOG && LOG_TRADE_ROUTER ) {
            console.log( "newTradeCash.save() successful." );
            console.log( "newTradeCash: \n", newTradeCash );
          }
          if ( trade.tickerSymbol === "TESTFAILURE" ) {
            return res.status( 400 ).json( { Error: "TESTFAILURE returns failure" } );
          }
          if ( trade.tickerSymbol !== "TESTFAILURE" ) {
            // req.newTradeCashStatus = "success";
            return res.json( { message: "success" } );
          }
        } )
        .catch( err => {
          if ( LOG && LOG_TRADE_ROUTER ) {
            console.log( "newTradeCash.save() threw error:" );
            console.log( "err: \n", err );
          }
          return res.status( 400 ).json( { Error: err } );
        } );
    }

  }

  catch ( err ) {
    return res.status( 500 ).json( { Error: err } );
  }
} );


router.post( '/getQuote', async ( req, res ) => {
  try {
    if ( LOG && LOG_TRADE_ROUTER ) {
      console.log(
        "Received request at /getQuote, req.body.tickerSymbol: ",
        req.body.tickerSymbol,
        "req.user.latestMonth: ",
        req.user.latestMonth
      );
    }


    let { tickerSymbol } = req.body;
    let { latestMonth } = req.user;
    if ( !tickerSymbol || !latestMonth ) {
      console.log( "in router.post(/getQuote): !tickerSymbol || !getLatestMonth" );
      return res.status( 400 ).json( { Error: "Not all fields for getting quote have been entered." } );
    }

    const getQuoteWithCachingRes = await getQuoteWithCaching( tickerSymbol, latestMonth );
    if ( LOG && LOG_TRADE_ROUTER ) {

      console.log( `getQuoteWithCaching(${tickerSymbol}, $latestMonth}): `, getQuoteWithCachingRes );
    }

    return res.json( getQuoteWithCachingRes );
  }

  catch ( err ) {
    return res.status( 500 ).json( { Error: err } );

  }

} );



module.exports = router;