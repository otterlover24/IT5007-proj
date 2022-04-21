import React, { useState, useEffect } from "react";
import "../App.css";
import Axios from "axios";
import "../components/component.css";
import "react-datepicker/dist/react-datepicker.css";
import { Container, Col, Row, Table } from "react-bootstrap";

export default function Trade() {
  const [tickerSymbol, setTickerSymbol] = useState();
  const [quantity, setQuantity] = useState();
  const [direction, setDirection] = useState();

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
          console.log(err);
          window.location = "/";
          localStorage.removeItem("jwt");
        });
      } else {
        window.location = "/";
      }
    };
    checkLoggedIn();
  }, []);


  const onTradeSubmit = async e => {
    try {
      e.preventDefault();
      e.target.reset();

      await Axios({
        method: "post",
        url: "http://localhost:5000/api/protected/trade/submitTrade",
        headers: {
          Authorization: localStorage.getItem("jwt"),
        },
        data: {
          tickerSymbol: tickerSymbol,
          quantity: quantity,
          direction: direction,
        },
      }).then(res => {
        console.log(`Sent ${res} to /api/protected/trade/submitTrade`);
      });
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <Container>
      <Row>
        <Col xs="12" md="6">
          <div className="card expense-input-card">
            <div className="card-body">
              <h5 className="card-title text-center">
                Buy or Sell a Security by Ticker
              </h5>

              <form onSubmit={onTradeSubmit} className="form-signin">
                <div className="form-group">
                  <label htmlFor="inputTicker">Ticker</label>
                  <input
                    id="inputTicker"
                    type="text"
                    className="form-control"
                    placeholder="Ticker"
                    onChange={e => setTickerSymbol(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inputQuantity">Quantity</label>
                  <input
                    id="inputQuantity"
                    type="number"
                    className="form-control"
                    placeholder="Quantity"
                    onChange={e => setQuantity(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <input type="radio" name="tradeDirection" value="Buy" onChange={e => setDirection(e.target.value)}/> Buy
                  <input type="radio" name="tradeDirection" value="Sell" onChange={e => setDirection(e.target.value)}/> Sell
                </div>

                <button
                  className="btn btn-lg btn-primary btn-block text-uppercase input-expense-btn"
                  type="submit"
                >
                  Trade
                </button>
              </form>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
