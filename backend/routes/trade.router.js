const LOG = ( process.env.LOG === 'true' ) ? true : false;
const LOG_TRADE_ROUTER = ( process.env.LOG_TRADE_ROUTER === 'true' ) ? true : false;
const LOG_TRADE_ROUTER_GET_QUOTE = ( process.env.LOG_TRADE_ROUTER_GET_QUOTE === 'true' ) ? true : false;
const LOG_UPDATE_HOLDINGS = ( process.env.LOG_UPDATE_HOLDINGS === 'true' ) ? true : false;

const router = require( 'express' ).Router();
const axios = require( 'axios' );
let Trade = require( '../models/trade.model' );
let Quote = require( '../models/quote.model' );


async function getQuoteWithCaching( tickerSymbol, yearMonth ) {
  if ( LOG && LOG_TRADE_ROUTER ) {
    console.log( `in getQuoteWithCaching(${tickerSymbol}, ${yearMonth})` );
  }

  let dbQuote = await Quote.findOne(
    {
      tickerSymbol: tickerSymbol,
      yearMonth: yearMonth,
    }
  );
  if ( LOG && LOG_TRADE_ROUTER ) {
    console.log( `dbQuote: `, dbQuote );
  }

  /* Got quote from database, return value */
  if ( dbQuote ) {
    if ( LOG && LOG_TRADE_ROUTER && LOG_TRADE_ROUTER_GET_QUOTE ) {
      console.log( `Found quote for tickerSymbol ${tickerSymbol} in MongoDB.` );
      console.log( "Got from MongoDB dbQuote: ", dbQuote );
    }
    return dbQuote.price;
  }

  /* 
  No quote from database.
    - Make call to get quote from API. 
    - Save all results from API.
    - Return quote for yearMonth
  */
  if ( !dbQuote ) {
    if ( LOG && LOG_TRADE_ROUTER ) {
      console.log( `Did not find quote for tickerSymbol ${tickerSymbol} in MongoDB. Fetching from API.` );
    }

    let apiUrl = 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=' +
      tickerSymbol +
      '&datatype=json' +
      '&apikey=' +
      process.env.VANTAGE_KEY;


    /* Save results into quotes collection */
    let apiRes = await axios
      .get( apiUrl );

    if ( LOG && LOG_TRADE_ROUTER ) {
      console.log( `Got apiRes.data['Monthly Adjusted Time Series'] from API: `, apiRes.data[ 'Monthly Adjusted Time Series' ] );
    }

    for ( let property in apiRes.data[ 'Monthly Adjusted Time Series' ] ) {
      if ( LOG && LOG_TRADE_ROUTER ) {
        console.log( `property: `, property );
      }
      let apiYearMonth = property.slice( 0, 7 );
      let apiPrice = apiRes.data[ 'Monthly Adjusted Time Series' ][ property ][ '5. adjusted close' ];
      let quoteUpdate = {
        tickerSymbol: tickerSymbol,
        yearMonth: apiYearMonth,
        price: parseFloat( apiPrice ),
      };

      if ( LOG && LOG_TRADE_ROUTER && LOG_TRADE_ROUTER_GET_QUOTE ) {
        console.log( `Before await Quote.findOneAndUpdate, quoteUpdate: `, quoteUpdate );
      }
      let quoteUpdateDoc = await Quote.findOneAndUpdate(
        {
          tickerSymbol: tickerSymbol,
          yearMonth: apiYearMonth,
        },
        quoteUpdate,
        {
          new: true,
          upsert: true,
        }
      );
      console.log( "After Quote.findOneAndUpdate" );
      if ( LOG && LOG_TRADE_ROUTER ) {
        console.log("After findOneAndUpdate, in braces");
        console.log( "Updating MongoDB returned quoteUpdateDoc: ", quoteUpdateDoc );
      }

    }


    /* Get relevant result from quotes colleciton */
    let quoteFromDb = await Quote
      .findOne(
        {
          "tickerSymbol": tickerSymbol,
          "yearMonth": yearMonth
        }
      );


    if ( LOG && LOG_TRADE_ROUTER ) {
      console.log( "quoteFromDb: ", quoteFromDb );
    }

    return quoteFromDb.price;
  }
}

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