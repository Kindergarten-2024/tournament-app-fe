import React, { useState, useEffect, useContext, Fragment } from "react";
import axios from "axios";
import "./Quiz.css";
import Timer from "./Timer";
import { AuthContext } from "./App";
import { useWebSocketContext } from "./WebSocketContext";
import CryptoJS from 'crypto-js';
import "react-step-progress-bar/styles.css";
import { ProgressBar, Step } from "react-step-progress-bar";
import { IoIosCheckmarkCircle, IoIosCloseCircle, IoIosRemoveCircle } from "react-icons/io";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Quiz = () => {
  // const CryptoJS = require("crypto-js");
  const SECRET_KEY = CryptoJS.enc.Utf8.parse("JufghajLODgaerts");
  const { user } = useContext(AuthContext);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [answerTime, setAnswerTime] = useState(Date.now());
  const [questionTimer, setQuestionTimer] = useState(Date.now());
  const [answerGiven, setAnswerGiven] = useState();
  const [questionIndex, setQuestionIndex] = useState();
  const [quizEnded, setQuizEnded] = useState(false);
  const [question, setQuestion] = useState();
  const [loading, setLoading] = useState(true);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(null);

  const [stringsArray, setStringsArray] = useState([]);

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
    // Check if array is null
    const storedArray = JSON.parse(localStorage.getItem('stringsArray'));
    if (storedArray === null) {
      // If array is null, initialize with 10 "pending" strings
      const initialArray = Array(10).fill('pending');
      setStringsArray(initialArray);
      localStorage.setItem('stringsArray', JSON.stringify(initialArray));
    } else {
      // If array is not null, load it from localStorage
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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching current question: ", error);
      }
    };
    fetchCurrentQuestion();
  }, []);

  const { stompClient } = useWebSocketContext();

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      stompClient.subscribe("/questions", onPublicMessageReceived);
      stompClient.subscribe("/leaderboard", onLeaderboardMessageReceived);
    }

    // Clean up subscriptions when the component unmounts
    return () => {
      if (stompClient) {
        stompClient.unsubscribe("/questions");
        stompClient.unsubscribe("/leaderboard");
      }
    };
  }, [stompClient]);

  const onError = (err) => {
    console.log(err);
  };

    
  function decrypt(encryptedValue) {
    if (encryptedValue === undefined) {
        throw new Error('encryptedValue is undefined');
    }
    // Decrypt without specifying the IV since ECB mode is used
    const decrypted = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
}


  const onPublicMessageReceived = (payload) => {
    var payloadData = JSON.parse(payload.body); 
    setQuestion(payloadData);
    setTimerKey(Math.random());
  // Only try to decrypt if the answer is not an empty string
    if (payloadData.answer) {
      setAnswerGiven(decrypt(payloadData.answer));
    } else {
      console.warn("Received empty answer string");
    }
  
    setQuestionTimer();
    setQuestionIndex(payloadData.questionNumber);
    setShowScore(false);
  };

  const onLeaderboardMessageReceived = (payload) => {
    const userDataArray = JSON.parse(payload.body);
    const leaderboardArray = userDataArray.map((user) => ({
      id: user.username,
      score: user.score,
    }));
    const playerIndex = leaderboardArray.findIndex(
      (user1) => user1.id === user.login
    );
    setPosition(playerIndex + 1);
    const player = leaderboardArray.find((user1) => user1.id === user.login);
    if (player) {
      setScore(player.score);
    }
    setShowScore(true);
  };

  useEffect(() => {
    setProgress((questionIndex % 10) * 10);
  }, [questionIndex]);

  useEffect(() => {
    if (question) {
      const question_time = new Date(question.time);
      var timer = Math.abs(question_time - Date.now() + 15499);
      var timer_in_sec = Math.round(timer / 1000);
      setQuestionTimer(timer_in_sec);
    }
  }, [question]);

  const handleAnswer = (selected) => {
    setSelectedAnswer(selected);
  };

  const convertToReadableTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // function decrypt(encryptedValue){
  //   const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
  //   return bytes.toString(CryptoJS.enc.Utf8);
  // }

  const checkAnswer = () => {
    console.log("Check answer");
    if (selectedAnswer === "") {
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

  const timeUpMessage = () => {
    const messageObject = {
      message: "questionEnded",
    };
    stompClient.send("/app/questionEnded", {}, JSON.stringify(messageObject)); // Ask for Leaderboard

    if (questionIndex == 10 || questionIndex == 20) {
      setQuizEnded(true);
      localStorage.removeItem("showScore");
      localStorage.removeItem("position");
      localStorage.removeItem("score");
    }

    updateString(questionIndex-1, "corrrect");
  };

  // Function to update a string at a specific index
  const updateString = (index, value) => {
    const newArray = [...stringsArray];
    newArray[index] = value;
    setStringsArray(newArray);
    localStorage.setItem('stringsArray', JSON.stringify(newArray));
  };
  
  function CustomProgressBar({ numQuestions, statuses, progressPercentage }) {
    return (
      <ProgressBar percent={progressPercentage} filledBackground="#3498db">
        {statuses.map((status, index) => (
          <Step key={index} transition="scale">
            {({ accomplished }) => (
              <Fragment>
                {status === 'correct' ? (
                  <IoIosCheckmarkCircle
                    style={{ filter: `grayscale(${accomplished ? 0 : 10}%)` }}
                    size={30}
                    color="green"
                  />
                ) : status === 'false' ? (
                  <IoIosCloseCircle
                    style={{ filter: `grayscale(${accomplished ? 0 : 80}%)` }}
                    size={30}
                    color="red"
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
      </ProgressBar>
    );
  }


  return (
    <div>
      {!quizEnded ? (
        <div>
          {!showScore ? (
            <div>
              {question && !loading ? (
                <>
                  <CustomProgressBar numQuestions={10} statuses={stringsArray} progressPercentage={(questionIndex % 11) * 10} />

                  <Timer
                    key={timerKey}
                    timeLimit={questionTimer}
                    onTimeout={() => {
                      checkAnswer();
                      timeUpMessage();
                    }}
                  />
                  <div className="question-container">
                    <h2 className="start2p">
                      Question {question.questionNumber}
                    </h2>
                    <p className="start2p">{question.question}</p>
                    <div className="answer-buttons">
                      {question.options.map((option, index) => (
                        <button
                          key={index}
                          className={
                            selectedAnswer === option ? "selected" : ""
                          }
                          onClick={() =>
                            handleAnswer(
                              selectedAnswer === option ? "" : option
                            )
                          }
                        >
                          <span className="option-letter">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              )}
            </div>
          ) : (
            <section>
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
        </div>
      ) : (
        <p className="start2p">Round Finished</p>
      )}
    </div>
  );
};

export default Quiz;
