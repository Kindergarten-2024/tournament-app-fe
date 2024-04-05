import React from "react";
import "./bubble.css";
const StolenPointsAnimation = ({ text }) => {
  return (
    <div className="slide-out-blurred-top">
      <div className="bubble-text">{text}</div>
    </div>
  );
};

const ReceivePointsAnimation = ({ text }) => {
  return (
    <div className="slide-in-blurred-top">
      <div className="bubble-text">{text}</div>
    </div>
  );
};

export { StolenPointsAnimation, ReceivePointsAnimation };
