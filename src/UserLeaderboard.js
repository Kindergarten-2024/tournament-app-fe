import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UserLeaderboard.css"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const UserLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPlayerPosition = async () => {
            try {
                const response = await axios.get(
                    `${BACKEND_URL}/leaderboard`
                );
                setLeaderboard(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching leaderboard: ", error);
            }
        };
        fetchPlayerPosition();
    }, []);

    return (
        <div className="container-wrap">
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
                    <div className="scrollable-leaderboard">
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
                                    <tr key={user.id}>
                                        <td className="leaderboard-font">{index + 1}</td>
                                        <td className="leaderboard-font">{user.username}</td>
                                        <td className="leaderboard-font">{user.score}</td>
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

export default UserLeaderboard;
