
const LOG = ( process.env.LOG === 'true' ) ? true : false;
const LOG_UTILS = ( process.env.LOG_TRADE_ROUTER === 'true' ) ? true : false;
const LOG_UTILS_GET_QUOTE = ( process.env.LOG_TRADE_ROUTER_GET_QUOTE === 'true' ) ? true : false;


const axios = require( 'axios' );
let Quote = require( '../../models/quote.model' );

async function getQuoteWithCaching( tickerSymbol, yearMonth ) {
	if ( LOG && LOG_UTILS ) {
		console.log( `in getQuoteWithCaching(${tickerSymbol}, ${yearMonth})` );
	}

	let dbQuote = await Quote.findOne(
		{
			tickerSymbol: tickerSymbol,
			yearMonth: yearMonth,
		}
	);
	if ( LOG && LOG_UTILS ) {
		console.log( `dbQuote: `, dbQuote );
	}

	/* Got quote from database, return value */
	if ( dbQuote ) {
		if ( LOG && LOG_UTILS && LOG_UTILS_GET_QUOTE ) {
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

module.exports = { getQuoteWithCaching };