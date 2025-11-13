import "./styles/claims-styles.css";
import React, { useState, useRef, useEffect } from "react";
import { FaArchive } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DropdownAccounts from "./DropDownAccounts";
import ProfileMenu from "../ReusableComponents/ProfileMenu";

import ClaimsTable from "./AdminTables/ClaimsTable";
import ClaimsArchiveTable from "./AdminTables/ClaimsArchiveTable";

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

          {/* Profile dropdown - Using ProfileMenu component */}
          <div className="profile-menu">
            <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
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