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

  useEffect( () => {
    console.log( "news.component.js useEffect []" );
    console.log( "news.component props.viewingMonth: ", props.viewingMonth );
    console.log( "news.component props.latestMonth: ", props.latestMonth );
    checkLoggedIn();
    displayNews();
  }, [] );

  useEffect( () => {
    console.log( newsList );
  }, [ newsList ] );

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

  const displayNews = async () => {
    console.log( `in displayWatchlist` );

    /* Get watchlist from server */
    await Axios( {
      method: "get",
      url: "http://localhost:5000/api/protected/news/getNews",
      headers: {
        Authorization: localStorage.getItem( "jwt" ),
      },
    } ).then( res => {
      console.log( "Before renameKey, res.data:", res.data );
      for (let newsitem of res.data) {
        renameKey(newsitem, 'fiscalDateEnding', 'Date');
        renameKey(newsitem, 'tickerSymbol', 'Ticker Symbol');
        renameKey(newsitem, 'grossProfit', 'Gross Profit');
        renameKey(newsitem, 'netIncome', 'Net Income');
        renameKey(newsitem, 'reportedCurrency', 'Reported Currency');
        renameKey(newsitem, 'totalRevenue', 'Total Revenue');
      }
      console.log( "After renameKey, res.data:", res.data );

      setNewsList( res.data );
    } );
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
          <h5>Relevant news based on your porfolio holdings and watchlist</h5>
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
                  <td>{ news["Date"] }</td>
                  <td>{ news["Ticker Symbol"] } </td>
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
