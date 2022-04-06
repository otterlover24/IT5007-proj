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
            setBeginMonth(res.data);
          });
  
          await Axios({
            method: "get",
            url: "http://localhost:5000/api/users/getLatestMonth",
            headers: {
              Authorization: localStorage.getItem("jwt"),
            },
          }).then(res => {
            console.log(res.data);
            setLatestMonth(res.data);
          });
  
          await Axios({
            method: "get",
            url: "http://localhost:5000/api/users/getViewingMonth",
            headers: {
              Authorization: localStorage.getItem("jwt"),
            },
          }).then(res => {
            console.log(res.data);
            setViewingMonth(res.data);
          });
        }
      } catch (err) {
        console.error('Error in getMonthVariables');
        console.error(err);
      }      
    };

    getMonthVariables();
  }, [props.isAuthenticated]);

  useEffect(() => {
    console.log(`beginMonth: ${beginMonth ? beginMonth.beginMonth : 'empty'}`);
    console.log(`latestMonth: ${latestMonth ? latestMonth.latestMonth : 'empty'}`);
    console.log(`viewingMonth: ${viewingMonth ? viewingMonth.viewingMonth : 'empty'}`);
  }, [beginMonth, latestMonth, viewingMonth]);

  const logout = () => {
    localStorage.removeItem("jwt");
    window.location = "/";
  };

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      bg="dark"
      variant="dark"
      className="nav-bar"
    >
      <Navbar.Brand href={props.isAuthenticated ? "/app" : "/"}>
        Finance
      </Navbar.Brand>
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
            <Link to="/crypto" className="nav-link">
              Crypto Agent
            </Link>
          )}

          {props.isAuthenticated && (
            <Link to="/watchlist" className="nav-link">
              My Watchlist
            </Link>
          )}

          {props.isAuthenticated && (
            <Link to="/" className="nav-link" onClick={logout}>
              Sign Out
            </Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
