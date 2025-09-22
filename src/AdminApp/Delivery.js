import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaArchive, FaUserCircle, FaTruck } from "react-icons/fa";
import DropdownAccounts from "./DropDownAccounts";

import DeliveryTable from "./AdminTables/DeliveryTable";
import DeliveryArchiveTable from "./AdminTables/DeliveryArchiveTable";
import "./styles/delivery-styles.css";

export default function Delivery() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false); // toggle archive
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // close profile dropdown when clicking outside
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
    <div className="delivery-container">
      <div className="delivery-header">
        {/* Left side: title */}
        <div className="right-actions">
          <p className="delivery-title">
            {showArchive ? "Delivery Archive" : "Deliveries"}
          </p>
        </div>

        {/* Right side: create + archive + profile */}
        <div className="left-actions">
          {!showArchive && (
            <button
              className="btn btn-create"
              onClick={() =>
                navigate("/appinsurance/MainArea/Delivery/DeliveryCreationForm")
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
            {showArchive ? "Back to Deliveries" : "View Archive"}
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

            <div ref={dropdownRef}>
              <DropdownAccounts
                open={open}
                onClose={() => setOpen(false)}
                onDarkMode={() => console.log("Dark Mode toggled")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table toggle */}
      <div className="delivery-table-container">
        {showArchive ? <DeliveryArchiveTable /> : <DeliveryTable />}
      </div>
    </div>
  );
}
