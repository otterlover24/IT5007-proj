/* 
Run `mongo time-travel-stock-simulator scripts/init.mongo.js` to initialize database.
*/

/* users collection */
db.users.remove({});

const initUsers =[{
	username: "init",
	password: "kljlkajdsfkljw122318",
	beginMonth: "2014-06",
	latestMonth: "2014-06",
	viewingMonth: "2014-06"
}];
db.users.insertMany(initUsers)

