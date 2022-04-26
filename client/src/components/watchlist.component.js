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


export default function Watchlist( props ) {

  const [ tickerToAdd, setTickerToAdd ] = useState();
  const [ tickerToDelete, setTickerToDelete ] = useState();
  const [ watchlist, setWatchlist ] = useState();
  const [ reloadWatchlist, setReloadWatchlist ] = useState( false );

  useEffect( () => {
    checkLoggedIn();
    displayWatchlist();
    console.log( "props.beginMonth: \n", props.beginMonth );
    console.log( "props.viewingMonth: \n", props.viewingMonth );
    console.log( "props.latestMonth: \n", props.latestMonth );
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
    } else {
      window.location = "/";
    }
  };

  function sleep( ms ) {
    return new Promise( resolve => setTimeout( resolve, ms ) );
  }
  const displayWatchlist = async () => {
    console.log( `in displayWatchlist` );

    /* Get watchlist from server */
    try {
      let res = await Axios( {
        method: "get",
        url: "http://localhost:5000/api/protected/watchlist/getWatchlist",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
      } );
      console.log( "Got from /getWatchlist, res.data: ", res.data );
      setWatchlist( res.data );
    }
    catch ( err ) {
      let errorMessage = "While getting watchlist from server, an error occurred.";
      console.error( "Caught err: ", JSON.stringify( err ) );
      alert( errorMessage );
    }

  };

  useEffect( () => {
    console.log( "reloadWatchlist altered" );
    displayWatchlist();
  }, [ reloadWatchlist ] );



  const onAddTickerSubmit = async e => {
    try {
      e.preventDefault();
      e.target.reset();

      let res = await Axios( {
        method: "post",
        url: "http://localhost:5000/api/protected/watchlist/addTickerToWatchlist",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
        data: {
          ticker: tickerToAdd
        },
      } );
      console.log( `Got from /api/protected/watchlist/addTickerToWatchlist`, res );

      setReloadWatchlist( !reloadWatchlist );
    } catch ( err ) {
      console.error( err );
    }
  };

  const onDeleteTickerSubmit = async e => {
    try {
      e.preventDefault();
      e.target.reset();

      let res = await Axios( {
        method: "post",
        url: "http://localhost:5000/api/protected/watchlist/deleteTickerFromWatchlist",
        headers: {
          Authorization: localStorage.getItem( "jwt" ),
        },
        data: {
          ticker: tickerToDelete
        },
      } );
      console.log( `Got from /api/protected/watchlist/deleteTickerFromWatchlist`, res );


      setReloadWatchlist( !reloadWatchlist );
    } catch ( err ) {
      console.error( err );
    }
  };

  return (
    <Container>
      <Row>
        <Col xs="12" md="6">
          <div className="card expense-input-card">
            <div className="card-body">
              <h5 className="card-title text-center">Add Ticker To Watchlist</h5>

              <form onSubmit={ onAddTickerSubmit } className="form-signin">
                <div className="form-group">
                  <label htmlFor="inputExpenseTitle">Ticker</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ticker"
                    onChange={ e => setTickerToAdd( e.target.value ) }
                  />
                </div>

                <button
                  className="btn btn-lg btn-primary btn-block text-uppercase input-expense-btn"
                  type="submit"
                >
                  Add to Watchlist
                </button>
              </form>

              <form onSubmit={ onDeleteTickerSubmit } className="form-signin">
                <div className="form-group">
                  <label htmlFor="inputExpenseTitle">Ticker</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ticker"
                    onChange={ e => setTickerToDelete( e.target.value ) }
                  />
                </div>

                <button
                  className="btn btn-lg btn-primary btn-block text-uppercase input-expense-btn"
                  type="submit"
                >
                  Remove from Watchlist
                </button>
              </form>

            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs="12">
          <Table className="watchlistTable" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Ticker Symbol</th>
              </tr>
            </thead>

            <tbody>

              { watchlist ? watchlist.map( currentTicker => (
                <tr>
                  <td>{ currentTicker.tickerSymbol }</td>
                </tr>
              ) ) : <></> }
            </tbody>

          </Table>
        </Col>
      </Row>

    </Container>
  );
}
