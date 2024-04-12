import React, { useEffect, useRef } from "react";
import "./Instructions.css"

export const Modal = ({ onClose, onApply}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
        console.log("CLICK OUTSIDE");
      } else {
        console.log("CLICK INSIDE");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return <div className="modal-container" ref={modalRef}>

        <div className="modal-header">
            <button className="close-button" onClick={() => onClose()}>&times;</button>
        </div>

        <div className="modal-content">
          <h1>? How To Play ?</h1>
          <p>🏆 Earn points by answering questions correctly and earn new powers!</p>
          <p>❌ But be careful! Answering wrong breaks your streak and loses all your powers!</p>
          <p>🎲 Unlock the <b>50-50</b> power on your first correct answer, removing 2 incorrect options!</p>
          <p>🔥 At 2 consecutive correct answers, you earn double your points!</p>
          <p>🥶 Reach a streak of 3 to upgrade to <b>Freeze</b> power! Use it to stop an opponent from answering the question!</p>
          <p>🔥 At 4 consecutive correct answers, you earn triple your points!</p>
          <p>🎭 Reach a streak of 5 to unlock the <b>Mask</b> power! Use it to seize points from an opponent!</p>
        </div>

        <div className="modal-footer">
            <button className="footer-button" onClick={() => onApply()}>Okay</button>
        </div>

    </div>
};