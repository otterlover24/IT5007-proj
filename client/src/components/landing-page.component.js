import React, { useEffect } from "react";
import "../App.css";

import Axios from "axios";
import { Container, Col, Row } from "react-bootstrap";

export default function HomePage() {
  useEffect(() => {
    const checkLoggedIn = async () => {
      if (localStorage.getItem("jwt")) {
        Axios({
          method: "get",
          url: "http://localhost:5000/api/users/isAuthenticated",
          headers: {
            Authorization: localStorage.getItem("jwt"),
          },
        }).catch(err => {
          window.location = "/";
          localStorage.removeItem("jwt");
        });
      }
    };
    checkLoggedIn();
  }, []);

  return (
    <Container fluid>
      <div className="section-1">
        <Row>
            <div className="text-container">
              <Row>
                <Col xs={12}>
                  <h1 id="Header">Time Travelling Stock Simulator</h1>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <h2 id="Sub-Header">Train your inner Warren Buffet!</h2>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <p id="description">
                    This time-travelling stock simulator aims to develop your stock picking skills by presenting to you relevant financial news at that period of time, and lets you trade on a monthly basis. We differentiate ourselves from paper trading simulators offered by stock brokers by focusing on long-term fundamentals-driven investing rather than short-term trading which from which brokers earn their fees. We also immerse you in a historical environment to hone your decision making ability based on information present at that moment in time.
                  </p>
                </Col>
              </Row>
            </div>
            {/* </div> */}
        </Row>
      </div>
    </Container>
  );
}
