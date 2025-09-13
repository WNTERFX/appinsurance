import React, { useState, useRef, useEffect } from "react";
import ClientTable from "./AdminTables/ClientTable";
import ClientArchiveTable from "./AdminTables/ClientArchiveTable"; // import archive table
import { FaPlus, FaArchive, FaUser, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DropdownAccounts from "./DropDownAccounts";

export default function Client() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false); // toggle archive
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

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
    <div className="Client-container">
      <div className="Client-header">
        {/* Left side: title + search */}
        <div className="right-actions">
          <p className="client-title">
            {showArchive ? "Client Archive" : "Client"}
          </p>
         
        </div>

        {/* Right side: create + archive + profile */}
        <div className="left-actions">
          {!showArchive && (
            <button
              className="btn btn-create"
              onClick={() =>
                navigate("/appinsurance/MainArea/Client/ClientCreationForm")
              }
            >
              <FaPlus className="btn-icon" />
              Create
            </button>
          )}

          <button
            className="btn btn-archive"
            onClick={() => setShowArchive((prev) => !prev)} // toggle archive
          >
            <FaArchive className="btn-icon" />{" "}
            {showArchive ? "Back to Clients" : "View Archive"}
          </button>

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

      {/* Agent summary (hidden in archive mode) */}
      {!showArchive && (
        <div className="Client-content">
          <div className="Agents">
            <div className="agent-header">
              <FaUser className="agent-icon" />
              <h3>Sales Agent 1</h3>
            </div>
            <p>Total Client : ??</p>
            <button className="view-all-client-button">View All</button>
          </div>

          <div className="Agents">
            <div className="agent-header">
              <FaUser className="agent-icon" />
              <h3>Sales Agent 2</h3>
            </div>
            <p>Total Client : ??</p>
            <button className="view-all-client-button">View All</button>
          </div>

          <div className="Agents">
            <div className="agent-header">
              <FaUser className="agent-icon" />
              <h3>Sales Agent 3</h3>
            </div>
            <p>Total Client : ??</p>
            <button className="view-all-client-button">View All</button>
          </div>
        </div>
      )}

      {/* Table toggle */}
      <div className="client-table-container">
        {showArchive ? <ClientArchiveTable /> : <ClientTable />}
      </div>
    </div>
  );
}
