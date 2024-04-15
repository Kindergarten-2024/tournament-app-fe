import React, { useEffect, useState } from "react";
import "./Leaderboard.css";
import axios from "axios";
import SockJS from "sockjs-client";
import { over } from "stompjs";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
var stompClient = null;

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  // const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  const connect = () => {
    let Sock = new SockJS(`${BACKEND_URL}/ws-message`);
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    stompClient.subscribe("/leaderboard", onPublicMessageReceived);
    // stompClient.subscribe("/logs", onLogMessageReceived);
  };

  const onError = (error) => {
    console.error("WebSocket error: ", error);
    setTimeout(() => {
      console.log("Attempting to reconnect to WebSocket...");
      connect();
    }, 1000);
  };

  const disconnect = () => {
    if (stompClient) {
      stompClient.disconnect();
    }
    console.log("WebSocket connection closed");
  };

  const onPublicMessageReceived = (payload) => {
    const topic = payload.headers.destination;
    const userDataArray = JSON.parse(payload.body);
    const leaderboardArray = userDataArray.map((user) => ({
      id: user.username.includes('@') ? user.username.split('@')[0] : user.username,
      score: user.score,
      avatar: user.avatarUrl,
      streak: user.correctAnswerStreak,
    }));

    if (topic === "/leaderboard") {
      setLeaderboard(leaderboardArray);
    }
    setLoading(false);
  };

  //leaderboard show correct score after reload
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/leaderboard`);
        const leaderboardArray = response.data.map((user) => ({
          id: user.username.includes('@') ? user.username.split('@')[0] : user.username,
          score: user.score,
          avatar: user.avatarUrl,
          streak: user.correctAnswerStreak,
        }));
        console.log(leaderboardArray);
        setLeaderboard(leaderboardArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard: ", error);
      }
    };
    fetchLeaderboard();
  }, []);

  // const onLogMessageReceived = (payload) => {
  //   const data = JSON.parse(payload.body);
  //   const message = data.message;
  //   const randomX = Math.random() * window.innerWidth;
  //   const randomY = Math.random() * window.innerHeight;

  //   // Determine if the message indicates registration or unregistration
  //   const isRegister = message.includes("unregister");

  //   // Set the class name based on registration status
  //   const className = !isRegister
  //     ? "log-message-register"
  //     : "log-message-unregister";

  //   const newLog = {
  //     id: Date.now() + Math.random(), // Ensures unique ID even if messages are received at the same time
  //     text: message,
  //     x: randomX,
  //     y: randomY,
  //     className: className, // Add className to the new log entry
  //   };

  //   setLogs((currentLogs) => [...currentLogs, newLog]);

  //   // Set a timeout for this specific message
  //   setTimeout(() => {
  //     setLogs((currentLogs) =>
  //       currentLogs.filter((log) => log.id !== newLog.id)
  //     );
  //   }, 3000);
  // };

  return (
    <div className="container-wrap">
      {/* {logs.map((log) => (
        <div
          key={log.id}
          className={log.className}
          style={{
            left: `${log.x}px`,
            top: `${log.y}px`,
          }}
        >
          {log.text}
        </div>
      ))} */}

      <section id="leaderboard">
        <nav className="ladder-nav">
          <div className="ladder-title">
            <h1 className="leaderboard-font">HIGH SCORES</h1>
          </div>
        </nav>
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="leaderboard-content">
            <div className="top-players">
              {leaderboard.slice(0, 3).map((user, index) => (
                <div
                  key={user.id}
                  className={`top-player top-player-${index + 1}`}
                >
                  <div className="player-rank">{index + 1}</div>
                  <div className="player-avatar">
                    <img src={user.avatar} />
                  </div>
                  <div className="player-info">
                    <div className="start2p">
                      {user.id &&
                        (user.id.length > 14 ? user.id.slice(0, 14) : user.id)}
                    </div>
                    <div className="start2p">{user.score}</div>
                    <div className="start2p">Streak: {user.streak}</div>
                  </div>
                </div>
              ))}
            </div>

            <table
              id="rankings-rest"
              className="leaderboard-results"
              width="100%"
            >
              <tbody>
                {leaderboard.slice(3, 20).map((user, index) => (
                  <tr>
                    <td className="start2p">{index + 4}</td>
                    <td className="start2p">
                      {user.id && user.id.length && user.id.length > 40
                        ? user.id.slice(0, 40)
                        : user.id}
                    </td>
                    <td className="start2p">{user.score}</td>
                    <td className="start2p">Streak: {user.streak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Leaderboard;
