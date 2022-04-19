import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";

import { Navbar, Nav } from "react-bootstrap";
import "./component.css";

export default function Login(props) {
  const [beginMonth, setBeginMonth] = useState();
  const [latestMonth, setLatestMonth] = useState();
  const [viewingMonth, setViewingMonth] = useState();
  const [allMonthsReady, setAllMonthsReady] = useState();
  const [getMonthVariablesFlag, setGetMonthVariablesFlag] = useState();

  useEffect(() => {
    setGetMonthVariablesFlag(true);
  }, []);

  useEffect(() => {
    const getMonthVariables = async () => {
      try {
        if (props.isAuthenticated) {
          console.log(`in getMonth`);

          /* 
          Get `beginMonth`, `latestMonth`, `viewingMonth` from server's users route's 
          `getBeginMonth`, `getLatestMonth`, `getViewingMonth` respectively.
          */
          await Axios({
            method: "get",
            url: "http://localhost:5000/api/users/getBeginMonth",
            headers: {
              Authorization: localStorage.getItem("jwt"),
            },
          }).then(res => {
            console.log(res.data);
            setBeginMonth(res.data.beginMonth);
          });

          await Axios({
            method: "get",
            url: "http://localhost:5000/api/users/getLatestMonth",
            headers: {
              Authorization: localStorage.getItem("jwt"),
            },
          }).then(res => {
            console.log(res.data);
            setLatestMonth(res.data.latestMonth);
          });

          await Axios({
            method: "get",
            url: "http://localhost:5000/api/users/getViewingMonth",
            headers: {
              Authorization: localStorage.getItem("jwt"),
            },
          }).then(res => {
            console.log(res.data);
            setViewingMonth(res.data.viewingMonth);
          });
        }
      } catch (err) {
        console.error("Error in getMonthVariables");
        console.error(err);
      }
    };

    getMonthVariables();
  }, [props.isAuthenticated, getMonthVariablesFlag]);

  useEffect(() => {
    console.log(`beginMonth: ${beginMonth ? beginMonth : "empty"}`);
    console.log(`latestMonth: ${latestMonth ? latestMonth : "empty"}`);
    console.log(`viewingMonth: ${viewingMonth ? viewingMonth : "empty"}`);
    if (beginMonth && latestMonth && viewingMonth) {
      setAllMonthsReady(true);
    }
  }, [beginMonth, latestMonth, viewingMonth]);

  const logout = () => {
    localStorage.removeItem("jwt");
    window.location = "/";
  };

  const viewPreviousMonth = async () => {
    console.log("In viewPreviousMonth()");
    try {
      await Axios({
        method: "post",
        url: "http://localhost:5000/api/users/viewPreviousMonth",
        headers: {
          Authorization: localStorage.getItem("jwt"),
        },
      }).then(res => {
        console.log(res.data);
        setViewingMonth(res.data.prevViewingMonth);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const viewNextMonth = async () => {
    console.log("In viewNextMonth()");
    try {
      await Axios({
        method: "post",
        url: "http://localhost:5000/api/users/viewNextMonth",
        headers: {
          Authorization: localStorage.getItem("jwt"),
        },
      }).then(res => {
        console.log(res.data);
        setViewingMonth(res.data.nextViewingMonth);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const forwardOneMonth = async () => {
    console.log("In forwardOneMonth()");
    try {
      await Axios({
        method: "post",
        url: "http://localhost:5000/api/users/forwardOneMonth",
        headers: {
          Authorization: localStorage.getItem("jwt"),
        },
      }).then(res => {
        console.log(res.data);
        setGetMonthVariablesFlag(!getMonthVariablesFlag);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      bg="light"
      variant="light"
      className="nav-bar"
    >
      <Navbar.Brand href={"/"}>Stock Simulator</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          {!props.isAuthenticated && (
            <Link to="/login" className="nav-link">
              Sign in
            </Link>
          )}

          {!props.isAuthenticated && (
            <Link to="/register" className="nav-link">
              Register
            </Link>
          )}

          {props.isAuthenticated && (
            <Link to="/News" className="nav-link">
              News
            </Link>
          )}

          {props.isAuthenticated && (
            <Link to="/Trade" className="nav-link">
              Trade
            </Link>
          )}

          {props.isAuthenticated && (
            <Link to="/watchlist" className="nav-link">
              Watchlist
            </Link>
          )}

          {props.isAuthenticated && (
            <Link to="/Portfolio" className="nav-link">
              Portfolio
            </Link>
          )}

          {props.isAuthenticated && (
            <Link to="/" className="nav-link" onClick={logout}>
              Sign Out
            </Link>
          )}

          {allMonthsReady && (
            <button onClick={viewPreviousMonth}>View Previous Month</button>
          )}

          {allMonthsReady && <h6 style={{ color: "light-grey" }}>Viewing Month: {viewingMonth}</h6>}
          
          {allMonthsReady && <h6 style={{ color: "dark-grey" }}>Latest Month: {latestMonth}</h6>}

          {allMonthsReady && (
            <button onClick={viewNextMonth}>View Next Month</button>
          )}

          {allMonthsReady && (
            <button onClick={forwardOneMonth}>Forward One Month</button>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
