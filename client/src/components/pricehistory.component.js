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
import {Line} from "react-chartjs-2";


export default function Pricehistory() {
  const location = useLocation();
  const { pricehistorydata } = location.state;
  const [xs, setXs] = useState( [] );
  const [ys, setYs] = useState( [] );

  useEffect( () => {
    console.log( "Pricehistory's pricehistorydata: ", pricehistorydata );
    let xsTmp = [];
    let ysTmp = [];
    pricehistorydata
      .reverse()
      .map( ( [ yearMonth, price ] ) => {
        xsTmp.push( yearMonth );
        ysTmp.push( price );
      } );
    console.log( "xsTmp: ", xsTmp );
    console.log( "ysTmp: ", ysTmp );
    setXs( xsTmp );
    setYs( ysTmp );
  }, [] );




  return (
    <Container>

      <Row>
        <Col xs={ 12 } >
          <h5>Price History Chart</h5>
          <div className="history-chart">
            <Line
              data={ {
                labels: xs,
                datasets: [
                  {
                    label: 'Price',
                    fill: false,
                    lineTension: 0,
                    backgroundColor: 'rgba(75,192,192,1)',
                    borderColor: 'rgba(0,0,0,1)',
                    borderWidth: 2,
                    data: ys,
                  }
                ]
              } }
              options={ {
                title: {
                  display: true,
                  text: 'Monthly Closing Price',
                  fontSize: 20
                },
                legend: {
                  display: false,

                },
                responsive: true,
                maintainAspectRatio: false,
              } }
              width={ 600 }
              height={ 600 }
              className="charts"

            />
          </div>
        </Col>
      </Row>


      <Row>
        <Col xs="12">
          <h5>Price History Table</h5>
          <Table className="priceHistoryTable" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Price</th>
              </tr>
            </thead>



            <tbody>
              { pricehistorydata ? Object
                .keys( pricehistorydata )
                .map( key => (
                  <tr>
                    <td>{ pricehistorydata[ key ][ 0 ] }</td>
                    <td>{ pricehistorydata[ key ][ 1 ] }</td>
                  </tr>
                ) ) : <></> }

            </tbody>

          </Table>
        </Col>
      </Row>
    </Container >
  );
}
