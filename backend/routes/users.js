const router = require( "express" ).Router();
let User = require( "../models/user.model" );
const bcrypt = require( "bcryptjs" );
const jwt = require( "jsonwebtoken" );
const passport = require( "passport" );

const earliestMonth = "2014-06";

const parseYearMonth = ( yearMonthStr ) => {
  const year = parseInt( yearMonthStr.slice( 0, 4 ) );
  const month = parseInt( yearMonthStr.slice( 5, 7 ) );
  return { year: year, month: month };
};

const yearMonthToStr = ( yearMonth ) => {
  return;
};

const getCurrYearMonth = () => {
  const currYear = new Date().getFullYear();
  const currMonth = new Date().getMonth();
  return { year: currYear, month: currMonth };
};

const incrementMonth = ( yearMonth ) => {
  console.log( `In incrementMonth. yearMonth= ${yearMonth}, typeof(yearMonth) = ${typeof ( yearMonth )}.` );
  const yearMonthSplit = yearMonth.split( "-" );
  const year = parseInt( yearMonthSplit[ 0 ] );
  const month = parseInt( yearMonthSplit[ 1 ] );
  console.log( `year: ${year}, month: ${month}` );

  if ( month < 12 ) {
    const nextYearMonthMonth = month + 1;
    const nextYearMonth = String( year ) + '-' + String( nextYearMonthMonth ).padStart( 2, '0' );
    console.log( `nextYearMonth: ${nextYearMonth}` );
    return nextYearMonth;
  }

  if ( month == 12 ) {
    const nextYearMonthMonth = 1;
    const nextYearMonthYear = year + 1;
    const nextYearMonth = String( nextYearMonthYear ) + '-' + String( nextYearMonthMonth ).padStart( 2, '0' );
    console.log( `nextYearMonth: ${nextYearMonth}` );
    return nextYearMonth;
  }
};

const lessThan = ( yearMonth1, yearMonth2 ) => {
  return yearMonth1.year * 100 + yearMonth1.month < yearMonth2.year * 100 + yearMonth2.month;
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
      console.log( "req.user" );
      console.log( req.user );
      const beginMonth = await User.findOne(
        { username: req.user.username },
        { beginMonth: 1, _id: 0 }
      );
      console.log( "beginMonth" );
      console.log( beginMonth );
      return res.status( 200 ).json( beginMonth );
    } catch ( err ) {
      console.log( `Error: ${err}` );
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
      console.log( mongoRes );
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
      console.log( mongoRes );
      return res.status( 200 ).json( mongoRes );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.post(
  "/viewPreviousMonth",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      const mongoRes = await User.findOne(
        { username: req.user.username },
        { viewingMonth: 1, _id: 0 }
      );
      console.log( mongoRes );
      return res.status( 200 ).json( mongoRes );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.post(
  "/viewNextMonth",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      console.log( "In router.post(viewNextMonth...)" );

      /* Get current viewingMonth from MongoDB. */
      const mongoRes = await User.findOne(
        { username: req.user.username },
        { viewingMonth: 1, _id: 0 }
      );
      console.log( mongoRes );
      console.log( `mongoRes.viewingMonth: ${mongoRes.viewingMonth}` );

      /* Increment viewingMonth. */
      const nextViewingMonth = incrementMonth( mongoRes.viewingMonth );
      console.log( `In router.post(viewNextMonth, ...), nextViewingMonth = ${nextViewingMonth}` );
      
      /* Update viewingMonth in User MongoDB database. */
      const mongoUpdateRes = await User.findOneAndUpdate(
        {username: req.user.username},
        {viewingMonth: nextViewingMonth}, 
        (err, doc) => {
          if (err) {
            console.error("In router.post(/viewNextMonth, ...), failed to update viewingMonth.");
            throw(err);
          }
        }
      );
      
      /* Send updated viewingMonth to client if MongoDB update successful */
      return res.status( 200 ).json( { "nextViewingMonth": nextViewingMonth } );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

router.post(
  "/forwardOneMonth",
  passport.authenticate( "jwt", { session: false } ),
  async ( req, res ) => {
    try {
      const mongoRes = await User.findOne(
        { username: req.user.username },
        { latestMonth: 1, _id: 0 }
      );

      console.log( mongoRes );
      const currYearMonth = getCurrYearMonth();
      console.log( currYearMonth );
      console.log( parseYearMonth( earliestMonth ) );
      return res.status( 200 ).json( viewingMonth );
    } catch ( err ) {
      return res.status( 500 ).json( { Error: err } );
    }
  }
);

module.exports = router;
