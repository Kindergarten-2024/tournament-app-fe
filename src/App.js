import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import InteractiveBackground from "./InteractiveBackground";
import axios from "axios";
import "./App.css";
import Quiz from "./Quiz";
import Leaderboard from "./Leaderboard";
import Dashboard from "./Dashboard";
import Login from "./Login";
import Clicker from "./Clicker";
import { useWebSocketContext } from "./WebSocketContext";
import { WebSocketProvider } from "./WebSocketContext";

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
  const [timerOn, setTimerOn] = useState(true);
  const [round, setRound] = useState(1);
  const { stompClient } = useWebSocketContext(); // Use the context

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      const registrationSubscription = stompClient.subscribe(
        "/registrations-time",
        onEndingReceive
      );

      return () => {
        registrationSubscription.unsubscribe();
      };
    }
  }, [stompClient]);

  const onEndingReceive = (payload) => {
    var payloadData = JSON.parse(payload.body);
    setTimerOn(payloadData.timerOn);
    setRound(payloadData.round);
  };

  return { timerOn, round };
};

const Home = () => {
  const { loggedIn } = useContext(AuthContext);
  const { timerOn, round } = useWebSocket();

  if (round >= 3) {
    return <p className="start2p">Quiz Finished</p>;
  } else if (loggedIn === true) {
    if (timerOn === true) {
      return <Dashboard />;
    } else {
      return <Quiz />;
    }
  } else if (loggedIn === false) {
    return <Login />;
  }

  return <></>;
};

export { AuthContext, useWebSocket };

function App() {
  return (
    <div className="App">
      <Clicker />
      <InteractiveBackground />
      <header className="App-header">
        <AuthContextProvider>
          <WebSocketProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
              </Routes>
            </Router>
          </WebSocketProvider>
        </AuthContextProvider>
      </header>
    </div>
  );
}

export default App;