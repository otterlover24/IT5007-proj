const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_TRADE_ROUTER = ( process.env.LOG_TRADE_ROUTER == 'true' ) ? true : false;

let Trade = require( '../models/trade.model' );
const router = require( 'express' ).Router();


router.get( '/getHistory', async ( req, res ) => {
  const transactions = await Transaction.find( { userId: req.user._id } );
  return res.json( transactions );
} );

router.post( '/submitTrade', async ( req, res ) => {
  try {
    if ( LOG && LOG_TRADE_ROUTER ) {
      console.log( "req.user: ", req.user );
      console.log( "userId: ", req.user._id );
      console.log( "Received request at /submitTrade, req.body: ", req.body );
    }


    let { tickerSymbol, quantity, direction } = req.body;
    if ( !tickerSymbol || !quantity || !direction ) {
      return res.status( 400 ).json( { Error: "Not all fields for submitting trade have been entered." } );
    }

    let newTrade = new Trade(
      {
        userId: req.user._id,
        tickerSymbol,
        direction,
        quantity: parseInt( quantity ),
        yearMonth: req.user.latestMonth,
      }
    );
    if ( LOG && LOG_TRADE_ROUTER ) {
      console.log( "newTrade: ", newTrade );
    }

    newTrade.save()
      .then( trade => {
        if ( LOG && LOG_TRADE_ROUTER ) {
          console.log( "newTrade.save() successful." );
          console.log( "trade: \n", trade );
        }
        if (trade.tickerSymbol === "TESTFAILURE") {
          res.status(400).json({Error: "TESTFAILURE returns failure"});
        }
        if (trade.tickerSymbol !== "TESTFAILURE") {
          res.json( {message: "success"} );
        }
      } )
      .catch( err => {
        if ( LOG && LOG_TRADE_ROUTER ) {
          console.log( "newTrade.save() threw error:" );
          console.log( "err: \n", err );
        }
        res.status( 400 ).json( { Error: err } ) 
      });
  } catch ( err ) {
    return res.status( 500 ).json( { Error: err } );

  }

} );


module.exports = router;