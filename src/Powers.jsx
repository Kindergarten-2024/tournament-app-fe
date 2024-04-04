import React , { useEffect, useRef } from "react";
import "./Powers.css"

export const Modal = ({ onCancel, onApply, onClose, children}) => {
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
    return <div className="modal-container"  ref={modalRef}>

        <div className="modal-header">
            <button className="close-button" onClick={() => onClose()}>&times;</button>
        </div>
        <div className="modal-content">
            {children}
        </div>
        <div className="modal-footer">
            <button className="footer-button" onClick={() => onCancel()}>Cancel</button>
            <button className="footer-button" onClick={() => onApply()}>Apply</button>
        </div>
    </div>;
};