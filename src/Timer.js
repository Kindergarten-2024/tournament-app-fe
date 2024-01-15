import React, { useState, useEffect } from 'react';
import './Timer.css';

const Timer = ({ timeLimit, onTimeout, resetTimer }) => {
  const [startTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(startTime);

  useEffect(() => {
    const intervalID = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalID);
    };
  }, []);

  useEffect(() => {
    if (resetTimer) {
      setCurrentTime(startTime);
    }
  }, [resetTimer, startTime]);

  useEffect(() => {
    if (currentTime - startTime >= 1000 + timeLimit * 1000) {
      // The timer has expired, call the onTimeout function
      onTimeout();
    }
  }, [currentTime, startTime, timeLimit, onTimeout]);

  const elapsedMilliseconds = currentTime - startTime;
  const timeLeft = Math.max(timeLimit - Math.floor(elapsedMilliseconds / 1000), 0);

  const percentage = (timeLeft / timeLimit) * 100;
  const isRedTimer = timeLeft <= 10;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={`timer-container ${isRedTimer ? 'red-timer' : ''}`}>
      <svg height="100" width="100">
        <circle
          className="timer-circle"
          stroke={isRedTimer ? 'red' : '#3498db'}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percentage / 100) * circumference}
          cx="50"
          cy="50"
          r={radius}
        />
        <text x="50" y="50" textAnchor="middle" dy="0.3em" className={`timer-text ${isRedTimer ? 'red-text' : ''}`}>
          {timeLeft}
        </text>
      </svg>
    </div>
  );
};

export default Timer;
