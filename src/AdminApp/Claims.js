import "./styles/claims-styles.css";
import React, { useState, useRef, useEffect } from "react";
import { FaArchive, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DropdownAccounts from "./DropDownAccounts";

import ClaimsTable from "./AdminTables/ClaimsTable";
import ClaimsArchiveTable from "./AdminTables/ClaimsArchiveTable"; // ✅ new archive version

export default function Claims() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
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
    <div className="claims-container">
      {/* ===== HEADER ===== */}
      <div className="claims-header">
        <div className="right-actions">
          <p className="claims-title">
            {showArchive ? "Archived Claims" : "Claims"}
          </p>
        </div>

        <div className="left-actions">
          {/* Toggle between active & archived tables */}
          <button
            className="btn btn-archive"
            onClick={() => setShowArchive((prev) => !prev)}
          >
            <FaArchive className="btn-icon" />{" "}
            {showArchive ? "Back to Claims" : "View Archive"}
          </button>

          {/* Profile dropdown */}
          <div className="profile-menu">
            <button
              ref={buttonRef}
              className="profile-button"
              onClick={() => setOpen((s) => !s)}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <span className="profile-name">Admin</span>
              <FaUserCircle className="profile-icon" />
            </button>

            <div>
              <DropdownAccounts
                open={open}
                onClose={() => setOpen(false)}
                onDarkMode={() => console.log("Dark Mode toggled")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== TABLE CONTENT ===== */}
      <div className="claims-records-content">
        <div className="claims-data-field">
          <div className="claims-records-table">
            {showArchive ? <ClaimsArchiveTable /> : <ClaimsTable />}
          </div>
        </div>
      </div>
    </div>
  );
}
