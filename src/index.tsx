import React from "react"
import ReactDOM from "react-dom"
import { BrowserRouter as Router } from "react-router-dom"
import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import "bootstrap-icons/font/bootstrap-icons.css";
import { UserProvider } from "./components/UserContext"
// import AuthContextProvider from './pages/AuthContext';

ReactDOM.render(
  <UserProvider>
    <Router>
        <App/>
    </Router>
  </UserProvider>,
  document.getElementById("root")
);
reportWebVitals()
