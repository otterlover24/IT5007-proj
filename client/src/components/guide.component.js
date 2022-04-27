import React, { useEffect } from "react";
import "../App.css";

import Axios from "axios";
import { Container, Col, Row } from "react-bootstrap";

export default function Guide() {
  useEffect( () => {
    checkLoggedIn();
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
    }
  };

  return (
    <Container fluid>
      <div className="section-1">
          <div className="text-container">

            <Row>
              <Col xs={ 12 }>
                <h2 id="Sub-Header">Objective</h2>
              </Col>
            </Row>

            <Row>
              <Col xs={ 12 }>
                <p id="description">
                  This time-travelling stock simulator aims to develop your stock picking skills by presenting to you relevant financial news at that period of time, and lets you trade on a monthly basis. We differentiate ourselves from paper trading simulators offered by stock brokers by focusing on long-term fundamentals-driven investing rather than short-term trading which from which brokers earn their fees. We also immerse you in a historical environment to hone your decision making ability based on information present at that moment in time.
                </p>
              </Col>
            </Row>


            <Row>
              <Col xs={ 12 }>
                <h2 id="Sub-Header">Time Periods</h2>
              </Col>
            </Row>

            <Row>
              <Col xs={ 12 }>
                <p id="description">
                  The time-step of this simulator is one quarter.
                  There are three time period concepts that you have to be aware of.
                </p>

                <p id="description">
                  The "Beginning Quarter" is the earliest quarter that your simulation
                  starts at, which is 2014-06.
                </p>

                <p id="description">
                  The "Latest Quarter" is that latest month that you have forwarded to thus far,
                  and you can increment it by clicking the "Forward One Quarter" button in the Navbar.
                  You can only trade during your Latest Quarter.
                </p>

                <p id="description">
                  The "Viewing Quarter" is the period between the Beginning Quarter and the Latest Quarter
                  that you are viewing. All the items in the News and Portfolio pages are as at
                  the Viewing Quarter. You can increment the Viewing Quarter up to the Latest Quarter
                  by pressing "View Next Quarter" button in the Navbar.
                  Likewise, you can decrement the Viewing Quarter up to the Beginning Quarter
                  by pressing the "View Previous Quarter" button in the Navbar.
                </p>
              </Col>
            </Row>

            <Row>
              <Col xs={ 12 }>
                <h2 id="Sub-Header">Limitations</h2>
              </Col>
            </Row>

            <Row>
              <Col xs={ 12 }>
                <p id="description">
                  This website uses AlphaVantage's free API for its data, with limits of 5 calls per minute, 500 calls per day.
                  To facilitate a smoother experience, the server caches data received previously from AlphaVantage,
                   and only fetches new data from AlphaVantage if it could not be found in the server cache.
                   Nonetheless, you may experience some delays in data being displayed or blanks. 
                   If that is the case, please back off for 1 minute and retry later.
                </p>
              </Col>
            </Row>

          </div>

      </div>
    </Container>
  );
}
