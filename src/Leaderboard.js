import React, { useEffect, useState } from "react";
import "./Leaderboard.css";
import axios from "axios";
import { useWebSocketContext } from "./WebSocketContext";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Leaderboard = () => {
  const [leaderboardBefore, setLeaderboardBefore] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  //socket
  const { stompClient } = useWebSocketContext();

  useEffect(() => {
    let leaderboardSubscription, logsSubscription, lockSubscription;

    const subscribe = () => {
      if (stompClient && stompClient.connected) {
        leaderboardSubscription = stompClient.subscribe(
          "/leaderboard",
          onPublicMessageReceived
        );
        logsSubscription = stompClient.subscribe("/logs", onLogMessageReceived);
        lockSubscription = stompClient.subscribe("/lock", onAnswerReceived);
      }
    };

    subscribe(); // Subscribe to the topics

    // Clean up subscriptions when the component unmounts
    return () => {
      if (leaderboardSubscription) {
        leaderboardSubscription.unsubscribe();
      }
      if (logsSubscription) {
        logsSubscription.unsubscribe();
      }
      if (lockSubscription) {
        lockSubscription.unsubscribe();
      }
    };
  }, [stompClient]);

  //end of socket

  const onPublicMessageReceived = (payload) => {
    const topic = payload.headers.destination;
    const userDataArray = JSON.parse(payload.body);
    const leaderboardArray = userDataArray.map((user) => ({
      id: user.username,
      score: user.score,
      avatar: user.avatarUrl,
    }));

    if (topic === "/leaderboard") {
      setLeaderboard(leaderboardArray);
    }

    setLoading(false);
  };

  //leaderboard show correct score after reload
  useEffect(() => {
    const fetchPlayerPosition = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/leaderboard`);
        const leaderboardArray = response.data.map((user) => ({
          id: user.username,
          score: user.score,
          avatar: user.avatarUrl,
        }));
        console.log(leaderboardArray);
        setLeaderboard(leaderboardArray);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching leaderboard: ", error);
      }
    };
    fetchPlayerPosition();
  }, []);

  const onAnswerReceived = (payload) => {
    const data = JSON.parse(payload.body);
    const answeredUser = data.message;
    console.log("Answered User: ", answeredUser); // Debugging line

    setLeaderboard((currentLeaderboard) =>
      currentLeaderboard.map((user) => {
        console.log("Checking user: ", user.id); // Debugging line
        return user.id === answeredUser ? { ...user, answered: true } : user;
      })
    );
  };

  const onLogMessageReceived = (payload) => {
    const data = JSON.parse(payload.body);
    const message = data.message;
    const randomX = Math.random() * window.innerWidth;
    const randomY = Math.random() * window.innerHeight;

    const newLog = {
      id: Date.now() + Math.random(), // Ensures unique ID even if messages are received at the same time
      text: message,
      x: randomX,
      y: randomY,
    };

    setLogs((currentLogs) => [...currentLogs, newLog]);

    // Set a timeout for this specific message
    setTimeout(() => {
      setLogs((currentLogs) =>
        currentLogs.filter((log) => log.id !== newLog.id)
      );
    }, 3000);
  };

  return (
    <div className="container-wrap">
      {logs.map((log) => (
        <div
          key={log.id}
          className="log-message"
          style={{
            left: `${log.x}px`,
            top: `${log.y}px`,
          }}
        >
          {log.text}
        </div>
      ))}
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
                    <div className="start2p">{user.id}</div>
                    <div className="start2p">{user.score}</div>
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
                    <td className="start2p">{user.id}</td>
                    <td className="start2p">{user.score}</td>
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
