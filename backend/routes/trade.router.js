const LOG = ( process.env.LOG === 'true' ) ? true : false;
const LOG_TRADE_ROUTER = ( process.env.LOG_TRADE_ROUTER === 'true' ) ? true : false;
const LOG_TRADE_ROUTER_GET_QUOTE = ( process.env.LOG_TRADE_ROUTER_GET_QUOTE === 'true' ) ? true : false;
const LOG_UPDATE_HOLDINGS = ( process.env.LOG_UPDATE_HOLDINGS === 'true' ) ? true : false;

const axios = require( 'axios' );
let Trade = require( '../models/trade.model' );
const router = require( 'express' ).Router();


const submitTradeMiddleware = async ( req, res, next ) => {
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
          quantity: -directionSign * price * quantity,
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
            req.newTradeCashStatus = "success";
            // return res.json( { message: "success" } );
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

  next();
};

async function updateHoldings( req, res, next ) {
  if ( LOG && LOG_TRADE_ROUTER && LOG_UPDATE_HOLDINGS ) {
    console.log( "In middleware updateHoldings" );
    console.log( "req.newTradeCashStatus: ", req.newTradeCashStatus );
    console.log( "Sending req.newTradeCashStatus: ", req.newTradeCashStatus );
  }
  res.send( req.newTradeCashStatus );
}
router.get( '/getHistory', async ( req, res ) => {
  const transactions = await Transaction.find( { userId: req.user._id } );
  return res.json( transactions );
} );

router.post( '/submitTrade', submitTradeMiddleware, updateHoldings );


router.post( '/getQuote', async ( req, res ) => {
  try {
    if ( LOG && LOG_TRADE_ROUTER && LOG_TRADE_ROUTER_GET_QUOTE ) {
      console.log( "req.user: ", req.user );
      console.log( "userId: ", req.user._id );
      console.log( "Received request at /getQuote, req.body: ", req.body );
    }


    let { tickerSymbol } = req.body;
    if ( !tickerSymbol ) {
      return res.status( 400 ).json( { Error: "Not all fields for submitting trade have been entered." } );
    }

    let apiUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=' +
      tickerSymbol +
      '&datatype=json' +
      '&apikey=' +
      process.env.VANTAGE_KEY;

    if ( LOG && LOG_TRADE_ROUTER ) {
      console.log( "tickerSymbol: ", tickerSymbol );
      console.log( "apiUrl: ", apiUrl );
    }


    let filteredRes = await axios
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

    if ( LOG && LOG_TRADE_ROUTER && LOG_TRADE_ROUTER_GET_QUOTE ) {
      console.log( "filteredRes: ", filteredRes );
    }

    return res.json( filteredRes );
  }

  catch ( err ) {
    return res.status( 500 ).json( { Error: err } );

  }

} );



module.exports = router;