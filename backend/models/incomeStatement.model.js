const mongoose = require( 'mongoose' );

const Schema = mongoose.Schema;

const incomeStatementSchema = new Schema( {
    tickerSymbol: {
        type: String,
        uppercase: true,
        required: true,
        trim: true,
    },
    fiscalDateEnding: {
        type: String,
        required: true,
    },
	reportedCurrency: {
		type: String,
		required: true,
	}, 
	grossProfit: {
		type: String,
		required: true,
	}, 
	totalRevenue: {
		type: String,
		required: true,
	},
	netIncome: {
		type: String,
		required: true,
	}
} );

const IncomeStatement = mongoose.model( 'IncomeStatement', incomeStatementSchema );
module.exports = IncomeStatement;