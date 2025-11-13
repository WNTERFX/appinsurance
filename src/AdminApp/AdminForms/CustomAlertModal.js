// src/AdminForms/CustomAlertModal.jsx
import React from 'react';

export default function CustomAlertModal({ isOpen, onClose, message, title = "Alert" }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-alert" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-alert">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body-alert">
                    <p>{message}</p>
                </div>
                <div className="modal-footer-alert">
                    <button 
                        onClick={onClose}
                        className="modal-button-ok"
                    >
                        OK
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }

                .modal-content-alert {
                    background: white;
                    border-radius: 12px;
                    padding: 28px 32px;
                    width: 500px;
                    max-width: 90%;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
                }

                .modal-header-alert {
                    margin-bottom: 20px;
                }

                .modal-header-alert h3 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .modal-body-alert {
                    margin-bottom: 28px;
                }

                .modal-body-alert p {
                    margin: 0;
                    color: #333;
                    font-size: 15px;
                    line-height: 1.6;
                    white-space: pre-line;
                }

                .modal-footer-alert {
                    display: flex;
                    justify-content: flex-end;
                }

                .modal-button-ok {
                    padding: 10px 32px;
                    border: none;
                    border-radius: 24px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    background-color: #0891b2;
                    color: white;
                    min-width: 80px;
                }

                .modal-button-ok:hover {
                    background-color: #0e7490;
                }

                .modal-button-ok:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
}
