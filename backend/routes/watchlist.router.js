const axios = require('axios');
let Ticker = require('../models/ticker.model');
const router = require('express').Router();
const currMonth = '2022-03';

router.post('/addTicker', async (req, res) => {
  try {
    let { ticker } = req.body;
    if (!ticker) {
      return res.status(400).json({ Error: "Not all fields have been entered" });
    }

    const newTicker = new Ticker({
      userId: req.user._id,
      tickerSymbol: ticker,
    });

    newTicker
      .save()
      .then(tickerSymbol => {
        res.json(tickerSymbol);
        console.log(tickerSymbol);
      })
      .catch(err => res.status(400).json({ Error: err }));
  } catch (err) {
    return res.status(500).json({ Error: err });

  }
});

router.post('/deleteTicker', async (req, res) => {
  try {
    let { ticker } = req.body;
    if (!ticker) {
      return res.status(400).json({ Error: "Not all fields have been entered" });
    }

    Ticker
      .deleteOne({ userID: req.user._id, tickerSymbol: req.body.ticker})
      .then(tickerSymbol => {
        res.json(tickerSymbol);
        console.log(`Deleted from MongoDB ${tickerSymbol}.`);
      })
      .catch(err => res.status(400).json({ Error: err }));
  } catch (err) {
    return res.status(500).json({ Error: err });

  }
});
    
router.get('/getWatchlist', async (req, res) => {
  const tickers = await Ticker.find({userId: req.user._id}).select('tickerSymbol -_id');
  console.log(`tickers: ${tickers}`);
  let processedRes = [];
  for (let ticker of tickers) {
    console.log(`ticker: ${ticker}`);
    let filteredRes = await axios
    .get(
      'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY_ADJUSTED&symbol=' + 
      ticker.tickerSymbol + 
      '&datatype=json' + 
      '&apikey=' + 
      process.env.VANTAGE_KEY
    )
    .then(apiRes => { 
      const filteredRes = {}
      for (const property in apiRes.data['Monthly Adjusted Time Series']) {
        if (property.slice(0, 7) === currMonth) {
          filteredRes[ticker.tickerSymbol] = apiRes.data['Monthly Adjusted Time Series'][property]['5. adjusted close'];
        }
      }
      return filteredRes;
    });
    console.log(`filteredRes: ${filteredRes}`);
    processedRes.push(filteredRes);
  }
  return res.json(processedRes);
})

router.get('/getHistory', async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user._id });
  return res.json(transactions);
});

router.post('/addTransaction', async (req, res) => {
  try {
    let { transactionTitle, transactionAmount, transactionDate, transactionType } = req.body;
    if (!transactionTitle || !transactionType || !transactionAmount || !transactionDate) {
      return res.status(400).json({ Error: "Not all fields have been entered" });

    }

    const newTransaction = new Transaction({
      userId: req.user._id,
      transactionTitle,
      transactionType,
      transactionAmount,
      transactionDate,
    });

    newTransaction.save()
      .then(transaction => res.json(transaction))
      .catch(err => res.status(400).json({ Error: err }));
  } catch (err) {
    return res.status(500).json({ Error: err });

  }

});

router.delete('/deleteTransaction/:id', async (req, res) => {
  const transactionToDelete = await Transaction.findOne({ _id: req.params.id });
  if (!transactionToDelete) {
    return res.status(400).json({ Error: "Transaction not found" });
  }


  const deletedTransaction = await Transaction.findByIdAndDelete(transactionToDelete._id);
  const transactions = await Transaction.find({ userId: req.user._id });
  return res.json(transactions);
});



router.put('/editTransaction/:id', async (req, res) => {
  let { transactionTitle, transactionType, transactionAmount, transactionDate } = req.body;
  if (!transactionTitle || !transactionType || !transactionAmount || !transactionDate) {
    return res.status(400).json({ Error: "Not all fields have been entered" });
  }
  // console.log(_id+" "+transactionTitle+" "+transactionAmount+" "+transactionDate+" "+transactionType);

  await Transaction.findByIdAndUpdate({_id: req.params.id}, req.body
    
  )
    .then(transaction => res.json(transaction))
    .catch(err => res.status(400).json({ Error: err }));

});

module.exports = router;