import React, {
    useEffect,
    useRef,
    useState,
    createContext,
    useContext,
    useCallback,
} from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import InteractiveBackground from "./InteractiveBackground";
import axios from "axios";
import "./App.css";
import backgroundMusic from "./music/Retro 80s.mp3"
import Quiz from "./Quiz";
import Dashboard from "./Dashboard";
import Login from "./Login";
import {useWebSocketContext} from "./WebSocketContext";
import {WebSocketProvider} from "./WebSocketContext";
import MainLeaderboard from "./Leaderboard";
import QRcode from "./QRcode";
import opap_logo from "./images/opap_logo.png";
import {IoMdHelpCircleOutline} from "react-icons/io";
import {MdMusicNote, MdMusicOff} from "react-icons/md";
import {Modal} from "./Instructions";
import "./Instructions.css";

// Ensures cookie is sent
axios.defaults.withCredentials = true;

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContextProvider = ({children}) => {
    const [loggedIn, setLoggedIn] = useState(null);
    const [user, setUser] = useState(null);

    const checkLoginState = useCallback(async () => {
        try {
            const {
                data: {loggedIn: logged_in, user},
            } = await axios.get(`${BACKEND_URL}/loggedin`);
            setLoggedIn(logged_in);
            setUser(user);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        checkLoginState();
    }, [checkLoginState]);

    return (
        <AuthContext.Provider value={{loggedIn, checkLoginState, user}}>
            {children}
        </AuthContext.Provider>
    );
};

const useWebSocket = () => {
    const [timerOn, setTimerOn] = useState(null);
    const [round, setRound] = useState(1);
    const [error, setError] = useState(null);
    const {stompClient} = useWebSocketContext();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (stompClient && stompClient.connected) {
                    const registrationSubscription = stompClient.subscribe(
                        "/registrations-time",
                        onEndingReceive
                    );

                    return () => {
                        registrationSubscription.unsubscribe();
                    };
                }
            } catch (error) {
                setError(error);
            }
        };

        fetchData();
    }, [stompClient]);

    const onEndingReceive = (payload) => {
        try {
            var payloadData = JSON.parse(payload.body);
            setTimerOn(payloadData.timerOn);
            setRound(payloadData.round);
        } catch (error) {
            setError(error);
        }
    };

    return {timerOn, round, error};
};

const Home = () => {
    const {loggedIn, checkLoginState} = useContext(AuthContext);
    const {timerOn, round} = useWebSocket();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await checkLoginState();
            setIsLoading(false);
        };
        fetchData();
    }, [checkLoginState]);

    if (isLoading) {
        return (
            <div className="loading-spinner">
                <div className="spinner"></div>
            </div>
        );
    }

    if (round >= 3) {
        return <p className="start2p">Quiz Finished</p>;
    } else if (loggedIn === true) {
        if (timerOn === null) {
            return (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            );
        } else if (timerOn === true) {
            return <Dashboard/>;
        } else if (timerOn === false) {
            return <Quiz/>;
        }
    } else if (loggedIn === false) {
        return <Login/>;
    }

    return <></>;
};

export {AuthContext, useWebSocket};

function App() {

    const audioRef = useRef();
    const [isPlaying, setIsPlaying] = useState(false); // state to track if the music is playing
    const [showInstructions, setShowInstructions] = useState(false); // state to show game instructions

    useEffect(() => {
        // Function to play or pause music based on `isPlaying` state
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(error => console.error("Error playing the music:", error));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Toggle play/pause
    const toggleMusic = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="App">
            <InteractiveBackground/>
            <header className="App-header">
                <AuthContextProvider>
                    <WebSocketProvider>
                        <Router>
                            <img src={opap_logo} className="opap-logo" alt="opap logo"></img>
                            <div className="instructions-toggle">
                                <IoMdHelpCircleOutline onClick={() => setShowInstructions(!showInstructions)}/>
                            </div>
                            <div className="music-toggle">
                                {isPlaying ? (
                                    <MdMusicNote onClick={toggleMusic}/>
                                ) : (
                                    <MdMusicOff onClick={toggleMusic}/>
                                )}
                            </div>

                            {showInstructions && (
                                <Modal
                                    onApply={() => setShowInstructions(false)}
                                    onClose={() => setShowInstructions(false)}>
                                </Modal>
                            )}

                            <Routes>
                                <Route path="/" element={<Home/>}/>
                                <Route path="/qr" element={<QRcode/>}/>
                                <Route path="/mainleaderboard" element={<MainLeaderboard/>}/>
                            </Routes>
                        </Router>
                    </WebSocketProvider>
                </AuthContextProvider>
            </header>
            <audio ref={audioRef} src={backgroundMusic} loop/>
        </div>
    );
}

export default App;
