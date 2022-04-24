const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const quoteSchema = new Schema( {
    tickerSymbol: {
        type: String,
        uppercase: true,
        required: true,
        trim: true,
    },
    yearMonth: {
        type: String,
        required: true,
    },
	price: {
		type: Number
	}
} );

const Quote = mongoose.model( 'Quote', quoteSchema );
module.exports = Quote;