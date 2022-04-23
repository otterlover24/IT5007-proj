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

export default function Portfolio( props ) {

  const [ trades, setTrades ] = useState( [] );
  const [ viewingMonthHoldings, setViewingMonthHoldings ] = useState( {} );
  const [ viewingMonthTotalValue, setViewingMonthTotalValue ] = useState( null );

  useEffect(
    () => {
      console.log( "portfolio.component.js useEffect []" );
      console.log( "portfolio.component props.viewingMonth: ", props.viewingMonth );
      console.log( "portfolio.component props.latestMonth: ", props.latestMonth );
      checkLoggedIn();
      displayTrades();
    },
    []
  );

  useEffect(
    () => {
      console.log( "portfolio.component.js useEffect []" );
      console.log( "portfolio.component props.viewingMonth: ", props.viewingMonth );
      console.log( "portfolio.component props.latestMonth: ", props.latestMonth );
      checkLoggedIn();
      displayTrades();
    },
    [ props.viewingMonth ]
  );

  useEffect(
    () => {
      console.log( "portfolio.component.js useEffect [viewingMonthHoldings]" );
      console.log( "portfolio.component viewingMonthHoldings: ", viewingMonthHoldings );
    },
    [ viewingMonthHoldings ]
  );


  const checkLoggedIn = async () => {
    if ( localStorage.getItem( "jwt" ) ) {
      Axios( {
        method: "get",
        url: "http://localhost:5000/api/users/isAuthenticated",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
      } ).catch( err => {
        console.error( err );
        window.location = "/";
        localStorage.removeItem( "jwt" );
      } );
    } else {
      window.location = "/";
    }
  };

  const displayTrades = async () => {
    console.log( `in displayTrades` );

    /* Get watchlist from server */
    await Axios( {
      method: "post",
      url: "http://localhost:5000/api/protected/portfolio/getTrades",
      headers: {
        Authorization: localStorage.getItem( "jwt" ),
      },
    } ).then( res => {
      console.log( "displayTrades received res.data from server: \n", res.data );
      setTrades( res.data.trades );
      setViewingMonthHoldings( res.data.holdings );
      setViewingMonthTotalValue(res.data.portfolioValue);
    } );

  };

  return (
    <Container>
      { viewingMonthTotalValue ? (
            <Row>
            <h5>Total Portfolio Value As At {props.viewingMonth}: USD${viewingMonthTotalValue}</h5>
          </Row>
      ) : (
        <></>
      )


      }


      <Row>
        <h5>Current Holdings As Tt {props.viewingMonth}</h5>
        <Col xs="12">
          <Table id="holdingsTable" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Quantity</th>
                <th>Current Price</th>
                <th>Current Holding Value</th>
              </tr>
            </thead>

            <tbody>
              { viewingMonthHoldings ? Object.keys( viewingMonthHoldings ).map( ( tickerSymbol ) => {
                return (
                  <tr>
                    <td>{ viewingMonthHoldings[ tickerSymbol ].tickerSymbol }</td>
                    <td>{ viewingMonthHoldings[ tickerSymbol ].quantity }</td>
                    <td>{ viewingMonthHoldings[ tickerSymbol ].currentPricePerUnit }</td>
                    <td>{ viewingMonthHoldings[ tickerSymbol ].currentValue }</td>
                  </tr>
                );
              } ) : <></> }
            </tbody>

          </Table>


        </Col>
      </Row>

      <Row>
        <h5>Transaction History up to {props.viewingMonth}</h5>
        <Col xs="12">
          <Table id="transactionHistoryTable" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Ticker</th>
                <th>Direction</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              { trades ? trades.filter(trade => trade.tickerSymbol !== "US-DOLLAR").map( trade => (
                <tr>
                  <td>{ trade.yearMonth }</td>
                  <td>{ trade.tickerSymbol }</td>
                  <td>{ trade.direction }</td>
                  <td>{ trade.quantity }</td>
                </tr>
              ) ) : <></> }
            </tbody>



          </Table>
        </Col>
      </Row>
    </Container>
  );
}
