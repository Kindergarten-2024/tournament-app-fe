import React from "react";
import "./Modal.css"

export const Modal = ({ onCancel, onApply, onClose, children}) => {
    return <div className="modal-container">

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