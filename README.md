# Time-travel Stock Picking Simulator

### TS notes
- AlphaVantage API limits
	- 5 calls per minute, 500 calls per day
		- Restrict player to 5 securities
- Users
	- abc / abc12345
	- cde / cde12345
	- ace / ace12345
	- asd / asd12345
	- sdf / sdf12345
	- aes / aes12345
	- aaa / aaa12345

### TS TODO
- Components / pages
	- Navbar
		- Responsive
		- Change page
		- Widget to change month
	- /
		- Landing page describing how to simulation works
	- /watchlist
		- Quotation of security as at `viewingMonth`
	- /porfolio
		- Line chart for net worth over time
		- Table of holdings and value for each security and total
		- Table of transactions & overall P&L
	- /trade
		- Form to buy or sell a specific ticker at market price
	- /news
		- Form to edit subscription
		- Securities in porfolio, watchlist, and aggregate indices automatically in subscription
		- See list of headlines, which link to articles
			- Articles may be new report, or data such as earnings, analyst rating etc
  
- Create watchlist
	- {PARTLY DONE} Get rid of unessential components in `watchlist.component.js`
	- {DONE} Add ticker to watchlist of user
	- Check that ticker is valid
	- {DONE} Delete ticker from watchlist of user
	- Display current price of stocks on watchlist
		- {DONE} Get watchlist for user from server to client
		- {DONE} Fetch quote from AlphaVantage API
		- {DONE} Send API results to client at specific time point
		- {DONE} Display in table on client end in `watchlist.component.js`
		- {TODO} Buttons for adding or deleting to watchlist should also edit `watchlist` via setState and re-render table.

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

## Description
A finance tool made using the MERN stack
- Secure login and registration using the PassportJS JWT strategy; passwords are hashed using bcrypt
- Keep track of all your transactions displayed clearly in a table and charts using chartjs
- View price history and health index of hundreds of crypto coins
and use the built in currency conversion tool


## Demo

### Login Demo
Used the Passportjs JWT strategy for authentication
![Login Demo](demo/login.gif)

### Registration Demo
![Registration Demo](demo/registration.gif)

### Error Checking Demo
![Error Checking Demo](demo/error-checking.gif)

### Transaction Input Demo
Transactions are visualized using chartjs
![Transaction Input Demo](demo/input-transactions.gif)

### Edit/Delete Transaction Demo
![Edit/Delete Transaction Demo](demo/edit-transactions.gif)

### Crypto Currency Dashboard DemToAddo
Coin data is from the [Alpha Vantage API](https://www.alphavantage.co/)
and displayed using chartjs
![Crypto Currency Dashboard Demo](demo/crypto.gif)



### How To Deploy?
Create a .env file in the backend folder and add your own MongoDB key which links to your own MongoDB database.
Also create and add a secret key to the .env file used for password hashing by bcrypt. This is also where your api key will be stored.


