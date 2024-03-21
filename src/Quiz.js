import React, {
  useState,
  useEffect,
  useContext,
  Fragment,
  useRef,
} from "react";
import axios from "axios";
import "./Quiz.css";
import { AuthContext } from "./App";
import { useWebSocketContext } from "./WebSocketContext";
import CryptoJS from "crypto-js";
import "react-step-progress-bar/styles.css";
import { Step } from "react-step-progress-bar";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoIosRemoveCircle,
} from "react-icons/io";
import countdownSound from "./music/countdown.mp3";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "./Powers.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const SECRET_KEY = CryptoJS.enc.Utf8.parse("JufghajLODgaerts");

const useRenderTime = ({ remainingTime }) => {
  const currentTime = useRef(null); // Initialize to null instead of remainingTime
  const prevTime = useRef(null);
  const isNewTimeFirstTick = useRef(false);
  const [, setOneLastRerender] = useState(0);

  useEffect(() => {
    if (currentTime.current !== null && currentTime.current !== remainingTime) {
      isNewTimeFirstTick.current = true;
      prevTime.current = currentTime.current;
      currentTime.current = remainingTime;
    } else {
      isNewTimeFirstTick.current = false;
    }

    // force one last re-render when the time is over to trigger the last animation
    if (remainingTime === 0) {
      setTimeout(() => {
        setOneLastRerender((val) => val + 1);
      }, 20);
    }
  }, [remainingTime]);

  if (remainingTime === null) {
    return null; // If remainingTime is null, don't render anything
  }

  const isTimeUp = isNewTimeFirstTick.current;

  return (
    <div className="time-wrapper">
      <div key={remainingTime} className={`time ${isTimeUp ? "up" : ""}`}>
        {remainingTime}
      </div>
      {prevTime.current !== null && (
        <div
          key={prevTime.current}
          className={`time ${!isTimeUp ? "down" : ""}`}
        >
          {prevTime.current}
        </div>
      )}
    </div>
  );
};

const Quiz = () => {
  const { user } = useContext(AuthContext);
  const { stompClient } = useWebSocketContext();
  const { remainingTime } = CountdownCircleTimer;
  const renderTimeComponent = useRenderTime({ remainingTime });
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [answerTime, setAnswerTime] = useState(Date.now());
  const [questionTimer, setQuestionTimer] = useState(Date.now());
  const [decryptedAnswer, setDecryptedAnswer] = useState();
  const [questionIndex, setQuestionIndex] = useState();
  const [question, setQuestion] = useState();
  const [loading, setLoading] = useState(true);
  const [stringsArray, setStringsArray] = useState([]);
  const [lastSelectedAnswer, setLastSelectedAnswer] = useState("");
  const countdownAudioRef = useRef(new Audio(countdownSound));
  const [soundPlayedForQuestion, setSoundPlayedForQuestion] = useState(false);
  const [receivedMessage, setReceivedMessage] = useState("");
  const [isFrozen, setIsFrozen] = useState(false);
  const [showUsePowerButton, setShowUsePowerButton] = useState(false);
  const [showPowers, setShowPowers] = useState(false);
  const [powerList, setPowerList] = useState([]);
  const [selectedPower, setSelectedPower] = useState(null);
  const [enemyList, setEnemyList] = useState([]);
  const [selectedEnemy, setSelectedEnemy] = useState(null);

  const [showScore, setShowScore] = useState(() => {
    const storedShowScore = localStorage.getItem("showScore");
    return storedShowScore ? JSON.parse(storedShowScore) : false;
  });

  //position
  const [position, setPosition] = useState(() => {
    const storedPuestion = localStorage.getItem("position");
    return storedPuestion ? JSON.parse(storedPuestion) : null;
  });

  //score
  const [score, setScore] = useState(() => {
    const storedScore = localStorage.getItem("score");
    return storedScore ? JSON.parse(storedScore) : null;
  });

  useEffect(() => {
    localStorage.setItem("showScore", JSON.stringify(showScore));
  }, [showScore]);

  //position
  useEffect(() => {
    localStorage.setItem("position", JSON.stringify(position));
  }, [position]);

  //score
  useEffect(() => {
    localStorage.setItem("score", JSON.stringify(score));
  }, [score]);

  useEffect(() => {
    const storedArray = JSON.parse(localStorage.getItem("stringsArray"));
    if (storedArray === null) {
      const initialArray = Array(10).fill("pending"); // If array is null, initialize with 10 "pending" strings
      setStringsArray(initialArray);
      localStorage.setItem("stringsArray", JSON.stringify(initialArray));
    } else {
      setStringsArray(storedArray);
    }
  }, []);

  useEffect(() => {
    const fetchCurrentQuestion = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}/admin/questions/get-current-question`
        );
        setQuestion(response.data);
        setQuestionIndex(response.data.questionNumber);

        // updateString(questionIndex - 1, "current");
        if (response.data.answer) {
          setDecryptedAnswer(decrypt(response.data.answer));
        } else {
          console.warn("Received empty answer string");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching current question: ", error);
      }
    };
    fetchCurrentQuestion();
  }, []);

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.subscribe("/questions", onPublicMessageReceived);
      stompClient.subscribe("/leaderboard", onLeaderboardMessageReceived);
      stompClient.subscribe(
        `/user/${user.login}/private`,
        onPrivateMessageReceived
      );
    }
    // Clean up subscriptions when the component unmounts
    return () => {
      if (stompClient) {
        stompClient.unsubscribe("/questions");
        stompClient.unsubscribe("/leaderboard");
      }
    };
  }, [stompClient]);

  useEffect(() => {
    // if (soundPlayedForQuestion) {
    //   countdownAudioRef.current.pause();
    //   countdownAudioRef.current.currentTime = 0; // Reset audio playback to start
    //   setSoundPlayedForQuestion(false);
    // }
    console.log(soundPlayedForQuestion);
    console.log("find me !!!!!!!!!!!!!!!!!!!!!!!!{@{@@{@{@{@{@");
    if (question) {
      axios
        .get(`${BACKEND_URL}/admin/questions/time-now`)
        .then((response) => {
          const question_time = new Date(question.time);
          const currentTime = new Date(response.data);
          const timer = Math.abs(question_time - currentTime + 15499);
          const timer_in_sec = Math.round(timer / 1000);
          setQuestionTimer(timer_in_sec);
        })
        .catch((error) => {
          console.error("Error fetching current time:", error);
        });
    }
  }, [question]);

  useEffect(() => {
    if (questionIndex % 10 == 1) {
      setProgress(0);
    } else if (questionIndex % 10 == 0) {
      setProgress(100);
    } else {
      setProgress((((questionIndex - 1) % 10) * 100) / 9);
    }
  }, [questionIndex]);

  function decrypt(encryptedValue) {
    if (encryptedValue === undefined) {
      throw new Error("encryptedValue is undefined");
    }
    // Decrypt without specifying the IV since ECB mode is used
    const decrypted = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  const onPublicMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body);
    setQuestion(payloadData);
    setIsFrozen(false);
    setTimerKey(Math.random());
    // Only try to decrypt if the answer is not an empty string
    if (payloadData.answer) {
      setDecryptedAnswer(decrypt(payloadData.answer));
    } else {
      console.warn("Received empty answer string");
    }
    setQuestionTimer();
    setQuestionIndex(payloadData.questionNumber);
    // updateString(questionIndex - 1, "current");
    setShowScore(false);
  };
  ////////////power message
  const onPrivateMessageReceived = (payload) => {
    const messageBody = payload.body;
    console.log("Received message:", messageBody);
    if (messageBody.startsWith("freeze:")) {
      const actualMessage = messageBody.slice("freeze:".length);
      setReceivedMessage(actualMessage);
      setIsFrozen(true);
    } else {
      setReceivedMessage(messageBody);
    }
  };

  useEffect(() => {
    if (receivedMessage) {
      const timeout = setTimeout(() => {
        setReceivedMessage(""); // Clear the received message after 5 seconds
      }, 5000);

      return () => clearTimeout(timeout); // Clear the timeout when component unmounts
    }
  }, [receivedMessage]);
  ///////////
  const onLeaderboardMessageReceived = (payload) => {
    const userDataArray = JSON.parse(payload.body);
    const leaderboardArray = userDataArray.map((user) => ({
      id: user.username,
      score: user.score,
      power: user.item,
    }));
    const playerIndex = leaderboardArray.findIndex(
      (user1) => user1.id === user.login
    );
    setPosition(playerIndex + 1);

    const player = leaderboardArray.find((user1) => user1.id === user.login);
    if (player) {
      setScore(player.score);

      // Check if the Player has Powers
      const powerList = [player.power];
      setPowerList(powerList);

      if (powerList[0]) {
        setShowUsePowerButton(true);
        setShowPowers(false);
      } else setShowUsePowerButton(false);
    }
  };

  const handleAnswer = (selected) => {
    setSelectedAnswer(selected);
    //keep time here
  };

  const convertToReadableTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getOptionClass = (option) => {
    if (option === decryptedAnswer) {
      return "correct-answer";
    } else if (
      option === lastSelectedAnswer &&
      lastSelectedAnswer !== decryptedAnswer
    ) {
      return "incorrect-answer";
    }
    return "";
  };

  const checkAnswer = () => {
    setLastSelectedAnswer(selectedAnswer); // Add this line before resetting selectedAnswer
    if (selectedAnswer === "") {
      updateString(questionIndex - 1, "false");
      const messageObject = {
        answer: "-",
        questionId: question.id,
        message: "didn't answer on time!",
      };
      stompClient.send(
        "/app/sendMessageAndAnswer",
        {},
        JSON.stringify(messageObject)
      );
    } else {
      console.log(
        "Selected: " + selectedAnswer + " Decrypted: " + decryptedAnswer
      );
      if (selectedAnswer == decryptedAnswer) {
        updateString(questionIndex - 1, "correct");
      } else {
        updateString(questionIndex - 1, "false");
      }
      setAnswerTime(Date.now());
      const messageObject = {
        time: convertToReadableTime(answerTime),
        answer: selectedAnswer,
        questionId: question.id,
        message: "answered",
      };
      stompClient.send(
        "/app/sendMessageAndAnswer",
        {},
        JSON.stringify(messageObject)
      );
      setSelectedAnswer("");
    }
  };

  // Function to update a string at a specific index
  const updateString = (index, value) => {
    const newArray = [...stringsArray];
    newArray[index % 10] = value;
    setStringsArray(newArray);
    localStorage.setItem("stringsArray", JSON.stringify(newArray));
  };

  const playCountdownSound = () => {
    if (!soundPlayedForQuestion) {
      countdownAudioRef.current
        .play()
        .catch((error) => console.error("Error playing the sound:", error));
      setSoundPlayedForQuestion(true);
    }
  };

  function CustomProgressBar({ numQuestions, statuses, progressPercentage }) {
    return (
      <>
        {statuses.map((status, index) => (
          <Step key={index} transition="scale">
            {({ accomplished }) => (
              <Fragment>
                {status === "correct" ? (
                  <IoIosCheckmarkCircle
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    size={30}
                    color="green"
                  />
                ) : status === "false" ? (
                  <IoIosCloseCircle
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    size={30}
                    color="red"
                  />
                ) : status === "current" ? (
                  <IoIosCheckmarkCircle
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    size={30}
                    color="yellow"
                  />
                ) : (
                  <IoIosRemoveCircle
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    size={30}
                    color="grey"
                  />
                )}
              </Fragment>
            )}
          </Step>
        ))}
      </>
    );
  }

  const handleCancelPower = () => {
    setShowPowers(false);
    setShowUsePowerButton(true);
  };

  const handleApplyPower = () => {
    if (selectedEnemy && selectedPower) {
      console.log("Applying power:", selectedPower, "to enemy:", selectedEnemy);
      sendPower(selectedPower, selectedEnemy);
      setSelectedEnemy(null);
      setSelectedPower(null);
      setShowPowers(false);
    } else {
      console.log("Please select an enemy and a power.");
    }
  };

  const sendPower = (power, selectedEnemy) => {
    const messageObject = {
      message: power,
      enemy: selectedEnemy,
    };
    stompClient.send("/app/usePower", {}, JSON.stringify(messageObject));
  };

  const handleUsePower = async () => {
    fetchEnemyList();
    setShowUsePowerButton(false);
    setShowPowers(true);
  };

  const fetchEnemyList = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/leaderboard`);
      const playerListData = response.data;
      const playerList = playerListData.map((player) => ({
        id: player.id,
        name: player.username,
        power: player.item,
      }));
      const enemyList = playerList.filter(
        (player) => player.name !== user.login
      );
      setEnemyList(enemyList);
    } catch (error) {
      console.error("Error fetching list: ", error);
    }
  };

  return (
    <div>
      <div>
        {question && !loading ? (
          <>
            <div className="steps-container">
              <CustomProgressBar
                numQuestions={10}
                statuses={stringsArray}
                progressPercentage={progress}
              />
            </div>
            {!showScore ? (
              <div className="timer-wrapper">
                <CountdownCircleTimer
                  isPlaying
                  duration={questionTimer}
                  size={120}
                  colors={["#0F3587", "#8C1BC5", "#BFAA30", "#D61818"]}
                  colorsTime={[15, 10, 5, 0]}
                  onComplete={() => {
                    //method to stop countdown
                    if (soundPlayedForQuestion) {
                      countdownAudioRef.current.pause();
                      countdownAudioRef.current.currentTime = 0; // Reset audio playback to start
                      setSoundPlayedForQuestion(false);
                    }
                    checkAnswer();
                    setShowScore(true);
                    return { shouldRepeat: true, delay: 0 };
                  }}
                  onUpdate={(remainingTime) => {
                    if (remainingTime === 5) {
                      playCountdownSound();
                    }
                  }}
                >
                  {useRenderTime}
                </CountdownCircleTimer>
              </div>
            ) : (
              <section className="centered-section">
                <table
                  id="rankings"
                  className="leaderboard-results-2"
                  width="100"
                >
                  <thead>
                    <tr>
                      <th className="leaderboard-font-2">Rank</th>
                      <th className="leaderboard-font-2">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="leaderboard-font-2">{position}</td>
                      <td className="leaderboard-font-2">{score}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            <div className="question-container">
              <h2 className="start2p">Question {question.questionNumber}</h2>
              <p className="start2p">{question.question}</p>
              {!showScore ? (
                <>
                  <div className="answer-buttons">
                    {question.options.map((option, index) => (
                      <button
                        key={index}
                        className={`${
                          selectedAnswer === option ? "selected" : ""
                        } ${isFrozen ? "freeze-effect" : ""}`}
                        onClick={() =>
                          handleAnswer(selectedAnswer === option ? "" : option)
                        }
                        disabled={isFrozen}
                      >
                        <span className="option-letter">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="answer-buttons">
                    {question?.options.map((option, index) => (
                      <button
                        key={index}
                        className={`${getOptionClass(option)}`}
                        disabled
                      >
                        <span className="option-letter">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {showUsePowerButton && (
                <>
                  {/* Use Power Button */}
                  <button className="use-power-button" onClick={handleUsePower}>
                    ⚡Power⚡
                  </button>
                </>
              )}
              {showPowers && (
                <div className="use-power-container">
                  {/* Available Powers */}
                  <div className="available-powers">
                    <ul>
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        powerList.map((power) => (
                          <li
                            key={power}
                            onClick={() => setSelectedPower(power)}
                            className={
                              selectedPower === power ? "selected" : ""
                            }
                          >
                            {power}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* Available Enemies */}
                  <div className="available-enemies">
                    <ul>
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        enemyList.map((enemy) => (
                          <li
                            key={enemy.name}
                            onClick={() => setSelectedEnemy(enemy.id)}
                            className={
                              selectedEnemy === enemy.id ? "selected" : ""
                            }
                          >
                            {enemy.name &&
                              (enemy.name.length > 14
                                ? enemy.name.slice(0, 14) + "..."
                                : enemy.name)}
                          </li>
                        ))
                      )}
                    </ul>
                  </div>

                  {/* Cancel Power Button*/}
                  <button
                    className="cancel-power-button"
                    onClick={handleCancelPower}
                  >
                    Cancel
                  </button>

                  {/* Apply Power Button*/}
                  <button
                    className="apply-power-button"
                    onClick={handleApplyPower}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
            {receivedMessage && (
              <div className="received-message-container">
                <p>{receivedMessage}</p>
              </div>
            )}
          </>
        ) : (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
