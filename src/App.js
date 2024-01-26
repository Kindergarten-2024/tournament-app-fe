import {
  RouterProvider,
  createBrowserRouter,
  useNavigate,
} from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  GithubLoginButton,
  GoogleLoginButton,
} from "react-social-login-buttons";
import InteractiveBackground from "./InteractiveBackground";
import FlipClockCountdown from "@leenguyen/react-flip-clock-countdown";
import logo from "./images/opapLogo.png";
import axios from "axios";
import "./App.css";
import Quiz from "./Quiz";
import Leaderboard from "./Leaderboard";
import Dashboard from "./Dashboard";
import Clicker from "./Clicker";
import { over } from "stompjs";
import SockJS from "sockjs-client";

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
  const { checkLoginState } = useContext(AuthContext);
  let stompClient;

  const connect = () => {
    let Sock = new SockJS(`${BACKEND_URL}/ws-message`);
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  };

  const onConnected = () => {
    stompClient.subscribe("/registrations-time", onEndingRecieve);
  };

  const onError = (err) => {
    console.log(err);
  };

  const onEndingRecieve = (payload) => {
    var payloadData = JSON.parse(payload.body);
    setTimerOn(payloadData.timerOn);
    setRound(payloadData.round);
  };

  useEffect(() => {
    // Connect only if the user is logged in
    if (checkLoginState()) {
      connect();
    }
  }, [checkLoginState]);

  return { timerOn, round };
};

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

const Callback = () => {
  const { checkLoginState, loggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      if (loggedIn === false) {
        try {
          navigate("/");
        } catch (err) {
          console.error(err);
          navigate("/");
        }
      } else if (loggedIn === true) {
        navigate("/");
      }
    })();
  }, [checkLoginState, loggedIn, navigate]);
  return <></>;
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
      return <Question />;
    }
  } else if (loggedIn === false) {
    return <Login />;
  }

  return <></>;
};

const Question = () => {
  const { loggedIn } = useContext(AuthContext);

  if (loggedIn === true)
    return (
      <div>
        <Quiz />
      </div>
    );
  if (loggedIn === false) return <Login />;
  return <></>;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/auth/callback", // github will redirect here
    element: <Callback />,
  },
  {
    path: "/leaderboard",
    element: <Leaderboard />,
  },
]);

export { AuthContext };

function App() {
  return (
    <div className="App">
      <Clicker />
      <InteractiveBackground />
      <header className="App-header">
        <AuthContextProvider>
          <BrowserRouter>
            <RouterProvider router={router} />
          </BrowserRouter>
        </AuthContextProvider>
      </header>
    </div>
  );
}

export default App;
