import React, { useState, useEffect } from "react";
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import "./Leaderboard.css"

var stompClient = null;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


const Leaderboard = () => {
    const [leaderboardBefore, setLeaderboardBefore] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        connect();
    }, []);

    const connect = () => {
        let Sock = new SockJS(`${BACKEND_URL}/ws-message`);

        stompClient = over(Sock);
        stompClient.connect({}, onConnected, onError);
    };

    const onConnected = () => {
        stompClient.subscribe('/leaderboard', onPublicMessageReceived);
        stompClient.subscribe('/leaderboardBefore', onPublicMessageReceived);
        stompClient.subscribe('/logs', onLogMessageReceived);
        stompClient.subscribe('/lock', onAnswerReceived);
        
    };

    const onError = (err) => {
        console.log(err);
    };

    const onPublicMessageReceived = (payload) => {
        const topic = payload.headers.destination;
        const userDataArray = JSON.parse(payload.body);
        const leaderboardArray = userDataArray.map(user => ({
            id: user.username, 
            score: user.score 
        }));
    
        if (topic === '/leaderboard') {
            setLeaderboard(leaderboardArray);
        } else if (topic === '/leaderboardBefore') {
            setLeaderboard(leaderboardArray);
        }
    
        setLoading(false);
    };

    const onAnswerReceived = (payload) => {
        const data = JSON.parse(payload.body);
        const answeredUser=data.message;
        console.log("Answered User: ", answeredUser); // Debugging line
    
        setLeaderboard(currentLeaderboard => currentLeaderboard.map(user => {
            console.log("Checking user: ", user.id); // Debugging line
            return user.id === answeredUser ? { ...user, answered: true } : user;
        }));
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
    
        setLogs(currentLogs => [...currentLogs, newLog]);
    
        // Set a timeout for this specific message
        setTimeout(() => {
            setLogs(currentLogs => currentLogs.filter(log => log.id !== newLog.id));
        }, 3000);
    };

    
    return (
        <div className="container-wrap">
            {logs.map(log => (
                <div key={log.id} className="log-message" style={{
                    left: `${log.x}px`,
                    top: `${log.y}px`
                }}>
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
                    <table id="rankings" className="leaderboard-results" width="100%">
                        <thead>
                            <tr>
                                <th className="leaderboard-font">Rank</th>
                                <th className="leaderboard-font">Player</th>
                                <th className="leaderboard-font">PTS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((user, index) => (
                                <tr key={user.id} className={`leaderboard-row ${user.answered ? 'answered' : ''}`}>
                                    <td className="leaderboard-font">{index + 1}</td>
                                    <td className="leaderboard-font">{user.id}</td>
                                    <td className="leaderboard-font">{user.score}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                
            </section>
        </div>
        
    );
};

export default Leaderboard;
