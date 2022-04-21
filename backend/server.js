const express = require( 'express' );
const cors = require( 'cors' );
const mongoose = require( 'mongoose' );
const bodyparser = require( 'body-parser' );
const passport = require( 'passport' );

require( 'dotenv' ).config();
const router = require( 'express' ).Router();

const app = express();
const port = process.env.PORT || 5000;

app.use( cors() );
app.use( bodyparser.json() );
app.use( passport.initialize() );

require( './config/passport' )( passport );

const uri = process.env.MONGODB_URI;
mongoose.connect( uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false } );
const connection = mongoose.connection;
connection.once( 'open', () => {
    console.log( "Mongo database connection established successfully" );
} );

const usersRouter = require( './routes/users' );
app.use( '/api/users', usersRouter );

const tradeRouter = require( './routes/trade.router' );
app.use( '/api/protected/trade', passport.authenticate( 'jwt', { session: false } ), tradeRouter );

const watchlistRouter = require( './routes/watchlist.router' );
app.use( '/api/protected/watchlist', passport.authenticate( 'jwt', { session: false } ), watchlistRouter );

const portfolioRouter = require( './routes/portfolio.router' );
app.use( '/api/protected/portfolio', passport.authenticate( 'jwt', { session: false } ), portfolioRouter );

const newsRouter = require( './routes/news.router' );
app.use( '/api/protected/news', passport.authenticate( 'jwt', { session: false } ), newsRouter );

app.listen( port, () => {
    console.log( 'Server is running on port: ' + port );
} );


