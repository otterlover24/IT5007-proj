import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Axios from 'axios';
import './App.css';
import Navbar from "./components/navbar.component";
import "bootstrap/dist/css/bootstrap.min.css";
import LandingPage from "./components/landing-page.component";
import Login from "./components/login.component";
import Register from "./components/register.component";
import Portfolio from "./components/portfolio.component";
import Watchlist from "./components/watchlist.component";
import Trade from "./components/trade.component";
import News from "./components/news.component";

function App() {
  const [ loggedIn, setLoggedIn ] = useState( false );
  const [ beginMonth, setBeginMonth ] = useState();
  const [ latestMonth, setLatestMonth ] = useState();
  const [ viewingMonth, setViewingMonth ] = useState();
  const [ allMonthsReady, setAllMonthsReady ] = useState();
  const [ getMonthVariablesFlag, setGetMonthVariablesFlag ] = useState( true );

  useEffect( () => {
    checkLoggedIn();
    getMonthVariables();
  }, [] );

  useEffect( () => {
    getMonthVariables();
  }, [ loggedIn, getMonthVariablesFlag ] );


  useEffect( () => {
    console.log( `beginMonth: ${beginMonth ? beginMonth : "empty"}` );
    console.log( `latestMonth: ${latestMonth ? latestMonth : "empty"}` );
    console.log( `viewingMonth: ${viewingMonth ? viewingMonth : "empty"}` );
    if ( beginMonth && latestMonth && viewingMonth ) {
      setAllMonthsReady( true );
    }
  }, [ beginMonth, latestMonth, viewingMonth ] );

  const checkLoggedIn = async () => {
    if ( localStorage.getItem( 'jwt' ) ) {

      Axios( {
        method: 'get',
        url: 'http://localhost:5000/api/users/isAuthenticated',
        headers: {
          'Authorization': localStorage.getItem( 'jwt' ),
        }
      } ).then( res => {
        console.log( res.data );
        setLoggedIn( res );
      } )
        .catch( err => {
          localStorage.removeItem( 'jwt' );
        } );
    }
  };

  const getMonthVariables = async () => {
    try {
      if ( loggedIn ) {
        console.log( `in getMonth` );

        /* 
        Get `beginMonth`, `latestMonth`, `viewingMonth` from server's users route's 
        `getBeginMonth`, `getLatestMonth`, `getViewingMonth` respectively.
        */
        await Axios( {
          method: "get",
          url: "http://localhost:5000/api/users/getBeginMonth",
          headers: {
            Authorization: localStorage.getItem( "jwt" ),
          },
        } ).then( res => {
          console.log( res.data );
          setBeginMonth( res.data.beginMonth );
        } );

        await Axios( {
          method: "get",
          url: "http://localhost:5000/api/users/getLatestMonth",
          headers: {
            Authorization: localStorage.getItem( "jwt" ),
          },
        } ).then( res => {
          console.log( res.data );
          setLatestMonth( res.data.latestMonth );
        } );

        await Axios( {
          method: "get",
          url: "http://localhost:5000/api/users/getViewingMonth",
          headers: {
            Authorization: localStorage.getItem( "jwt" ),
          },
        } ).then( res => {
          console.log( res.data );
          setViewingMonth( res.data.viewingMonth );
        } );
      }
    } catch ( err ) {
      console.error( "Error in getMonthVariables" );
      console.error( err );
    }
  };

  return (
    <Router>
      <div className="container-fluid">
        <Navbar isAuthenticated={ loggedIn } />

        <Switch>
          <Route path="/" exact component={ LandingPage } />
          <Route path="/login" exact component={ Login } />
          <Route path="/register" exact component={ Register } />
          <Route path="/trade" exact component={ Trade } />
          <Route path="/portfolio" exact component={ Portfolio } />
          <Route path="/watchlist" exact render={ props => <Watchlist viewingMonth={viewingMonth}/> } />
          <Route path="/news" exact component={ News } />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
