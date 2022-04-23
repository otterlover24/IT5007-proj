import React from "react";
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
import { Line } from "react-chartjs-2";

class Portfolio extends React.Component {

  constructor( props ) {
    super( props );
    this.state = {
      trades: [],
      viewingMonthHoldings: {},
    };
  }

  async componentDidMount() {
    console.log( "portfolio.component.js: executing componentDidMount" );
    this.checkLoggedIn();
    await this.displayTrades();
    console.log( "In componentDidMount, this.state.trade: ", this.state.trade );
  }





  // useEffect(
  //   () => {
  //     console.log( "portfolio.component.js useEffect [props.viewingMonth]" );
  //     console.log( "portfolio.component props.viewingMonth: ", props.viewingMonth );
  //     console.log( "portfolio.component props.latestMonth: ", props.latestMonth );
  //     checkLoggedIn();
  //     displayTrades();
  //   },
  //   [props.viewingMonth]
  // );

  // useEffect(
  //   () => {

  //     // setViewingMonthHoldings({...initialViewingMonthHoldings});    // Clear state to avoid accumulating previous holdings.
  //     setViewingMonthHoldings(prevViewingMonthHoldings => new Object);    // Clear state to avoid accumulating previous holdings.
  //     console.log("In useEffect for [trades], after resetting viewingMonthHoldings: ", viewingMonthHoldings);
      
  //     trades
  //       .slice()    // create a copy
  //       .reverse()  // Start from earliest to latest
  //       .forEach(
  //         function ( trade ) {
  //           /* Only consider trades up to props.viewingMonth */
  //           if ( trade.yearMonth <= props.viewingMonth ) {
  //             let direction = trade.direction === "BUY" ? 1 : -1;
  //             let updatedViewingMonthHoldings = viewingMonthHoldings;
  //             console.log("trade: ", trade);
  //             console.log("viewingMonthsHoldings before updating for current trade: ", viewingMonthHoldings);

  //             if ( !( trade.tickerSymbol in viewingMonthHoldings ) ) {
  //               /* Symbol is not in viewingMonthHolding's property, create symbol*/
  //               updatedViewingMonthHoldings[ trade.tickerSymbol ] = direction * trade.quantity;
  //               setViewingMonthHoldings( updatedViewingMonthHoldings );
  //               console.log("viewingMonthHoldings after update for ticker not in: ", viewingMonthHoldings);
  //               return;   // Can't use continue in forEach loop.
  //             }

  //             if ( trade.tickerSymbol in viewingMonthHoldings ) {
  //               /* Symbol is not in viewingMonthHolding's property, increment or decrement.*/
  //               updatedViewingMonthHoldings[ trade.tickerSymbol ] += direction * trade.quantity;
  //               setViewingMonthHoldings( updatedViewingMonthHoldings );
  //               console.log("viewingMonthHoldings after update for ticker not in: ", viewingMonthHoldings);
  //               return;   // Can't use continue in forEach loop.
  //             }
  //           }
  //         }
  //       );
  //     console.log( "props.viewingMonth", props.viewingMonth );
  //     console.log( "After looping, viewingMonthHoldings: \n", viewingMonthHoldings );
  //   },
  //   [ trades ]
  // );

  checkLoggedIn = async () => {
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

  displayTrades = async () => {
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
      setViewingMonthHoldings(res.data.holdings);
    } );

    /* Get market price for viewingMonthHoldings */

  };

  render() {
    return (
      <Container>

        <Row>
          <h5>Current Holdings</h5>
          <Col xs="12">
            <Table id="holdingsTable" striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Quantity</th>
                  <th>Current Market Price</th>
                  <th>Value</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>AAPL</td>
                  <td>20,000</td>
                  <td>$134.00</td>
                  <td>$174.00</td>
                  <td>$800,000</td>
                </tr>
              </tbody>


            </Table>
          </Col>
        </Row>

        <Row>
          <h5>Transaction History</h5>
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
                { this.state.trades ? this.state.trades.map( trade => (
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
}

export default Portfolio;
