// import React, { useState, useEffect } from "react";
// import "./Timer.css";



// import tickSound from "./music/countdown.mp3"

// const Timer = ({ timeLimit, onTimeout, resetTimer }) => {
//   const [startTime] = useState(Date.now());
//   const [currentTime, setCurrentTime] = useState(startTime);

//   useEffect(() => {
//     const intervalID = setInterval(() => {
//       setCurrentTime(Date.now());
//     }, 1000);

//     return () => {
//       clearInterval(intervalID);
//     };
//   }, []);

//   useEffect(() => {
//     if (resetTimer) {
//       setCurrentTime(startTime);
//     }
//   }, [resetTimer, startTime]);

//   useEffect(() => {
//     if (currentTime - startTime >= 1000 + timeLimit * 1000) {
//       // The timer has expired, call the onTimeout function
//       console.log("timer up");
//       onTimeout();
//     }
//   }, [currentTime, startTime, timeLimit, onTimeout]);

//   useEffect(() => {

//     console.log("I am Here please find me!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
//     // Play the tick sound when time left is 5 seconds, ensuring it only plays once
//     if (timeLeft <= 5 && timeLeft > 0 && !soundPlayed.current) {
//       const tickSound = new Audio('/music/countdown.mp3'); // Ensure the path is correct
//       tickSound.play().catch(error => console.error("Error playing the sound:", error));
//       soundPlayed.current = true; // Prevents multiple playbacks
//     }
//   }, [timeLeft]);

//   const elapsedMilliseconds = currentTime - startTime;
//   const timeLeft = Math.max(
//     timeLimit - Math.floor(elapsedMilliseconds / 1000),
//     0
//   );

//   // useEffect(() => {
//   //   // Play the tick sound when time left is 5 seconds
//   //   if (timeLeft <= 5 && timeLeft > 0) {

//   //     console.log("im in last 5 seconds!!!!!!!!!!!!!!!!")
//   //     tickSound.play().catch(error => console.error("Error playing the sound:", error));
//   //   }
//   // }, [timeLeft]);

//   const percentage = (timeLeft / timeLimit) * 100;
//   const isRedTimer = timeLeft <= 5;

//   const radius = 45;
//   const circumference = 2 * Math.PI * radius;

//   return (
//     <div className={`timer-container ${isRedTimer ? "red-timer" : ""}`}>
//       <svg height="100" width="100">
//         <circle
//           className="timer-circle"
//           stroke={isRedTimer ? "red" : "#3498db"}
//           fill="transparent"
//           strokeDasharray={circumference}
//           strokeDashoffset={circumference - (percentage / 100) * circumference}
//           cx="50"
//           cy="50"
//           r={radius}
//         />
//         <text
//           x="50"
//           y="50"
//           textAnchor="middle"
//           dy="0.3em"
//           className={`timer-text ${isRedTimer ? "red-text" : ""}`}
//         >
//           {timeLeft}
//         </text>
//       </svg>
//     </div>
//   );
// };

// export default Timer;


import React, { useState, useEffect, useRef } from "react";
import "./Timer.css";
import tickSound from "./music/countdown.mp3";

const Timer = ({ timeLimit, onTimeout, resetTimer }) => {
  const [startTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(startTime);
  const audioRef = useRef(new Audio(tickSound)); // Use useRef to hold the audio object

  useEffect(() => {
    const intervalID = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(intervalID);
  }, []);

  useEffect(() => {
    if (resetTimer) {
      setCurrentTime(startTime);
    }
  }, [resetTimer, startTime]);

  useEffect(() => {
    if (currentTime - startTime >= timeLimit * 1000) {
      onTimeout();
    }
  }, [currentTime, onTimeout, startTime, timeLimit]);

  const elapsedMilliseconds = currentTime - startTime;
  const timeLeft = Math.max(
    timeLimit - Math.floor(elapsedMilliseconds / 1000),
    0
  );

  const playSound = () => {
    audioRef.current.play().catch(error => console.error("Error playing the sound:", error));
  };

  // Optional: Hide the button and automatically play the sound when the timer is not in the last 5 seconds
  useEffect(() => {
    if (timeLeft < 5 && timeLeft > 0) {
      playSound();
    }
  }, [timeLeft]);

  const percentage = (timeLeft / timeLimit) * 100;
  const isRedTimer = timeLeft <= 5;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`timer-container ${isRedTimer ? "red-timer" : ""}`}>
      <svg height="100" width="100">
        <circle
          className="timer-circle"
          stroke={isRedTimer ? "red" : "#3498db"}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percentage / 100) * circumference}
          cx="50"
          cy="50"
          r={radius}
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dy="0.3em"
          className={`timer-text ${isRedTimer ? "red-text" : ""}`}
        >
          {timeLeft}
        </text>
      </svg>
      {timeLeft <= 5 && timeLeft > 0 && (
        <button onClick={playSound} className="play-sound-button">
          Play Sound
        </button>
      )}
    </div>
  );
};

export default Timer;
