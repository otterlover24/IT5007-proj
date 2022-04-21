# Time-travel Stock Picking Simulator
- API key just remove
- Fork off public repo, maybe even raise pull request.
- Set up meeting between 23-30th to demo working code
- Ideas for extension
	- Make it a game (multiplayer leaderboard)
		- Interface to search on google, but restrict information date.
			- Google has such an option.
## Deployment Instructions
- Run code in docker exposing `localhost:3000`.
- Run `npm install` to install the necessary node packages.
- Create a .env file in the backend folder to include the following configuration secrets (you may use the secrets I provided, but please keep the SECRET_KEY and VANTAGE_KEY confidential):
	- MONGODB_URI: URI of MongoDB database
	- SECRET: secret key used for password hasing 
	- VANTAGE_KEY: API key for Alpha Vantage.
- In `backend` folder, start the server via `node server.js`.
- In the `client` folder, run `npm start` to compile JSX to JS.
- Open the website in browser at URI `http://localhost:3000`.
- In the navbar, click on `Register` link and create new user.
- Log in as new user via the `Sign in` link on Navbar.
- You may view the page mockups for News, Trade, Watchlist, Porfolio pages.
- Watchlist page has been partially implemented. You may enter ticker to add to watchlist. The quotation will then be reflected in the table below. (You may have to refresh the page, I will fix this in the submission.)

## Notes to Tutor
- I had tried to learn AlphaVantage API requests, authentication, and charting but failed when I tried to put them together from scratch and that set me back by about a week. To meet this first stage submission deadline, I had to base my work off an existing working project and edit from there. The code here is modifed from a public domain Github project https://github.com/SaenthanP/Finance-Tool. You may also view the git logs to see the original and my subsequent changes.
- I wonder how much changes I have to make to avoid running afoul of plagarism rules or to not be penalized for initially starting off from someone else's project. I think there are many elements which will make the work substantially my own, as well as several other technical changes which I can make to make my work less derivative:
	- Element of time-travel simulation.
	- Element of relevant news.
	- Stock market instead of crypto.
	- Use `fetch` instead of `Axios` for API calls.
	- Use `HashRouter` instead of `react-router-dom`.
	- Use single GraphQL endpoint instead of interacting with multiple endpoints.
	- Use another charting library instead of `chart.js`.

## TS notes
- AlphaVantage API limits
	- 5 calls per minute, 500 calls per day
		- Restrict player to 5 securities
- Refer to
	- https://github.com/prediqtiv/alpha-vantage-cookbook
- Users
	- aaa / aaa12345
		- Users.viewingMonth messed up
	- bbb / bbb12345
		- Ticker database messed up as did not have isPortfolio field.
	- ccc / ccc11111
		- `latestMonth` not aligned to quarter
	- ddd / ddd11111
  
## TS TODO
- General
	- {DONE} Implements log levels to limit console.log output.  
	- Error handling:
		- Too many requests: `if (apiRes.data.Note)`
		- Error in request: `if apiRes.date["Error Message"])`
- Components / pages
	- Navbar
		- Responsive
		- Change page
		- Widget to change month
	- /
		- Landing page describing how to simulation works
	- /watchlist
		- {PARTLY DONE} Quotation of security as at `viewingMonth`
			- {DONE} Add ticker to watchlist of user
				- {DONE} Ensure no duplicates by using Mongoose `findOneAndUpdate()` using `upsert` option.
			- Check that ticker is valid
			- {DONE} Delete ticker from watchlist of user
			- Display current price of stocks on watchlist
				- {DONE} Get watchlist for user from server to client
				- {DONE} Fetch quote from AlphaVantage API
				- {DONE} Send API results to client at specific time point
				- {DONE} Display in table on client end in `watchlist.component.js`
				- {TODO} Buttons for adding or deleting to watchlist should also edit `watchlist` via setState and re-render table.
	- /portfolio
		- Line chart for net worth over time
			- {DONE} Mock data
			- Real data from MongoDB
		- Table of holdings and value for each security and total
		- {DONE} Table of transactions
			- {DONE} Request for transaction history
				- useEffect with empty dependency list to call `displayTransactions()` on load.
				- In portfolio.router.js, `async function displayTranactions()`
			- {DONE} Display transactions
		- Current holdings table
		- P&L chart
			- 
			- backend
				- Provide full transaction history
	- /trade
		- Form to buy or sell a specific ticker at market price
	- /news
		- Form to edit subscription
		- Securities in porfolio, watchlist, and aggregate indices automatically in subscription
		- See list of headlines, which link to articles
			- Articles may be new report, or data such as earnings, analyst rating etc
  


- Simulate time step
	- Month saved in MongoDB for each account.
	- Can view for past months, but only act on current month.
	- Range depends on max history from AlphaVantage.
		- 8 years + current date
		- Earliest is latest EOM - 8 years + 1 month
		- Set start of simulation to 2014-06-30 to be safe
			- When creating account, set month to 2014-06
		- Each account has 3 time variables, to be stored in users collection.
			- `beginMonth`: Beginning of simulation
			- `latestMonth`: Latest month
			- `viewingMonth`: Viewing month
	- Add widget with current month, back 1 month, back to beginning, forward 1 month, forward to most recent month to navbar.
		- {DONE} Navbar to get `beginMonth`, `latestMonth`, `viewingMonth` from server.
			- {FIXED} Why all undefined?
				- {SYMPTOM} MongoError: FieldPath cannot be constructed with empty string.
					- {HYPOTHESIS} Maybe sent over request when user was not yet logged in and therefore req._id variable was empty, and then MongoDB crashed.
						- {DONE, SOLUTION} navbar.component to only send request when logged in.
					- {HYPOTHESIS} _id not in user.model
						- {SOLUTION} search using uersname 
		- Buttons to forward `latestMonth` and to alter `viewingMonth` on navbar
		- {DONE} Change time-step to quarter
			- Change navbar buttons, function names, and API endpoints only.
	- /watchlist page display adjusted monthly closing price as at month
- Transactions
	- Buy
	- Sell

- Porfolio
	- Similar to watchlist
		- Compute P&L
		- Chart securities over time
  
- Compute P&L

- Fetch News
	- Find free financial news API
		- AlphaVantage has fundamentals
