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

export default function News() {

  const [tickerToAdd, setTickerToAdd] = useState();
  const [tickerToDelete, setTickerToDelete] = useState();
  const [watchlist, setWatchlist] = useState();
  
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
      } else {
        window.location = "/";
      }
    };
    checkLoggedIn();

    displayWatchlist();
    console.log("test");
  }, []);
  
  const displayWatchlist = async () => {
    console.log(`in displayWatchlist`);

    /* Get watchlist from server */
    await Axios({
      method: "get",
      url: "http://localhost:5000/api/protected/watchlist/getWatchlist",
      headers: {
        Authorization: localStorage.getItem("jwt"),
      },
    }).then(res => {
      console.log(res.data);
      setWatchlist(res.data);
    });
  };

  useEffect(() => {
    console.log(watchlist);
  }, [watchlist]);


  
  const onAddTickerSubmit = async e => {
    try {
      e.preventDefault();
      e.target.reset();

      await Axios({
        method: "post",
        url: "http://localhost:5000/api/protected/watchlist/addTicker",
        headers: {
          Authorization: localStorage.getItem("jwt"),
        },
        data: {
          ticker: tickerToAdd
        },
      }).then(res => {
        console.log(`Sent ${res} to /api/protected/watchlist/addTicker`);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onDeleteTickerSubmit = async e => {
    try {
      e.preventDefault();
      e.target.reset();

      await Axios({
        method: "post",
        url: "http://localhost:5000/api/protected/watchlist/deleteTicker",
        headers: {
          Authorization: localStorage.getItem("jwt"),
        },
        data: {
          ticker: tickerToDelete
        },
      }).then(res => {
        console.log(`Sent ${res} to /api/protected/watchlist/deleteTicker`);
      });
    } catch (err) {
      console.error(err);
    }
  };
  
  return (
    <Container>

      <Row>
        <Col xs="12">
          <h5>Relevant news based on your porfolio holdings and watchlist</h5>
          <Table className="newsTable" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Ticker Symbol</th>
                <th>Type</th>
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
