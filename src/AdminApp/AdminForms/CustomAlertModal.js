// src/AdminForms/CustomAlertModal.jsx
import React from 'react';
import '../styles/CustomAlertModal.css';

export default function CustomAlertModal({ isOpen, onClose, message, title = "Alert" }) {
    if (!isOpen) return null;

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className="custom-modal-content-alert" onClick={(e) => e.stopPropagation()}>
                <div className="custom-modal-header-alert">
                    <h3>{title}</h3>
                </div>
                <div className="custom-modal-body-alert">
                    <p>{message}</p>
                </div>
                <div className="custom-modal-footer-alert">
                    <button 
                        onClick={onClose}
                        className="custom-modal-button-ok"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}