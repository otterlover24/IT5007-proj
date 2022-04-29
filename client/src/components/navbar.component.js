import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import Axios from "axios";
import { Link } from "react-router-dom";
import "../App.css";

import { Navbar, Nav } from "react-bootstrap";
import "./component.css";

export default function NavbarComponent( props ) {
  const logout = () => {
    localStorage.removeItem( "jwt" );
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
      <Navbar.Brand href={ "/" }>Stock Simulator</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav className="mr-auto">
          { !props.isAuthenticated && (
            <Link to="/login" className="nav-link">
              Sign in
            </Link>
          ) }

          { !props.isAuthenticated && (
            <Link to="/register" className="nav-link">
              Register
            </Link>
          ) }

          { props.isAuthenticated && (
            <Link to="/Guide" className="nav-link">
              Guide
            </Link>
          ) }

          { props.isAuthenticated && (
            <Link to="/News" className="nav-link">
              News
            </Link>
          ) }

          { props.isAuthenticated && (
            <Link to="/Trade" className="nav-link">
              Trade
            </Link>
          ) }

          { props.isAuthenticated && (
            <Link to="/watchlist" className="nav-link">
              Watchlist
            </Link>
          ) }

          { props.isAuthenticated && (
            <Link to="/Portfolio" className="nav-link">
              Portfolio
            </Link>
          ) }

          { props.isAuthenticated && (
            <Link to="/" className="nav-link" onClick={ logout }>
              Sign Out
            </Link>
          ) }

          { props.allMonthsReady && (
            <Button variant="secondary" onClick={ props.viewPreviousQuarter }>
              View Previous Quarter
            </Button>
          ) }

          { props.allMonthsReady && (
            <Button variant="secondary" onClick={ props.viewNextQuarter }>
              View Next Quarter
            </Button>
          ) }

          { props.allMonthsReady && (
            <Button variant="secondary" onClick={ props.forwardOneQuarter }>
              Forward Latest Quarter
            </Button>
          ) }

          { props.allMonthsReady && (
            <Navbar.Text>
              Viewing Quarter: { props.viewingMonth }
            </Navbar.Text>
          ) }

          { props.allMonthsReady && (
            <Navbar.Text>
              Latest Quarter: { props.latestMonth }
            </Navbar.Text>
          ) }
        </Nav>
      </Navbar.Collapse>
    </Navbar >
  );
}
