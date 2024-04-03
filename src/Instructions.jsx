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
            <p>🏆 Earn points by answering questions correctly!</p>
            <p>🎲 Unlock the <b>50-50</b> power at your first correct answer, removing 2 incorrect options!</p>
            <p>🔥 Get 3 correct answers in a row to double your earned points and unlock the <b>Freeze</b> power!</p>
            <p>❄️ Use <b>Freeze</b> to temporarily halt an opponent from answering the next question!</p>
            <p>💪 Maintain a streak of 5 correct answers to triple your earned points and gain access to the <b>Mask</b> power!</p>
            <p>🎭 Use <b>Mask</b> to seize a quarter of points from any chosen opponent!</p>
        </div>

        <div className="modal-footer">
            <button className="footer-button" onClick={() => onApply()}>Okay</button>
        </div>

    </div>
};