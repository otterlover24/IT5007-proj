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


export default function Pricehistory() {
  const location = useLocation();
  const { pricehistorydata } = location.state;

  useEffect( () => {
    console.log( "Pricehistory's pricehistorydata: ", pricehistorydata );
    // Object.entries( pricehistorydata ).forEach( ( [ key, value ] ) => {
    //   console.log( "key: ", key );
    //   console.log( "value: ", value );
    // } );
  }, [] );




  return (
    <Container>

      <Row>
        <Col xs="12">
          <h5>Relevant news based on your porfolio holdings and watchlist</h5>
          <Table className="newsTable" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>



            <tbody>
              { pricehistorydata ? Object.keys( pricehistorydata )
                .filter( ( key ) => {
                  return ( key !== "_id" ) &&
                    ( key !== "__v" );
                } )
                .map( ( key, i ) => (
                  <tr>
                    <td>{ key }</td>
                    <td>{ pricehistorydata[ key ] }</td>
                  </tr>
                ) ) : <></> }

            </tbody>

          </Table>
        </Col>
      </Row>
    </Container >
  );
}
