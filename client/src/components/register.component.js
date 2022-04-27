import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';
import Axios from 'axios';

export default function Register() {
    const [ username, setUsername ] = useState();
    const [ password, setPassword ] = useState();
    const [ confirmPassword, setConfirmPassword ] = useState();


    useEffect( () => {
        const checkLoggedIn = async () => {
            if ( localStorage.getItem( 'jwt' ) ) {

                Axios( {
                    method: 'get',
                    url: 'http://3.135.31.228:5000/api/users/isAuthenticated',
                    headers: {
                        'Authorization': localStorage.getItem( 'jwt' ),
                    }
                } ).then( res => {
                    window.location = '/guide';

                } ).catch( err => {
                    localStorage.removeItem( 'jwt' );

                    window.location = '/register';
                } );
            }
        };
        checkLoggedIn();

    }, [] );

    const onSubmit = async ( e ) => {
        e.preventDefault();

        const registerUser = {
            username,
            password,
            confirmPassword
        };

        try {
            const userRes = await Axios.post( "http://3.135.31.228:5000/api/users/register", registerUser );
            const userId = userRes.data.user._id;
            console.log( "After register form submission, server returned user: ", userRes.data );
        }
        catch ( err ) {
            console.error( "Caught err: ", JSON.stringify( err ) );
            alert( `Error: ${err.response.data.errorMessage}` );
            return;
        }


        /* Automatic login. */
        const loginUser = {
            username,
            password,
        };
        try {
            const loginRes = await Axios.post( "http://3.135.31.228:5000/api/users/login", loginUser );
            localStorage.setItem( 'jwt', loginRes.data.token );
        }
        catch ( err ) {
            console.error( "Caught err: ", JSON.stringify( err ) );
            alert( `Error: ${err.response.data.errorMessage}` );
            return;
        }


        /* Redirect page to main app */
        window.location = '/guide';

        /* Start off with USD $1,000,000 */
        try {
            let res = await Axios( {
                method: "post",
                url: "http://3.135.31.228:5000/api/protected/trade/submitTrade",
                headers: {
                    Authorization: localStorage.getItem( "jwt" ),
                },
                data: {
                    tickerSymbol: "US-DOLLAR",
                    quantity: 1000000,
                    price: 1.0,
                    direction: "BUY",
                    isInit: true,
                },
            } );

            console.log( "Received from /api/protected/trade/submitTrade, res.data: \n", res.data );
            if ( res.data.message === "success" ) {
                console.log( "US-DOLLAR $1M balance initialization successful." );
            }
        }
        catch ( err ) {
            console.error( "Caught err: ", JSON.stringify( err ) );
            alert( `Error: ${err.response.data.errorMessage}` );
            return;
        }




    };


    return (
        <div className="row">
            <div className="col-sm-12 d-flex">
                <div className="card signin-card">
                    <div className="card-body">

                        <h5 className="card-title text-center">Register</h5>
                        <form onSubmit={ onSubmit } className="form-signin">
                            <div className="form-group">
                                <label htmlFor="inputEmail">Username</label>
                                <input type="text" className="form-control" placeholder="Username" onChange={ ( e ) => setUsername( e.target.value ) } />
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputEmail">Password</label>
                                <input type="password" className="form-control" placeholder="Password (Min 8 characters)" onChange={ ( e ) => setPassword( e.target.value ) } />
                            </div>
                            <div className="form-group">
                                <label htmlFor="inputEmail">Confirm Password</label>
                                <input type="password" className="form-control" placeholder="Re-enter Password" onChange={ ( e ) => setConfirmPassword( e.target.value ) } />
                            </div>
                            <div className="form-group">
                                <button className="btn btn-lg btn-primary btn-block text-uppercase signin-btn" type="submit">Register</button>
                            </div>
                            <Link to="/login" >Login</Link>

                        </form>
                    </div>
                </div>
            </div>
        </div>


    );
}
