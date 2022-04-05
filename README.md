# Time-travel Stock Picking Simulator

### TS notes
- AlphaVantage API limits
	- 5 calls per minute, 500 calls per day
		- Restrict player to 5 securities
- Users
	- abc / abc12345
	- cde / cde12345

### TS TODO
- Create watchlist
	- {PARTLY DONE} Get rid of unessential components in `watchlist.component.js`
	- {DONE} Add ticker to watchlist of user
	- Check that ticker is valid
	- {DONE} Delete ticker from watchlist of user
	- **Display current price of stocks on watchlist** 
		- {DONE} Get watchlist for user from server to client
		- {DONE} Fetch quote from AlphaVantage API
		- {DONE} Send API results to client at specific time point
		- {DONE} Display in table on client end in `watchlist.component.js`

-  Get quotes as at historical point
	- Chart up to time point
- Transactions
	- Buy
	- Sell
- Compute P&L

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


