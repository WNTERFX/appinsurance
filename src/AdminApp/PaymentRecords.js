import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import DropdownAccounts from "./DropDownAccounts";
import PaymentDueTable from "./AdminTables/PaymentDueTable";
import PaymentDueArchive from "./AdminTables/PaymentDueArchive";
import PaymentHistoryTable from "./AdminTables/PaymentHistoryTable";
import { FaUserCircle, FaArchive, FaSpinner, FaHistory } from "react-icons/fa";
import ProfileMenu from "../ReusableComponents/ProfileMenu";
import "./styles/payment-records-styles.css";

export default function PaymentRecords() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState("records"); // "records", "history", or "archive"
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Simulate loading data when component mounts or view changes
  useEffect(() => {
    loadPaymentData();
  }, [activeView]);

  const loadPaymentData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

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

  const getTitle = () => {
    switch (activeView) {
      case "history":
        return "Payment History";
      case "archive":
        return "Archived Payments";
      default:
        return "Payment Records";
    }
  };

  return (
    <div className="payment-records-container">
      {/* Header */}
      <div className="payment-record-header">
        <div className="right-actions">
          <p className="Payment-title">{getTitle()}</p>
        </div>
        <div className="left-actions">
          {/* View Selector Buttons */}
          <div className="view-selector-buttons">
            <button
              className={`btn ${activeView === "records" ? "btn-active" : "btn-view"}`}
              onClick={() => setActiveView("records")}
            >
              Records
            </button>
            <button
              className={`btn ${activeView === "history" ? "btn-active" : "btn-view"}`}
              onClick={() => setActiveView("history")}
            >
              <FaHistory className="btn-icon" />
              History
            </button>
            <button
              className={`btn ${activeView === "archive" ? "btn-active" : "btn-view"}`}
              onClick={() => setActiveView("archive")}
            >
              <FaArchive className="btn-icon" />
              Archive
            </button>
          </div>
          
          <div className="profile-menu">
            <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="payment-records-content">
        <div className="policy-data-field">
          <div className="client-payment-table">
            {loading ? (
              <div className="loading-overlay">
                <FaSpinner className="spinner" />
                <p>Loading payment data...</p>
              </div>
            ) : (
              <>
                {activeView === "records" && <PaymentDueTable />}
                {activeView === "history" && <PaymentHistoryTable />}
                {activeView === "archive" && <PaymentDueArchive />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}