import React, { useEffect, useState } from "react";
import {
  GithubLoginButton,
  LinkedInLoginButton,
} from "react-social-login-buttons";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import logo from "./images/opapLogo.png";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const [endTime, setEndTime] = useState(new Date());
  const [timerOn, setTimerOn] = useState(null);
  const [round, setRound] = useState(1);
  const [loading, setLoading] = useState(true);

  const handleGithubLogin = async () => {
    try {
      window.location.assign(`${BACKEND_URL}/oauth/login/github`);
    } catch (err) {
      console.error(err);
    }
  };
  const handleLinkedinLogin = async () => {
    try {
      window.location.assign(`${BACKEND_URL}/oauth/login/linkedin`);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const checkRegistrations = async () => {
      try {
        const {
          data: {
            registrationsOpen: registrationsOpen,
            registrationsEndTime,
            rounds,
          },
        } = await axios.get(`${BACKEND_URL}/public/check/endtime`);
        setTimerOn(registrationsOpen);
        setEndTime(registrationsEndTime);
        setRound(rounds);
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
        <LinkedInLoginButton className="btn" onClick={handleLinkedinLogin} />
      </div>
    </>
  );
};

export default Login;
