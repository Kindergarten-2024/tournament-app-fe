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
import Snowstorm from "react-snowstorm";
import "react-step-progress-bar/styles.css";
import { Step } from "react-step-progress-bar";
import gifImage from "./images/wolf.gif";
import blueFire from "./images/bluefire.gif";
import redFire from "./images/redfire.gif";
import {
  IoIosCheckmarkCircle,
  IoIosCloseCircle,
  IoIosRemoveCircle,
} from "react-icons/io";
import countdownSound from "./music/countdown.mp3";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import "./Modal.css";
import { Modal } from "./Modal";

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

  if (
    typeof remainingTime !== "number" ||
    isNaN(remainingTime) ||
    remainingTime < 0 ||
    remainingTime > 15
  ) {
    return " "; // If remainingTime is not a number or outside the range 0 to 15, don't render anything
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
  const [streakMessage, setstreakMessage] = useState("");
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
  const [isMask, setIsMask] = useState(false);
  const [is5050, setIs5050] = useState(false);
  const [power, setPower] = useState(" ");
  const [powerDescription, setPowerDescription] = useState(" ");
  const [showPowerButton, setShowPowerButton] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [enemies, setEnemies] = useState([]);
  const [showEnemies, setShowEnemies] = useState(false);
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
      stompClient.subscribe(
        `/user/${user.login}/privateStreak`,
        onPrivateStreakMessageReceived
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
    setIsMask(false);
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
      //change this else if 50-50 added
      setReceivedMessage(messageBody);
      setIsMask(true);
    }
  };

  const onPrivateStreakMessageReceived = (payload) => {
    const messageBody = payload.body;
    setstreakMessage(messageBody);
  };

  useEffect(() => {
    if (receivedMessage) {
      const timeout = setTimeout(() => {
        setReceivedMessage(""); // Clear the received message after 5 seconds
      }, 5000);
      return () => clearTimeout(timeout); // Clear the timeout when component unmounts
    }
  }, [receivedMessage]);

  const onLeaderboardMessageReceived = (payload) => {
    const userDataArray = JSON.parse(payload.body);
    const leaderboardArray = userDataArray.map((user) => ({
      id: user.username,
      score: user.score,
      item: user.item,
    }));
    const playerIndex = leaderboardArray.findIndex(
      (user1) => user1.id === user.login
    );
    setPosition(playerIndex + 1);

    const player = leaderboardArray.find((user1) => user1.id === user.login);
    if (player) {
      setScore(player.score);
      setPower(player.item);
      let powerDesc;
      switch (power) {
        case "50-50":
          powerDesc =
            "Cut through the clutter by removing two incorrect answers, leaving you with a clearer path to victory.";
          break;
        case "freeze":
          powerDesc =
            "Freeze your enemies and shatter them into a thousand pieces! Pick a player to be trapped in ice, unable to answer the question.";
          break;
        case "mask":
          powerDesc =
            "Embrace the power of the Mask where deception reigns supreme! Steal from your enemies, stripping away their points and leaving them vulnerable in your wake.";
          break;
        default:
          powerDesc = " ";
      }
      setPowerDescription(powerDesc);
    }
  };

  useEffect(() => {
    const fetchPlayerItem = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/player-item`);
        setPower(response.data);
        let powerDesc;
        switch (power) {
          case "50-50":
            powerDesc =
              "Cut through the clutter by removing two incorrect answers, leaving you with a clearer path to victory.";
            break;
          case "freeze":
            powerDesc =
              "Freeze your enemies and shatter them into a thousand pieces! Pick a player to be trapped in ice, unable to answer the question.";
            break;
          case "mask":
            powerDesc =
              "Embrace the power of the Mask where deception reigns supreme! Steal from your enemies, stripping away their points and leaving them vulnerable in your wake.";
            break;
          default:
            powerDesc = " ";
        }
        setPowerDescription(powerDesc);
        if (power == null || power == "") setShowPowerButton(false);
        else setShowPowerButton(true);
      } catch (error) {
        console.error("Error fetching player score: ", error);
      }
    };
    fetchPlayerItem();
  }, [power, powerDescription]);

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

  const handleUsePower = () => {
    if (power !== "50-50") {
      fetchEnemies();
      setShowEnemies(true);
    } else setShowEnemies(false);
    setShowModal(true);
  };

  const fetchEnemies = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/leaderboard`);
      const playerListData = response.data;
      const playerList = playerListData.map((player) => ({
        id: player.id,
        name: player.username,
        freeze_debuff: player.freeze_debuff,
        mask_debuff: player.mask_debuff,
        score: player.score,
      }));

      let enemyList;
      switch (power) {
        case "freeze":
          enemyList = playerList.filter(
            (player) => player.name !== user.login && player.freeze_debuff < 2
          );
          break;
        case "mask":
          enemyList = playerList.filter(
            (player) => player.name !== user.login && !player.mask_debuff
          );
          break;
        default:
          enemyList = playerList.filter((player) => player.name !== user.login);
      }
      setEnemies(enemyList);
    } catch (error) {
      console.error("Error fetching list: ", error);
    }
  };

  const handeCancelPower = () => {
    setSelectedEnemy(null);
    setShowModal(false);
    setShowPowerButton(true);
  };

  const handleApplyPower = () => {
    if (power !== "50-50" && !selectedEnemy) return;
    else if (power !== "50-50" && selectedEnemy)
      sendPower(power, selectedEnemy);
    else sendPower(power, null);
    console.log("Applying power:", power, "to enemy:", selectedEnemy);
    setSelectedEnemy(null);
    setShowModal(false);
    setShowPowerButton(false);
  };

  const sendPower = (power, selectedEnemy) => {
    const messageObject = {
      message: power,
      enemy: selectedEnemy,
    };
    stompClient.send("/app/usePower", {}, JSON.stringify(messageObject));
  };

  let streakGif;
  switch (streakMessage) {
    case "X1":
      streakGif = redFire;
      break;
    case "X2":
    case "X3":
      streakGif = blueFire;
      break;
  }

  return (
    <div>
      {isFrozen && <Snowstorm />}
      <div>
        <div className="top-left-container">
          {streakGif && (
            <img src={streakGif} alt="Streak GIF" className="streak-gif" />
          )}
          {streakMessage && (
            <div>
              <div className="streak-fire-text">{streakMessage}</div>
              <div className="streak-text">streak: </div>
            </div>
          )}
        </div>
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
                        className={`
                        ${selectedAnswer === option ? "selected" : ""}
                        ${isFrozen ? "freeze-effect" : ""}
                        `}
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
                  {showPowerButton && (
                    <button
                      className="use-power-button"
                      onClick={handleUsePower}
                    >
                      ⚡ Power ⚡
                    </button>
                  )}
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
            </div>

            {showModal && (
              <Modal
                onCancel={handeCancelPower}
                onApply={handleApplyPower}
                onClose={handeCancelPower}
              >
                <div className="powers-container">
                  <button className="select-power-button">{power}</button>
                  <p>{powerDescription}</p>
                </div>
                {showEnemies && (
                  <div className="enemies-container">
                    <ul>
                      {loading ? (
                        <p>Loading...</p>
                      ) : (
                        enemies.map((enemy) => (
                          <li
                            key={enemy.name}
                            onClick={() => setSelectedEnemy(enemy.id)}
                            className={
                              selectedEnemy === enemy.id ? "selected" : ""
                            }
                          >
                            <span>
                              {enemy.name.length > 20
                                ? enemy.name.slice(0, 17) + "..."
                                : enemy.name}
                            </span>
                            <span>{enemy.score}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                )}
              </Modal>
            )}
            {isMask && (
              <div className="gif-image-container">
                {isMask && (
                  <img
                    src={gifImage}
                    alt="GIF"
                    className="gif-image moving-from-left"
                  />
                )}
              </div>
            )}
            {receivedMessage && (
              <div className="received-message-container">
                <p className="message-text">{receivedMessage}</p>
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
