const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const tickerSchema = new Schema( {
    userId: {
        type: String,
        required: true,
        trim: true

    },
    tickerSymbol: {
        type: String,
        uppercase: true,
        required: true,
        trim: true,
    },
    inPortfolio: {
        type: Boolean,
        required: true,
    }
} );

const Ticker = mongoose.model( 'Ticker', tickerSchema );
module.exports = Ticker;