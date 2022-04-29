import React, { useState, useEffect } from "react";
import "../App.css";
import Axios from "axios";
import "../components/component.css";
import "react-datepicker/dist/react-datepicker.css";
import { Container, Col, Row, Table } from "react-bootstrap";

export default function Trade( props ) {
  const [ tickerSymbol, setTickerSymbol ] = useState();
  const [ quantity, setQuantity ] = useState();
  const [ direction, setDirection ] = useState();
  const [ price, setPrice ] = useState();

  useEffect( () => {
    console.log( "trade.component.js useEffect []" );
    console.log( "trade.component props.viewingMonth: ", props.viewingMonth );
    console.log( "trade.component props.latestMonth: ", props.latestMonth );
    checkLoggedIn();
  }, [] );

  const checkLoggedIn = async () => {
    if ( localStorage.getItem( "jwt" ) ) {
      Axios( {
        method: "get",
        url: "http://3.135.31.228:5000/api/users/isAuthenticated",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
      } ).catch( err => {
        console.log( err );
        window.location = "/";
        localStorage.removeItem( "jwt" );
      } );
    } else {
      window.location = "/";
    }
  };

  const onTradeSubmit = async e => {
    try {
      e.preventDefault();
      e.target.reset();

      await Axios( {
        method: "post",
        url: "http://3.135.31.228:5000/api/protected/trade/submitTrade",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
        data: {
          tickerSymbol: tickerSymbol,
          price: price,
          quantity: quantity,
          direction: direction,
        },
      } )
        .then( res => {
          console.log( "Received from /api/protected/trade/submitTrade, res.data: \n", res.data );
          if ( res.data.message === "success" ) {
            alert( "Trade successful!" );
          }
        } );

    }

    catch ( err ) {
      console.log( "Caught error in onTradeSubmit, printing err:\n", err );
      alert( "Trade failed!" );
    }

    finally {
      /* Price field to avoid confusion. */
      setPrice( null );
    }
  };

  const handleGetQuote = async e => {
    try {

      let res = await Axios( {
        method: "post",
        url: "http://3.135.31.228:5000/api/protected/trade/getQuote",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
        data: {
          tickerSymbol: tickerSymbol,
        },
      } );

      console.log( "Received from /api/protected/trade/getQuote, res.data: \n", res.data );
      if ( res.data ) {
        setPrice( res.data );
      }
      else {
        alert( `Could not get quote for ticker ${tickerSymbol}.` );
      }


    }
    catch ( err ) {
      console.log( "Caught error in handleGetQuote, printing err:\n", err );
      alert( "Get Quote failed. Please wait a minute for API quota to reset." );
    }
  };

  return (
    <Container>
      <Row>
        <Col xs="12" md="6">
          <div className="card expense-input-card">
            <div className="card-body">
              <h5 className="card-title text-center">
                Trade Security at { props.latestMonth }
              </h5>

              <form onSubmit={ onTradeSubmit } className="form-signin">
                <div className="form-group">
                  <label htmlFor="inputTicker">Ticker</label>
                  <input
                    id="inputTicker"
                    type="text"
                    className="form-control"
                    placeholder="Ticker"
                    onChange={ e => setTickerSymbol( e.target.value ) }
                  />
                </div>

                <button
                  type="button"
                  onClick={ handleGetQuote }
                  className="btn btn-lg btn-secondary btn-block text-uppercase input-expense-btn"
                >
                  Get Quote
                </button>

                <div className="form-group">
                  <label htmlFor="inputPrice">Price</label>
                  <input
                    id="inputPrice"
                    type="number"
                    className="form-control"
                    value={ price }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="inputQuantity">Quantity</label>
                  <input
                    id="inputQuantity"
                    type="number"
                    className="form-control"
                    placeholder="Quantity"
                    onChange={ e => setQuantity( e.target.value ) }
                  />
                </div>

                <div className="form-group">
                  <input type="radio" name="tradeDirection" value="BUY" onChange={ e => setDirection( e.target.value ) } /> Buy
                  <input type="radio" name="tradeDirection" value="SELL" onChange={ e => setDirection( e.target.value ) } /> Sell
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
