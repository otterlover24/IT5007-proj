const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const tradeSchema = new Schema( {
    userId: {
        type: String,
        required: true,
        trim: true

    },
    tickerSymbol: {
        type: String,
        required: true,
        trim: true,

    },
    direction: {
        type: String,
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        required: true,
        trim: true,
    },
    yearMonth: {
        type: String,
        required: true,
    }
} );

const Trade = mongoose.model( 'Trade', tradeSchema );
module.exports = Trade;