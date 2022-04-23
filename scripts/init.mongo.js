/* 
Run `mongo time-travel-stock-simulator scripts/init.mongo.js` to initialize database.
*/

/* users collection */
db.users.remove({});
const initUsers = [{
	username: "initUser",
	password: "kljlkajdsfkljw122318",
	beginMonth: "2014-06",
	latestMonth: "2014-06",
	viewingMonth: "2014-06"
}];
db.users.insertMany(initUsers);


/* trades collection */
db.trades.remove({});
const initTrades = [{
	userId: "initUserId", 
	tickerSymbol: "initTickerSymbol",
	direction: "BUY",
	price: "1.0",
	quantity: "1",
	yearMonth: "2014-06",
}];
db.trades.insertMany(initTrades);


/* tickers collection */
db.tickers.remove({});
const initTickers = [{
	userId: "initUserId", 
	tickerSymbol: "initTickerSymbol",
	inPorfolio: "true",
}];
db.tickers.insertMany(initTickers);

/* incomestatements collection */
db.incomestatements.remove({});
const initIncomeStatements = [{
	tickerSymbol: "initTickerSymbol",
	fiscalDateEnding: "2014-06",
	reportedCurrency: "USD",
	grossProfit: "1",
	totalRevenue: "1",
	netIncome: "1",
}];
db.incomestatements.insertMany(initIncomeStatements);