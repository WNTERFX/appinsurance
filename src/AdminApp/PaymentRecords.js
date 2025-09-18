import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import DropdownAccounts from "./DropDownAccounts";
import PaymentDueTable from "./AdminTables/PaymentDueTable";
import { FaUserCircle } from "react-icons/fa";
import "./styles/payment-records-styles.css";

export default function PaymentRecords() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // close dropdown when clicking outside
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
    <div className="payment-records-container">
      {/* Header */}
      <div className="payment-record-header">
        <div className="right-actions">
          <p className="Payment-title">Payment Records</p>
          <input
            type="text"
            className="record-search"
            placeholder="Search clients..."
          />
        </div>

        <div className="left-actions">
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

      {/* Content */}
      <div className="payment-records-content">
        <div className="policy-data-field">
          <div className="control-options">
            <button className="approve-btn-policy">Approve</button>
            <button className="disapprove-btn-policy">Edit</button>
            <button className="print-btn-policy">Print</button>
          </div>

          {/* Payments Table */}
          <div className="client-payment-table">
            <PaymentDueTable />
          </div>
        </div>
      </div>
    </div>
  );
}
