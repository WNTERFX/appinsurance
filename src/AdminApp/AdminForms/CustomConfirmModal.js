// src/AdminForms/CustomConfirmModal.jsx
import React from 'react';
import '../styles/CustomConfirmModal.css';

export default function CustomConfirmModal({ isOpen, onClose, onConfirm, message, title = "Confirm" }) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="custom-modal-overlay" onClick={onClose}>
            <div className="custom-modal-content-confirm" onClick={(e) => e.stopPropagation()}>
                <div className="custom-modal-header-confirm">
                    <h3>{title}</h3>
                </div>
                <div className="custom-modal-body-confirm">
                    <p>{message}</p>
                </div>
                <div className="custom-modal-footer-confirm">
                    <button 
                        onClick={onClose}
                        className="custom-modal-button-cancel"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="custom-modal-button-confirm"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}