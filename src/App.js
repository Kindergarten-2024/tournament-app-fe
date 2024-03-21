import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import InteractiveBackground from "./InteractiveBackground";
import axios from "axios";
import "./App.css";
import backgroundMusic from "./music/Retro 80s.mp3"
import musicNoteIcon from "./images/music1.png"
import Quiz from "./Quiz";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Clicker from "./Clicker";
import { useWebSocketContext } from "./WebSocketContext";
import { WebSocketProvider } from "./WebSocketContext";
import UserLeaderboard from "./UserLeaderboard";
import MainLeaderboard from "./Leaderboard";
import QRcode from "./QRcode";


// Ensures cookie is sent
axios.defaults.withCredentials = true;

const AuthContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const AuthContextProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [user, setUser] = useState(null);

  const checkLoginState = useCallback(async () => {
    try {
      const {
        data: { loggedIn: logged_in, user },
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
    <AuthContext.Provider value={{ loggedIn, checkLoginState, user }}>
      {children}
    </AuthContext.Provider>
  );
};

const useWebSocket = () => {
  const [timerOn, setTimerOn] = useState(null); 
  const [round, setRound] = useState(1);
  const [error, setError] = useState(null);
  const { stompClient } = useWebSocketContext(); 

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

  return { timerOn, round, error };
};

const Home = () => {
  const { loggedIn, checkLoginState } = useContext(AuthContext);
  const { timerOn, round } = useWebSocket();
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
      return <Dashboard />;
      // return <Quiz />;
    } else if (timerOn === false) {
      return <Quiz />;
    }
  } else if (loggedIn === false) {
    return <Login />;
  }

  return <></>;
};

export { AuthContext, useWebSocket };

function App() {

  const audioRef = useRef();
  const [isPlaying, setIsPlaying] = useState(false); // state to track if the music is playing

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



  // useEffect(() => {
  //   // Function to start playing music
  //   const playMusic = async () => {
  //     if (audioRef.current) {
  //       try {
  //         await audioRef.current.play();
  //         setIsPlaying(true); // Set the state to true when the music starts playing
  //       } catch (error) {
  //         console.log("Playback was prevented. Error:", error);
  //       }
  //     }
  //   };

  //   // Function to pause the music
  //   const pauseMusic = () => {
  //     if (audioRef.current) {
  //       audioRef.current.pause();
  //       setIsPlaying(false); // Set the state to false when the music is paused
  //     }
  //   };

  //   // Toggle play/pause based on isPlaying state
  //   if (isPlaying) {
  //     playMusic();
  //   } else {
  //     pauseMusic();
  //   }

  // }, [isPlaying]); // This effect depends on the isPlaying state

  // // Handler to toggle the music state
  // const toggleMusic = () => {
  //   setIsPlaying(!isPlaying);
  // };
  // useEffect(() => {
  //   // Check if the audioRef is current and has the play method
  //   if (audioRef.current && typeof audioRef.current.play === 'function') {
  //     // Play the music as soon as the component mounts
  //     audioRef.current.play().catch(error => console.log("Play was prevented by the browser:", error));
  //   }
  // }, []);

  return (
    <div className="App">
      {/* Toggle button */}
      {/* <button onClick={toggleMusic}>
        {isPlaying ? 'Stop Music' : 'Play Music'}
      </button> */}

      {/* Audio element */}
      {/* <audio ref={audioRef} src={backgroundMusic} loop />      */}



      <Clicker />
      <InteractiveBackground />
      <header className="App-header">
        <AuthContextProvider>
          <WebSocketProvider>
            <Router>
              {/* Music toggle button */}
              <button onClick={toggleMusic} className="music-toggle">
                <img src={musicNoteIcon} alt="Toggle Music" />
              </button>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/qr" element={<QRcode />} />
                <Route path="/leaderboard" element={<UserLeaderboard />} />
                <Route path="/mainleaderboard" element={<MainLeaderboard />} />
              </Routes>
            </Router>
          </WebSocketProvider>
        </AuthContextProvider>
      </header>
      <audio ref={audioRef} src={backgroundMusic} loop />
    </div>
  );
}

export default App;
