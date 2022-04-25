const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const tradeSchema = new Schema( {
    yearMonth: {
        type: String,
        required: true,
    },
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
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        trim: true,
    },
    isInit: {
        type: Boolean,
        default: false,
    }

} );

const Trade = mongoose.model( 'Trade', tradeSchema );
module.exports = Trade;