import React, { useState, useEffect } from "react";
import "../App.css";
import "../components/component.css";
import "react-datepicker/dist/react-datepicker.css";
import {
  Container,
  Col,
  Row,
  Table,
} from "react-bootstrap";
import { useLocation } from 'react-router-dom';


export default function Newsitem() {
  const location = useLocation();
  const { newsdata } = location.state;

  useEffect( () => {
    console.log( "Newsitem's newsdata: ", newsdata );
  }, [] );




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
            </tbody>

          </Table>
        </Col>
      </Row>

    </Container>
  );
}
