import React, { useState, useEffect, useContext } from "react";
import "./Quiz.css";
import Timer from "./Timer";
import { over } from 'stompjs';
import SockJS from 'sockjs-client';
import { AuthContext } from './App';

var stompClient = null;

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;


const Quiz = () => {
  const { user } = useContext(AuthContext);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [answerTime, setAnswerTime] = useState(Date.now());
  const [questionTimer, setQuestionTimer] = useState(Date.now());
  const [questionIndex, setQuestionIndex] = useState();
  const [quizEnded, setQuizEnded] = useState(false);

  const [question, setQuestion] = useState(() => {
    const storedQuestion = localStorage.getItem("quizQuestion");
    return storedQuestion ? JSON.parse(storedQuestion) : null;
  });

  const [showScore, setShowScore] = useState(() => {
    const storedShowScore = localStorage.getItem("showScore");
    return storedShowScore ? JSON.parse(storedShowScore) : false;
  });

  const [answerSubmitted, setAnswerSubmitted] = useState(() => {
    const storedAnswerSubmitted = localStorage.getItem("answerSubmitted");
    return storedAnswerSubmitted ? JSON.parse(storedAnswerSubmitted) : null;
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
    if (question) {
      localStorage.setItem("quizQuestion", JSON.stringify(question));
    }
  }, [question]);

  useEffect(() => {
    localStorage.setItem("answerSubmitted", JSON.stringify(answerSubmitted));
  }, [answerSubmitted]);

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
    if (question) {
      setQuestionIndex(question.questionNumber);
    } else {
      setQuestionIndex(1);
    }
  }, []);

  useEffect(() => {
    connect();
  }, []);

  const connect = () => {
    let Sock = new SockJS(`${BACKEND_URL}/ws-message`);
    stompClient = over(Sock);
    stompClient.connect({}, onConnected, onError);
  }

  const onConnected = () => {
  stompClient.subscribe('/questions', (questionMessage) => {
    onPublicMessageRecieved(questionMessage);

    stompClient.subscribe('/leaderboard', onLeaderboardMessageRecieved);
  });
}

  const onError = (err) => {
    console.log(err);
  }

  const onPublicMessageRecieved = (payload) => {
    var payloadData = JSON.parse(payload.body);
    setQuestion(payloadData);
    setAnswerSubmitted(false);
    setTimerKey(Math.random());
    setQuestionTimer();
    setQuestionIndex(payloadData.questionNumber);
    setShowScore(false);
  }

  const onLeaderboardMessageRecieved = (payload) => {
    const userDataArray = JSON.parse(payload.body);
    const leaderboardArray = userDataArray.map(user => ({
      id: user.username,
      score: user.score
    }));
    const playerIndex = leaderboardArray.findIndex(user1 => user1.id === user.login);
    setPosition(playerIndex + 1);
    const player = leaderboardArray.find(user1 => user1.id === user.login);
    if (player) {
      setScore(player.score);
    }
    setShowScore(true);
  };

  useEffect(() => {
    setProgress(questionIndex * 25);
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

  const checkAnswer = () => {
    if (selectedAnswer === "") {
      return;
    }
    setAnswerTime(Date.now());  // Capture the time immediately when an answer is selected
    const messageObject = {
      time: convertToReadableTime(answerTime),
      answer: selectedAnswer,
      questionId: question.id,
      message: "answered",
    };
    stompClient.send("/app/sendMessageAndAnswer", {}, JSON.stringify(messageObject));

    setSelectedAnswer("");
    setAnswerSubmitted(true);
  };

  // useEffect(() => {
  //   if (quizEnded) {
  //     const timer = setTimeout(() => {
  //       console.log("Clearing local storage after 10 seconds...");
  //       localStorage.removeItem("showScore");
  //       localStorage.removeItem("quizQuestion");
  //       localStorage.removeItem("answerSubmitted");
  //       localStorage.removeItem("position");
  //       localStorage.removeItem("score");
  //       setQuizEnded(false); // Reset for the next quiz
  //       window.location.reload();
  //     }, 1);

  //     return () => clearTimeout(timer);
  //   }
  // }, [quizEnded]);

  const timeUpMessage = () => {
    // User did not answer on time
    const messageObject = {
      message: "questionEnded",
    };
    stompClient.send("/app/questionEnded", {}, JSON.stringify(messageObject)); //asks for leaderboard
    if (!answerSubmitted) {
      const messageObject = {
        answer: "-",
        questionId: question.id,
        message: "didn't answer on time!"
      };
      stompClient.send("/app/sendMessageAndAnswer", {}, JSON.stringify(messageObject));
    }

    // Show 3 Questions
    if (questionIndex == 3) {
      setQuizEnded(true);
      localStorage.removeItem("showScore");
      localStorage.removeItem("quizQuestion");
      localStorage.removeItem("answerSubmitted");
      localStorage.removeItem("position");
      localStorage.removeItem("score");
    }
  };

  return (
    <div>
      {!quizEnded ? (
        <div>
          {!showScore ? (
            <div>
              {question ? (
                <>
                  <Timer
                    key={timerKey}
                    timeLimit={questionTimer}
                    onTimeout={() => {
                      timeUpMessage();
                    }}
                  />

                  {!answerSubmitted ? (
                    <div className="question-container">
                      <h2 className="start2p">Question {question.questionNumber}</h2>
                      <div className="progress-bar-container">
                        <div className="progress-bar">
                          <div
                            className="progress"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      <p className="start2p">{question.question}</p>
                      <div className="answer-buttons">
                        {question.options.map((option, index) => (
                          <button
                            key={index}
                            className={selectedAnswer === option ? "selected" : ""}
                            onClick={() =>
                              handleAnswer(selectedAnswer === option ? "" : option)
                            }
                          >
                            <span className="option-letter">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </button>
                        ))}
                      </div>
                      <br />
                      <button className="submit-button" onClick={checkAnswer}>
                        Submit
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h1 className="start2p">Waiting for others...</h1>
                    </div>
                  )}
                </>
              ) : (
                <></>
              )}
            </div>
          ) : (
            <section>
              <table id="rankings" className="leaderboard-results-2" width="100">
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