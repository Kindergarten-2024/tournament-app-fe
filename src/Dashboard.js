import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { FaSignOutAlt } from "react-icons/fa";
import { IoNotifications, IoNotificationsOff } from "react-icons/io5";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import "@leenguyen/react-flip-clock-countdown/dist/index.css";
import { AuthContext } from "./App";
import "./App.css";
import "./Dashboard.css";
import { getFirebaseToken, onMessageListener } from "./firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useWebSocketContext } from "./WebSocketContext";

const Dashboard = () => {
  const { user, checkLoginState } = useContext(AuthContext);
  const [rerender, setRerender] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [totalRegistered, setTotalRegistered] = useState(0);
  const [endTime, setEndTime] = useState(new Date());
  const [registerUp, setRegisterUp] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isTokenFound, setTokenFound] = useState(false);
  const [notification, setNotification] = useState({ title: "", body: "" });
  const [position, setPosition] = useState();
  const [score, setScore] = useState();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchPlayerPosition = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/player-position`);
        setPosition(response.data);
      } catch (error) {
        console.error("Error fetching player position: ", error);
      }
    };
    fetchPlayerPosition();
  }, []);

  useEffect(() => {
    const fetchPlayerScore = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/player-score`);
        setScore(response.data);
      } catch (error) {
        console.error("Error fetching player score: ", error);
      }
    };
    fetchPlayerScore();
  }, []);

  useEffect(() => {
    getFirebaseToken(setTokenFound);
    onMessageListener()
      .then((payload) => {
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
        });
        toast.info(`${payload.notification.body}`);
        console.log(payload);
      })
      .catch((err) => console.log("failed: ", err));
  }, [notification]);

  //SOCKET
  const { stompClient } = useWebSocketContext();

  useEffect(() => {
    let subscription;

    const subscribe = () => {
      if (stompClient && stompClient.connected) {
        subscription = stompClient.subscribe(
          "/registrations-time",
          onEndingRecieve
        );
      }
    };

    subscribe(); // Subscribe to the topics

    // Clean up subscriptions when the component unmounts
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [stompClient]);


  const onEndingRecieve = (payload) => {
    var payloadData = JSON.parse(payload.body);
    setRegisterUp(payloadData.timerOn);
    setRounds(payloadData.round);
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
        setRegisterUp(registrationsOpen);
        setEndTime(registrationsEndTime);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };
    checkRegistrations();
  }, [registerUp, endTime]);

  // Fetch the number or registered users, used for display the number
  useEffect(() => {
    const fetchRegisteredUsers = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/check/total-registered`
        );
        setTotalRegistered(response.data);
      } catch (error) {
        console.error("Error fetching registration status for user: ", error);
      }
    };
    fetchRegisteredUsers();
  }, [rerender]);

  useEffect(() => {
      localStorage.removeItem("showScore");
      localStorage.removeItem("position");
      localStorage.removeItem("score");
      localStorage.removeItem("stringsArray");
  }, []);
 
  // Logout, session clear
  const handleLogout = async () => {
    try {
      var confirmation = window.confirm("Are you sure you want to logout?");
      if (confirmation) {
        await axios.post(`${BACKEND_URL}/oauth/logout`);
        checkLoginState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaderboard = async () => {
    try {
      window.location.assign(
        `https://tournament-app-fe-zigpprg2xq-og.a.run.app/leaderboard`
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div>
        <div className="notification-status">
          {isTokenFound ? <IoNotifications /> : <IoNotificationsOff />}
        </div>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </div>

      <div className="user-info-container">
        <div className="user-info">
          <img
            src={user?.avatar_url}
            alt={user?.name}
            className="user-avatar"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
            }}
          />
          <div className="user-details">
            {user.name ? (
              <h4 className="start2p">{user?.name}</h4>
            ) : (
              <h4 className="start2p">{user?.login}</h4>
            )}
          </div>
        </div>
      </div>

      <div className="logout-container">
        <FaSignOutAlt
          onClick={handleLogout}
          className="logout-icon"
          style={{ cursor: "pointer" }}
        />
      </div>

      {!loading ? (
        <>
          <div className="countdown-container">
            <div>
              <h1 className="start2p">Round: {rounds}</h1>

              <FlipClockCountdown
                to={endTime}
                renderMap={[false, true, true, true]}
              />
            </div>
          </div>

          <div className="stats-container">
            <div className="stat">
              <h3 className="start2p">POS</h3>
              <div className="space"></div>
              <h3 className="start2p">SCORE</h3>
            </div>
            <div className="stat">
              <p className="start2p">{position}</p>
              <p className="start2p">{score}</p>
            </div>
          </div>

          <div className="bottom-dashboard-container">
            <div className="total-registered">
              <h3 className="start2p"> Total Registered</h3>
              <p className="start2p flash">{totalRegistered}</p>
            </div>

            <button className="leaderboard-button" onClick={handleLeaderboard}>
              Leaderboard
            </button>
          </div>
        </>
      ) : (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
