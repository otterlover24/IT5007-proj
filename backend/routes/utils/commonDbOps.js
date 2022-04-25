
const LOG = ( process.env.LOG === 'true' ) ? true : false;
const LOG_UTILS = ( process.env.LOG_TRADE_ROUTER === 'true' ) ? true : false;
const LOG_UTILS_GET_QUOTE = ( process.env.LOG_TRADE_ROUTER_GET_QUOTE === 'true' ) ? true : false;


const axios = require( 'axios' );
let Quote = require( '../../models/quote.model' );
let Trade = require( '../../models/trade.model' );

async function getQuoteWithCaching( tickerSymbol, yearMonth ) {
	if ( false && LOG && LOG_UTILS ) {
		console.log( `in getQuoteWithCaching(${tickerSymbol}, ${yearMonth})` );
	}

	let dbQuote = await Quote.findOne(
		{
			tickerSymbol: tickerSymbol,
			yearMonth: yearMonth,
		}
	);
	if ( false && LOG && LOG_UTILS ) {
		console.log( `dbQuote: `, dbQuote );
	}

	/* Got quote from database, return value */
	if ( dbQuote ) {
		if ( false && LOG && LOG_UTILS && LOG_UTILS_GET_QUOTE ) {
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
		if ( LOG && LOG_UTILS ) {
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

		if ( LOG && LOG_UTILS ) {
			console.log( `Got apiRes.data['Monthly Adjusted Time Series'] from API: `, apiRes.data[ 'Monthly Adjusted Time Series' ] );
		}

		for ( let property in apiRes.data[ 'Monthly Adjusted Time Series' ] ) {
			if ( false && LOG && LOG_UTILS ) {
				console.log( `property: `, property );
			}
			let apiYearMonth = property.slice( 0, 7 );
			let apiPrice = apiRes.data[ 'Monthly Adjusted Time Series' ][ property ][ '5. adjusted close' ];
			let quoteUpdate = {
				tickerSymbol: tickerSymbol,
				yearMonth: apiYearMonth,
				price: parseFloat( apiPrice ),
			};


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

		}


		/* Get relevant result from quotes colleciton */
		let quoteFromDb = await Quote
			.findOne(
				{
					"tickerSymbol": tickerSymbol,
					"yearMonth": yearMonth
				}
			);


		if ( LOG && LOG_UTILS ) {
			console.log( "Returning quoteFromDb.price: ", quoteFromDb.price );
		}

		return quoteFromDb.price;
	}
}

const getTrades = async ( userId, viewingMonth ) => {
	if ( LOG && LOG_UTILS ) {
		console.log( `In commonDBOps.getTrades(${userId}, ${viewingMonth})` );
	}

	const trades = await Trade
		.find(
			{
				userId: userId,
				yearMonth: { $lte: viewingMonth }

			}
		)
		.sort(
			{
				"yearMonth": "descending"
			}
		);
	if ( LOG && LOG_UTILS ) {
		console.log( "In portfolio.router /getTrades, received trades from DB: \n", trades );
	}
	return trades;
};

const getHoldings = async ( viewingMonth, trades ) => {
	const holdings = {};
	const tradesReversed = trades.slice().reverse();
	for ( let trade of tradesReversed ) {
		console.log( "Iterating trade.tickerSymbol: ", trade.tickerSymbol );
		console.log( "holdings: ", holdings );

		/* 
		Get market price as at req.user.viewingMonth 
		  - Check if data is in MongoDB first.
		  - Only go to API if data is not in MongoDB.
		*/
		let quote;
		if ( trade.tickerSymbol === "US-DOLLAR" ) {
			quote = "1.0";
		}
		if ( trade.tickerSymbol !== "US-DOLLAR" ) {
			quote = await getQuoteWithCaching( trade.tickerSymbol, viewingMonth );
		}


		let directionSign = ( trade.direction === "BUY" ) ? 1 : -1;
		if ( trade.tickerSymbol in holdings ) {
			holdings[ trade.tickerSymbol ][ "quantity" ] += directionSign * trade.quantity;
			holdings[trade.tickerSymbol]['currentValue'] = parseFloat(quote) * holdings[ trade.tickerSymbol ][ "quantity" ];
		}
		if ( !( trade.tickerSymbol in holdings ) ) {
			holdings[ trade.tickerSymbol ] = {
				tickerSymbol: trade.tickerSymbol,
				quantity: directionSign * trade.quantity,
				currentPricePerUnit: parseFloat( quote ),
				currentValue: parseFloat(quote) * directionSign * trade.quantity,
			};

		}
	}

	if ( LOG && LOG_UTILS ) {
		console.log( "holdings: ", holdings );
	}
	return holdings;
};
module.exports = { getQuoteWithCaching, getTrades, getHoldings };