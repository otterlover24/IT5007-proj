import React, { useState, useEffect } from "react";
import "../App.css";
import Axios from "axios";
import "../components/component.css";
import "react-datepicker/dist/react-datepicker.css";
import {
  Container,
  Col,
  Row,
  Table,
} from "react-bootstrap";
import { Link } from "react-router-dom";

export default function News( props ) {

  const [ newsList, setNewsList ] = useState();
  const [ watchlist, setWatchlist ] = useState();
  const [ watchlistHistory, setWatchlistHistory ] = useState( {} );

  useEffect( () => {
    console.log( "news.component.js useEffect []" );
    console.log( "news.component props.viewingMonth: ", props.viewingMonth );
    console.log( "news.component props.latestMonth: ", props.latestMonth );
    checkLoggedIn();
    displayWatchlist();
    displayWatchlistHistory();
    displayNews();
  }, [] );


  const checkLoggedIn = async () => {
    if ( localStorage.getItem( "jwt" ) ) {
      Axios( {
        method: "get",
        url: "http://localhost:5000/api/users/isAuthenticated",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
      } ).catch( err => {
        window.location = "/";
        localStorage.removeItem( "jwt" );
      } );
    } else {
      window.location = "/";
    }
  };

  const displayWatchlist = async () => {
    console.log( `in displayWatchlist` );

    /* Get watchlist from server */
    try {
      let res = await Axios( {
        method: "get",
        url: "http://localhost:5000/api/protected/watchlist/getWatchlistQuotes",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
      } );
      console.log( "displayWatchlist got res.data:", res.data );
      setWatchlist( res.data );
    }
    catch ( err ) {
      let errorMessage = "While getting watchlist from server, an error occurred.";
      console.error( "Caught err: ", JSON.stringify( err ) );
      alert( errorMessage );
    }
  };

  const displayWatchlistHistory = async () => {
    console.log( `in displayWatchlistHistory` );

    /* Get watchlist from server */
    try {
      let res = await Axios( {
        method: "get",
        url: "http://localhost:5000/api/protected/watchlist/getWatchlistQuotesUptoYearMonth",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
      } );
      console.log( "displayWatchlistHistory got res.data:", res.data );
      // setWatchlistHistory( res.data );
      let priceHistoryTemp = {};
      for ( let priceHistory of res.data ) {
        let tickerSymbol = Object.keys( priceHistory )[ 0 ];
        console.log( "Looping through priceHistory of tickerSymbol: ", tickerSymbol );
        priceHistoryTemp[ tickerSymbol ] = priceHistory[ tickerSymbol ].map( entry => {
          return entry.price;
        } );
      }
      console.log( "priceHistoryTemp: ", priceHistoryTemp );
      setWatchlistHistory( priceHistoryTemp );
    }
    catch ( err ) {
      let errorMessage = "While getting watchlist price hisotry from server, an error occurred.";
      console.error( "Caught err: ", JSON.stringify( err ) );
      alert( errorMessage );
    }
  };

  const displayNews = async () => {
    console.log( `in displayWatchlist` );

    /* Get watchlist from server */
    let res = await Axios( {
      method: "get",
      url: "http://localhost:5000/api/protected/news/getNews",
      headers: {
        Authorization: localStorage.getItem( "jwt" ),
      },
    } );

    console.log( "Got from /news/getNews, res.data:", res.data );

    for ( let newsitem of res.data ) {
      renameKey( newsitem, 'fiscalDateEnding', 'Date' );
      renameKey( newsitem, 'tickerSymbol', 'Ticker Symbol' );
      renameKey( newsitem, 'grossProfit', 'Gross Profit' );
      renameKey( newsitem, 'netIncome', 'Net Income' );
      renameKey( newsitem, 'reportedCurrency', 'Reported Currency' );
      renameKey( newsitem, 'totalRevenue', 'Total Revenue' );
    }
    setNewsList( res.data );

  };

  function renameKey( obj, old_key, new_key ) {
    // check if old key = new key  
    if ( old_key !== new_key ) {
      Object.defineProperty( obj, new_key, // modify old key
        // fetch description from object
        Object.getOwnPropertyDescriptor( obj, old_key ) );
      delete obj[ old_key ];                // delete old key
    }
  }
  return (
    <Container>

      <Row>
        <Col xs="12">
          <h5>Watchlist Quotes</h5>
          <Table className="watchlistTable" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Ticker Symbol</th>
                <th>Adjusted Monthly Closing Price</th>
              </tr>
            </thead>

            <tbody>

              { watchlist && watchlistHistory ? watchlist.map( currentTicker => (
                <tr>
                  <td>{ Object.keys( currentTicker )[ 0 ] }</td>
                  <Link
                    to={ {
                      pathname: "/pricehistory",
                      state: { pricehistorydata: watchlistHistory[ Object.keys( currentTicker )[ 0 ] ] }
                    } }
                  >
                    <td>{ currentTicker[ Object.keys( currentTicker )[ 0 ] ] }</td>
                  </Link>
                </tr>
              ) ) : <></> }
            </tbody>

          </Table>
        </Col>
      </Row>

      <Row>
        <Col xs="12">
          <h5>Relevant news based on your watchlist</h5>
          <Table className="newsTable" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Ticker</th>
                <th>Title</th>
              </tr>
            </thead>

            <tbody>
              { newsList ? newsList.map( news => (

                <tr>
                  <td>{ news[ "Date" ] }</td>
                  <td>{ news[ "Ticker Symbol" ] } </td>
                  <Link
                    to={ {
                      pathname: "/newsitem",
                      state: { newsdata: news }
                    } }
                  >
                    <td>{ news.tickerSymbol } Quarterly Earnings Report </td>
                  </Link>
                </tr>

              ) ) : <></> }
            </tbody>

          </Table>
        </Col>
      </Row>

    </Container>
  );
}
