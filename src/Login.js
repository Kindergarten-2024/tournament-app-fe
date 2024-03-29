import React, { useState, useEffect } from "react";
import { GithubLoginButton } from "react-social-login-buttons"; // If you're using GoogleLoginButton, add it back here
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import logo from "./images/opapLogo.png";
import axios from "axios";
import "./App.css";
import Dashboard from "./Dashboard";
import { useWebSocket } from "./App";
// import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const [endTime, setEndTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const [username, setUsername] = useState("");
  const { timerOn, round } = useWebSocket();
  // const navigate = useNavigate();
  

  const handleGithubLogin = async () => {
    window.location.assign(`${BACKEND_URL}/oauth/login/github`);
  };


  useEffect(() => {
    // Set up Axios to include the JWT in the Authorization header for all requests
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    }
    
    // Check if the user is already logged in on component mount
    checkLoginStatus();
  }, []);

  // Function to check login status
  const checkLoginStatus = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/loggedin`);
      if (response.data.loggedIn) {
        // The user is logged in, redirect or update UI
      } else {
        // The user is not logged in, clear any stored token
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error("Check login status failed:", error);
    }
  };

  const handleCustomLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      const response = await axios.post(`${BACKEND_URL}/auth`, {
        email,
        password
      });

      if (response.status === 200) {
        console.log("Login successful:", response.data);
        localStorage.setItem('token',response.data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        console.log("before getting sent to dashboard");
        return <Dashboard />;
        // navigate('/dashboard');


        // Update UI or redirect as necessary
      } else if (response.status === 401){

        localStorage.removeItem('token');
        console.error("Login failed:", response.data);
        // Handle errors, update UI accordingly
      }
    } catch (error) {
      console.error("Login error:", error);
      // Display error message to user
    }
  };

  useEffect(() => {
    const checkRegistrations = async () => {
      try {
        const {
          data: { registrationsEndTime, rounds },
        } = await axios.get(`${BACKEND_URL}/admin/check/endtime`);
        setEndTime(registrationsEndTime);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    checkRegistrations();
  }, [endTime]);

  return (
    <>
      <div className="top-container">
        <h1 className="start2p">Welcome to Opap Tournament</h1>
      </div>
      <img src={logo} className="App-logo" alt="logo" />

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="middle-container">
          {timerOn ? (
            <div>
              <h1 className="start2p">Round {round} starts in</h1>
              <FlipClockCountdown
                to={endTime}
                renderMap={[false, true, true, true]}
              />
            </div>
          ) : (
            <div className="middle-container">
              <h1 className="start2p">Round {round} in progress...</h1>
            </div>
          )}
        </div>
      )}

      <div className="bottom-container">
        <GithubLoginButton className="btn" onClick={handleGithubLogin} />
        {/* Uncomment if you're using GoogleLoginButton */}
        {/* <GoogleLoginButton className="btn" onClick={handleGoogleLogin} /> */}
        {/* Custom Login Form Heading */}
        <div className="custom-login-heading">
          <h3>Or Log In With Email</h3>
        </div>

        <form onSubmit={handleCustomLogin} className="custom-login-form">
        {/* <div className="form-group">
            <input
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="form-control"
            />
          </div> */}
          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="form-control"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="form-control"
            />
          </div>

          <button type="submit" className="login-button">
            Log In
          </button>
        </form>
      </div>
    </>
  );
};

export default Login;
