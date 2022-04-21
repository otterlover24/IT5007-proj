import React, { useState, useEffect } from "react";
import Axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";

import { Navbar, Nav } from "react-bootstrap";
import "./component.css";

export default function NavbarComponent(props) {
  const logout = () => {
    localStorage.removeItem("jwt");
    window.location = "/";
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

          {props.allMonthsReady && (
            <button onClick={props.viewPreviousQuarter}>View Previous Quarter</button>
          )}

          {props.allMonthsReady && <h6 style={{ color: "light-grey" }}>Viewing Quarter: {props.viewingMonth}</h6>}
          
          {props.allMonthsReady && <h6 style={{ color: "dark-grey" }}>Latest Quarter: {props.latestMonth}</h6>}

          {props.allMonthsReady && (
            <button onClick={props.viewNextQuarter}>View Next Quarter</button>
          )}

          {props.allMonthsReady && (
            <button onClick={props.forwardOneQuarter}>Forward One Quarter</button>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
