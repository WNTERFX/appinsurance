
import { FaUserCircle, FaMoon, FaSignOutAlt } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import './moderator-styles/monthly-styles-moderator.css'
import DropDownAccountsModerator from './DropDownAccountsModerator' 
import PrintingModalModerator from './RecordPrintingModerator/PrintingModalModerator';

export default function MonthlyDataModerator({ view, setView }) {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);
  const [recordType, setRecordType] = useState(null);

  // close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="moderator-reports-container">
      <div className="moderator-reports-header">
        <div className="moderator-right-actions">
          <p className="moderator-reports-title">Reports</p>
        </div>

        <div className="moderator-left-actions">
          <div className="moderator-profile-menu">
            <button
              ref={buttonRef}
              className="moderator-profile-button"
              onClick={() => setOpen((s) => !s)}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <span className="moderator-profile-name">Moderator</span>
              <FaUserCircle className="moderator-profile-icon" />
            </button>

            <div>
              <DropDownAccountsModerator
                open={open}
                onClose={() => setOpen(false)}
                onDarkMode={() => console.log("Dark Mode toggled")}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="moderator-client-record header-with-button">
        <p className="moderator-client-title">Client</p>
        <button
          className="moderator-btn moderator-btn-create"
          onClick={() => {
            setRecordType("client");
            setOpenModal(true);
          }}
        >
          Print
        </button>
      </div>

      <div className="moderator-policy-record header-with-button">
        <p className="moderator-policy-title">Policy</p>
        <button
          className="moderator-btn moderator-btn-create"
          onClick={() => {
            setRecordType("policy");
            setOpenModal(true);
          }}
        >
          Print
        </button>
      </div>

      <div className="moderator-due-record header-with-button">
        <p className="moderator-due-title">Due</p>
        <button
          className="moderator-btn moderator-btn-create"
          onClick={() => {
            setRecordType("due");
            setOpenModal(true);
          }}
        >
          Print
        </button>
      </div>

      <div className="moderator-renewal-record header-with-button">
        <p className="moderator-renewals-title">Renewals</p>
        <button className="moderator-btn moderator-btn-create">Print</button>
      </div>

      {openModal && (
        <PrintingModalModerator
          recordType={recordType}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
}
