const router = require( "express" ).Router();
let User = require( "../models/user.model" );
const bcrypt = require( "bcryptjs" );
const jwt = require( "jsonwebtoken" );
const passport = require( "passport" );

const LOG = ( process.env.LOG == 'true' ) ? true : false;
const LOG_USER = ( process.env.LOG_USER == 'true' ) ? true : false;

const earliestMonth = process.env.EARLIEST_MONTH;

const strToYearMonth = ( yearMonthStr ) => {
  const year = parseInt( yearMonthStr.slice( 0, 4 ) );
  const month = parseInt( yearMonthStr.slice( 5, 7 ) );
  return { year: year, month: month };
};

const yearMonthToStr = ( yearMonth ) => {
  const yearMonthStr = String( yearMonth.year ) + '-' + String( yearMonth.month ).padStart( 2, "0" );
  return yearMonthStr;
};

const getCurrYearMonth = () => {
  const currYear = new Date().getFullYear();
  const currMonth = new Date().getMonth();
  return { year: currYear, month: currMonth };
};

const incrementMonth = ( currYearMonth ) => {
  if ( LOG && LOG_USER ) console.log( `In incrementMonth. currYearMonth.year = ${currYearMonth.year}, currYearMonth.month = ${currYearMonth.month}.` );

  return ( currYearMonth.month < 12 ) ?
    { year: currYearMonth.year, month: currYearMonth.month + 1 } :
    { year: currYearMonth.year + 1, month: 1 };
};

const incrementQuarter = (currYearMonth) => {
  return incrementMonth(
    incrmentMonth(
      incrementMonth(
        currYearMonth
      )
    )
  );
}

const decrementMonth = ( currYearMonth ) => {
  if ( LOG && LOG_USER ) console.log( `In incrementMonth. currYearMonth.year = ${currYearMonth.year}, currYearMonth.month = ${currYearMonth.month}.` );

  return ( currYearMonth.month > 1 ) ?
    { year: currYearMonth.year, month: currYearMonth.month - 1 } :
    { year: currYearMonth.year - 1, month: 12 };
};

const decrementQuarter = (currYearMonth) => {
  return decrementMonth(
    decrementMonth(
      decrementMonth(
        currYearMonth
      )
    )
  );
}

const lessThanOrEqual = ( yearMonth1, yearMonth2 ) => {
  return yearMonth1.year * 100 + yearMonth1.month <= yearMonth2.year * 100 + yearMonth2.month;
};

router.get(
  "/isAuthenticated",
  passport.authenticate( "jwt", { session: false } ),
  ( req, res ) => {
    return res.status( 200 ).json( true );
  }
);

router.get( "/test", ( req, res ) => {
  if ( req.isAuthenticated() ) {
    return res.status( 200 ).json( true );
  } else {
    return res.status( 200 ).json( false );
  }
} );

router.post( "/login", async ( req, res ) => {
  try {
    if (LOG && LOG_USER) {console.log("/login received req: ", req)};
    const { username, password } = req.body;
    if ( !username || !password ) {
      return res
        .status( 400 )
        .json( { Error: "Not all fields have been entered" } );
    }
    User.findOne( { username: username } ).then( user => {
      if ( !user ) {
        return res.status( 400 ).json( { Error: "Invalid Login" } );
      }
      bcrypt.compare( password, user.password ).then( isMatch => {
        if ( isMatch ) {
          const payload = {
            username: user.username,
            id: user._id,
          };
          const token =
            "Bearer " +
            jwt.sign( payload, process.env.SECRET_KEY, { expiresIn: 43200 } );

          return res.status( 200 ).json( { token, payload } );
        } else {
          return res.status( 400 ).json( { Error: "Invalid Login" } );
        }
      } );
    } );
  } catch ( err ) {
    return res.status( 500 ).json( { Error: err } );
  }
} );

router.post( "/register", async ( req, res ) => {
  try {
    let { username, password, confirmPassword } = req.body;
    if ( !username || !password || !confirmPassword ) {
      return res.status( 400 ).json( { Error: "Not all fields entered" } );
    }
    if ( username.length < 3 ) {
      return res
        .status( 400 )
        .json( { Error: "Username is not atleast 3 characters long" } );
    }
    if ( password.length < 8 ) {
      return res
        .status( 400 )
        .json( { Error: "Password is not atleast 8 characters long" } );
    }
    if ( password !== confirmPassword ) {
      return res.status( 400 ).json( { Error: "Passwords do not match" } );
    }
    const isTaken = await User.findOne( { username: username } );
    if ( isTaken ) {
      return res.status( 400 ).json( { Error: "Username is taken" } );
    }
    const salt = await bcrypt.genSalt( 12 );
    const hashedPassword = await bcrypt.hash( password, salt );

    const newUser = new User( {
      username,
      password: hashedPassword,
      beginMonth: earliestMonth,
      latestMonth: earliestMonth,
      viewingMonth: earliestMonth,
    } );

    newUser
      .save()
      .then( user => res.json( { user: user } ) )
      .catch( err => res.status( 400 ).json( { Error: err } ) );
  } catch ( err ) {
    return res.status( 500 ).json( { Error: err } );
  }
} );

router.get(
  "/getBeginMonth",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      if ( LOG && LOG_USER ) console.log( "req.user" );
      if ( LOG && LOG_USER ) console.log( req.user );
      const beginMonth = await User.findOne(
        { username: req.user.username },
        { beginMonth: 1, _id: 0 }
      );
      if ( LOG && LOG_USER ) console.log( "beginMonth" );
      if ( LOG && LOG_USER ) console.log( beginMonth );
      return res.status( 200 ).json( beginMonth );
    } catch ( err ) {
      if ( LOG && LOG_USER ) console.log( `Error: ${err}` );
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.get(
  "/getLatestMonth",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      const mongoRes = await User.findOne(
        { username: req.user.username },
        { latestMonth: 1, _id: 0 }
      );
      if ( LOG && LOG_USER ) console.log( mongoRes );
      return res.status( 200 ).json( mongoRes );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.get(
  "/getViewingMonth",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      const mongoRes = await User.findOne(
        { username: req.user.username },
        { viewingMonth: 1, _id: 0 }
      );
      if ( LOG && LOG_USER ) console.log( mongoRes );
      return res.status( 200 ).json( mongoRes );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.post(
  "/viewPreviousQuarter",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      if ( LOG && LOG_USER ) console.log( "In router.post(viewPreviousMonth...)" );

      /* Get current viewingMonth from MongoDB. */
      const mongoRes = await User.findOne(
        { username: req.user.username },
        { viewingMonth: 1, _id: 0 }
      );
      if ( LOG && LOG_USER ) console.log( mongoRes );
      if ( LOG && LOG_USER ) console.log( `mongoRes.viewingMonth: ${mongoRes.viewingMonth}` );
      if ( LOG && LOG_USER ) console.log( `earliestMonth: ${earliestMonth}` );

      /* Decrement viewingMonth by quarter. */
      const currViewingMonth = strToYearMonth( mongoRes.viewingMonth );
      const prevViewingMonth = decrementQuarter( currViewingMonth );
      if ( LOG && LOG_USER ) console.log( `prevViewingMonth: ${prevViewingMonth.year} ${prevViewingMonth.month}` );
      const prevViewingMonthChecked = lessThanOrEqual( strToYearMonth( earliestMonth ), prevViewingMonth ) ? prevViewingMonth : currViewingMonth;
      const prevViewingMonthCheckedStr = yearMonthToStr( prevViewingMonthChecked );
      if ( LOG && LOG_USER ) console.log( `prevViewingMonthCheckedStr: ${prevViewingMonthCheckedStr}` );

      /* Update viewingMonth in User MongoDB database. */
      await User.findOneAndUpdate(
        { username: req.user.username },
        { viewingMonth: prevViewingMonthCheckedStr },
        ( err, doc ) => {
          if ( err ) {
            console.error( "In router.post(/viewPreviousQuarter, ...), failed to update viewingMonth." );
            throw ( err );
          }
        }
      );

      /* Send updated viewingMonth to client if MongoDB update successful */
      return res.status( 200 ).json( { "prevViewingMonth": prevViewingMonthCheckedStr } );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.post(
  "/viewNextQuarter",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      if ( LOG && LOG_USER ) console.log( "In router.post(viewNextMonth...)" );

      /* Get current viewingMonth and latestMonth from MongoDB. */
      const mongoRes = await User.findOne(
        { username: req.user.username },
        { viewingMonth: 1, latestMonth: 1, _id: 0 }
      );
      if ( LOG && LOG_USER ) console.log( mongoRes );
      if ( LOG && LOG_USER ) console.log( `mongoRes.viewingMonth: ${mongoRes.viewingMonth}` );
      if ( LOG && LOG_USER ) console.log( `mongoRes.latestMonth: ${mongoRes.viewingMonth}` );

      /* Increment viewingMonth by quarter. */
      const currViewingMonth = strToYearMonth( mongoRes.viewingMonth );
      if ( LOG && LOG_USER ) console.log( `currViewingMonth.year: ${currViewingMonth.year}, currViewingMonth.month: ${currViewingMonth.month}` );
      const nextViewingMonth = incrementQuarter( currViewingMonth );
      if ( LOG && LOG_USER ) console.log( `nextViewingMonth.year: ${nextViewingMonth.year}, nextViewingMonth.month: ${nextViewingMonth.month}` );
      const latestMonth = strToYearMonth( mongoRes.latestMonth );
      if ( LOG && LOG_USER ) console.log( `latestMonth.year: ${latestMonth.year}, latestMonth.month: ${latestMonth.month}` );
      const nextViewingMonthChecked = lessThanOrEqual( nextViewingMonth, latestMonth ) ? nextViewingMonth : currViewingMonth;
      const nextViewingMonthCheckedStr = yearMonthToStr( nextViewingMonthChecked );
      if ( LOG && LOG_USER ) console.log( `nextViewingMonthCheckedStr: ${nextViewingMonthCheckedStr}` );

      /* Update viewingMonth in User MongoDB database. */
      await User.findOneAndUpdate(
        { username: req.user.username },
        { viewingMonth: nextViewingMonthCheckedStr },
        ( err, doc ) => {
          if ( err ) {
            console.error( "In router.post(/viewNextQuarter, ...), failed to update viewingMonth." );
            throw ( err );
          }
        }
      );

      /* Send updated viewingMonth to client if MongoDB update successful */
      return res.status( 200 ).json( { "nextViewingMonth": nextViewingMonthCheckedStr } );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.post(
  "/forwardOneQuarter",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      const mongoRes = await User.findOne(
        { username: req.user.username },
        { latestMonth: 1, _id: 0 }
      );

      console.log( `In router.post(/forwardOneQuarter, ...), mongoRes.latestMonth = ${mongoRes.latestMonth}` );

      /* Try incrementing latestMonth to incLatestMonth. */
      const latestMonth = strToYearMonth( mongoRes.latestMonth );
      const incLatestMonth = incrementQuarter( latestMonth );
      if ( LOG && LOG_USER ) console.log( `In router.post(/forwardOneMonth, ...), incLatestMonth = ${incLatestMonth}` );
      const currYearMonth = getCurrYearMonth();
      const incLatestMonthChecked = lessThanOrEqual( incLatestMonth, currYearMonth ) ? incLatestMonth : latestMonth;
      const incLatestMonthCheckedStr = yearMonthToStr( incLatestMonthChecked );

      /* Update in database. */
      await User.findOneAndUpdate(
        { username: req.user.username },
        { latestMonth: incLatestMonthCheckedStr },
        ( err, doc ) => {
          if ( err ) {
            console.error( "In router.post(/viewNextQuarter, ...), failed to update viewingMonth." );
            throw ( err );
          }
        }
      );

      /* Return late */
      return res.status( 200 ).json( incLatestMonthCheckedStr );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

module.exports = router;
