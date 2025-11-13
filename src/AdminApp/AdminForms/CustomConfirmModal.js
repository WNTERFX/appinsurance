// src/AdminForms/CustomConfirmModal.jsx
import React from 'react';

export default function CustomConfirmModal({ isOpen, onClose, onConfirm, message, title = "Confirm" }) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-confirm" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-confirm">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body-confirm">
                    <p>{message}</p>
                </div>
                <div className="modal-footer-confirm">
                    <button 
                        onClick={onClose}
                        className="modal-button-cancel"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleConfirm}
                        className="modal-button-confirm"
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

                .modal-content-confirm {
                    background: white;
                    border-radius: 12px;
                    padding: 28px 32px;
                    width: 500px;
                    max-width: 90%;
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
                }

                .modal-header-confirm {
                    margin-bottom: 20px;
                }

                .modal-header-confirm h3 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 600;
                    color: #1a1a1a;
                }

                .modal-body-confirm {
                    margin-bottom: 28px;
                }

                .modal-body-confirm p {
                    margin: 0;
                    color: #333;
                    font-size: 15px;
                    line-height: 1.6;
                    white-space: pre-line;
                }

                .modal-footer-confirm {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                }

                .modal-button-cancel,
                .modal-button-confirm {
                    padding: 10px 32px;
                    border: none;
                    border-radius: 24px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    min-width: 80px;
                }

                .modal-button-cancel {
                    background-color: #6b7280;
                    color: white;
                }

                .modal-button-cancel:hover {
                    background-color: #4b5563;
                }

                .modal-button-confirm {
                    background-color: #0891b2;
                    color: white;
                }

                .modal-button-confirm:hover {
                    background-color: #0e7490;
                }

                .modal-button-cancel:active,
                .modal-button-confirm:active {
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
}
