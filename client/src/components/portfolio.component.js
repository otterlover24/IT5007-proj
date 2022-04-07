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
import { Line } from "react-chartjs-2";

export default function Portfolio() {
  const [netWorthData, setNetWorthData] = useState({
    labels: ["2014-06", "2014-07", "2014-08", "2014-09"],
    datasets: [
      {
        label: "Net Worth",
        data: [10000, 20000, 40000, 35000],
        lineTension: 0,
      }
    ]
  });

  useEffect(() => {
    console.log("portfolio.component.js useEffect []");

    const checkLoggedIn = async () => {
      if (localStorage.getItem("jwt")) {
        Axios({
          method: "get",
          url: "http://localhost:5000/api/users/isAuthenticated",
          headers: {
            Authorization: localStorage.getItem("jwt"),
          },
        }).catch(err => {
          console.error(err);
          window.location = "/";
          localStorage.removeItem("jwt");
        });
      } else {
        window.location = "/";
      }
    };
    checkLoggedIn();

  }, []);
  


  

  
  return (
    <Container>
      <Row>
        <Col xs="12" md="6">
          <div className="card expense-input-card">
            <div className="card-body">
              <h5>Net Worth Chart</h5>
              <div style={{width: 500}}>
                <Line data={netWorthData} />
              </div>



            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <h5>Current Holdings</h5>
        <Col xs="12">
          <Table id="holdingsTable" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Quantity</th>
                <th>Average Purchase Price</th>
                <th>Current Market Price</th>
                <th>Profit (Loss)</th>
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
                <tr>
                  <td>2014-07-30</td>
                  <td>AAPL</td>
                  <td>BUY</td>
                  <td>20,000</td>
                </tr>
            </tbody>

          </Table>
        </Col>
      </Row>

    </Container>
  );
}
