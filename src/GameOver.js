import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./App";
import "./GameOver.css"
import { Fireworks } from 'fireworks-js'



const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GameOver = () => {
    const [loading, setLoading] = useState(true);
    const [leaderboard, setLeaderboard] = useState([]);
    const { user } = useContext(AuthContext);
    const [position, setPosition] = useState(0);
    const [winner, setWinner] = useState(null);
    
    const fireworks = new Fireworks(document.body, { /* options */ });
    fireworks.start();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                
                const response = await axios.get(`${BACKEND_URL}/leaderboard`);
                const leaderboardArray = response.data.map((player) => ({
                    name: player.username.includes('@') ? player.username.split('@')[0] : player.username,
                    avatar: player.avatarUrl,
                    score: player.score,
                    streak: player.correctAnswerStreak,
                }));
                const userIdentifier = user.login ? user.login : user.email;
                console.log(leaderboardArray);
                setLeaderboard(leaderboardArray);
                setWinner(leaderboardArray[0]);
                setLoading(false);
                
                // Find the index where name equals userIdentifier
                const userIndex = leaderboardArray.findIndex((player) => player.name === userIdentifier);
                console.log("User Index:", userIndex);
                setPosition(userIndex + 1);
            } catch (error) {
                console.error("Error fetching leaderboard: ", error);
            }
        };
        fetchLeaderboard();
    }, []);
    
    return (
        <>
            {!loading ? (
                <div className="game-over-container">
                    <div className="game-over-top-container">
                        <h2 className="start2p">GAME OVER</h2>
                    </div>

                    <div className="game-over-middle-container">
                        <p className="start2p">THE WINNER IS</p>
                        <img
                            src={winner.avatar_url ? winner.avatar_url : winner.avatar} 
                            alt={winner?.name}
                            style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "50%",
                            }}
                        />
                        <p className="winner-name">{winner.name}</p>
                    </div>

                    <div className="game-over-bottom-container">
                        <p className="start2p">YOU FINISHED #{position}</p>
                        <h2 className="start2p">THANKS FOR PLAYING</h2>
                    </div>
                </div>
            ) : (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            )}
        </>
    );
};

export default GameOver;
