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
      console.log( res.data );
      setNewsList( res.data );
    } );
  };

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
                  <td>{ news.fiscalDateEnding }</td>
                  <td>{ news.tickerSymbol } </td>
                  <td>{ news.tickerSymbol } Quarterly Earnings Report </td>
                </tr>
              ) ) : <></> }
            </tbody>

            {/* <tbody>
              <tr>
                <td>AAPL</td>
                <td>Earnings</td>
                <td>2020Q4 10-K statement</td>
              </tr>
              <tr>
                <td>AAPL</td>
                <td>News</td>
                <td>Rumors abound of new Apple car to rival Tesla.</td>
              </tr>
            </tbody> */}

          </Table>
        </Col>
      </Row>

    </Container>
  );
}
