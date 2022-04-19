const axios = require('axios');
let Ticker = require('../models/ticker.model');
const router = require('express').Router();
var request = require('request');

const currMonth = '2022-03';

router.get('/getNews', async (req, res) => {
  try {
    console.log("news.router.js:router.get:/getNews");

    var url = `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=TSLA&apikey=process.env.VANTAGE_KEY`;
    
    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
      }, (err, res, data) => {
        if (err) {
          console.log('Error:', err);
        } else if (res.statusCode !== 200) {
          console.log('Status:', res.statusCode);
        } else {
          // data is successfully parsed as a JSON object:
          console.log(data);
        }
    });
  } catch (err) {
    return res.status(500).json({ Error: err });

  }
});


module.exports = router;