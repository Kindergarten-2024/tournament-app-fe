import React, { useState } from "react";
import "./Clicker.css";
import logo2 from "./images/OPAP_button.png";
import ballImage1 from "./images/OPAP_button.png";
import ballImage2 from "./images/kino-bonus.png";
import ballImage3 from "./images/play.png";
import ballImage4 from "./images/S5A.png";
import ballImage5 from "./images/skrats.png";
import ballImage6 from "./images/powerspin.png";
import ballImage7 from "./images/tzoker.png";

const Clicker = () => {
  const [balls, setBalls] = useState([]);

  const ballImages = [
    ballImage1,
    ballImage2,
    ballImage3,
    ballImage4,
    ballImage5,
    ballImage6,
    ballImage7,
  ];

  const getClassName = (image) => {
    if ([ballImage1, ballImage3].includes(image)) {
      return "extraHorizontalImage";
    } else if ([ballImage2, ballImage5, ballImage7].includes(image)) {
      return "horizontalImage";
    } else {
      return "ball";
    }
  };

  const handleButtonClick = () => {
    const randomIndex = Math.floor(Math.random() * ballImages.length);
    const selectedImage = ballImages[randomIndex];

    const newBall = {
      id: Math.random(),
      left: Math.random() * window.innerWidth,
      top: Math.random() * window.innerHeight,
      image: selectedImage,
      className: getClassName(selectedImage),
    };

    setBalls((currentBalls) => {
      if (currentBalls.length >= 15) {
        return currentBalls;
      }
      return [...currentBalls, newBall];
    });

    setTimeout(() => {
      setBalls((currentBalls) =>
        currentBalls.filter((ball) => ball.id !== newBall.id)
      );
    }, 3000);
  };

  return (
    <div className="clicker-container">
      <div className="clicker-icon">
        <img
          onClick={handleButtonClick}
          src={logo2}
          alt="logo2"
          width="95"
          height="200"
        />
        {balls.map((ball) => (
          <div
            key={ball.id}
            className={ball.className}
            style={{
              left: ball.left + "px",
              top: ball.top + "px",
              backgroundImage: `url(${ball.image})`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Clicker;
