import React, { useState, useEffect } from "react";

import "../App.css";
import Axios from "axios";
import "../components/component.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ErrorModal from "../components/error-modal.component";
import EditModal from "../components/edit-modal.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt, faEdit } from "@fortawesome/free-solid-svg-icons";

import { Doughnut } from "react-chartjs-2";

import {
  Container,
  Dropdown,
  ButtonGroup,
  DropdownButton,
  Button,
  Col,
  Row,
  Table,
} from "react-bootstrap";

export default function Watchlist() {
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);

  const [transactionTitle, setTransactionTitle] = useState();
  const [transactionAmount, setTransactionAmount] = useState();

  const [transactionType, setTransactionType] = useState();

  const [ticker, setTicker] = useState();

  const [error, setError] = useState();
  const [editModalShow, setEditModalShow] = useState(false);

  const [errorModalShow, setErrorModalShow] = useState(false);

  const [transactionToEdit, setTransactionToEdit] = useState([]);
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

    readTransactions();
    console.log("test");
  }, []);
  const readTransactions = async () => {
    setEditModalShow(false);
    await Axios({
      method: "get",
      url: "http://localhost:5000/api/protected/income//getHistory",
      headers: {
        Authorization: localStorage.getItem("jwt"),
      },
    }).then(res => {
      setTransactions(res.data);
      // calculateNetworth(res.data);
    });
  };
  
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
          ticker
        },
      }).then(res => {
        console.log(`Sent ticker to /api/protected/watchlist/addTicker`);
      });
    } catch (err) {
      setError(err.response.data.Error);
      setErrorModalShow(true);
    }
  };
  const onChangeDate = date => {
    setTransactionDate(date);
  };
  const deletetransaction = async id => {
    await Axios({
      method: "delete",
      url: "http://localhost:5000/api/protected/income/deleteTransaction/" + id,
      headers: {
        Authorization: localStorage.getItem("jwt"),
      },
    }).then(res => {
      setTransactions(res.data);
    });
  };
  const editTransaction = async transaction => {
    setTransactionToEdit(transaction);
    setEditModalShow(true);
  };
  const Transactions = props => {
    let amount = props.transaction.transactionAmount;
    if (props.transaction.transactionType === "EXPENSE") {
      amount = "-$" + amount;
    } else {
      amount = "$" + amount;
    }
    return (
      <tbody>
        <tr>
          <td key={props.transaction._id}>
            {props.transaction.transactionTitle}
          </td>
          <td>{props.transaction.transactionType}</td>
          <td>{amount}</td>
          <td>{props.transaction.transactionDate.substring(0, 10)}</td>
          <td className="test">
            <Button
              id="edit-button"
              onClick={() => editTransaction(props.transaction)}
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
            <Button
              id="delete-button"
              onClick={() => deletetransaction(props.transaction._id)}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </Button>{" "}
          </td>
        </tr>
      </tbody>
    );
  };

  return (
    <Container>
      <EditModal
        show={editModalShow}
        onHide={() => readTransactions()}
        transaction={transactionToEdit}
      />
      <ErrorModal
        show={errorModalShow}
        onHide={() => setErrorModalShow(false)}
        error={error}
      />
      <Row>
        <Col xs="12" md="6">
          <div className="card expense-input-card">
            <div className="card-body">
              <h5 className="card-title text-center">Watchlist</h5>
              <form onSubmit={onAddTickerSubmit} className="form-signin">
                <div className="form-group">
                  <label htmlFor="inputExpenseTitle">Ticker</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ticker"
                    onChange={e => setTicker(e.target.value)}
                  />
                </div>

                <button
                  className="btn btn-lg btn-primary btn-block text-uppercase input-expense-btn"
                  type="submit"
                >
                  Add to Watchlist
                </button>
              </form>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs="12">
          <Table className="income-table" striped bordered hover responsive>
            <thead>
              <tr>
                <th>Transaction Name</th>
                <th>Transaction Type</th>

                <th>Amount</th>
                <th>Date</th>
                <th>Edit/Delete</th>
              </tr>
            </thead>

            {transactions.map(currentTransaction => (
              <Transactions
                transaction={currentTransaction}
                key={currentTransaction._id}
              />
            ))}
          </Table>
        </Col>
      </Row>
    </Container>
  );
}
