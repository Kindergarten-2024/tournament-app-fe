import React, { useEffect, useState } from "react";
import { GithubLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import logo from "./images/opapLogo.png";
import axios from "axios";
import "./App.css";
import { useWebSocket } from "./App";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
    const [endTime, setEndTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const { timerOn, round } = useWebSocket();

    const handleGithubLogin = async () => {
        try {
            window.location.assign(`${BACKEND_URL}/oauth/login/github`);
        } catch (err) {
            console.error(err);
        }
    };
    const handleGoogleLogin = async () => {
        try {
            window.location.assign(`${BACKEND_URL}/oauth/login/google`);
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
                <GoogleLoginButton className="btn" onClick={handleGoogleLogin} />
            </div>
        </>
    );
};

export default Login;