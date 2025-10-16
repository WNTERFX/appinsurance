import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import DropdownAccounts from "./DropDownAccounts";
import PaymentDueTable from "./AdminTables/PaymentDueTable";
import PaymentDueArchive from "./AdminTables/PaymentDueArchive";
import { FaUserCircle, FaArchive } from "react-icons/fa";
import ProfileMenu from "../ReusableComponents/ProfileMenu";
import "./styles/payment-records-styles.css";

export default function PaymentRecords() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showArchive, setShowArchive] = useState(false); // toggle archive
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
          <p className="Payment-title">
            {showArchive ? "Archived Payments" : "Payment Records"}
          </p>
        </div>

        <div className="left-actions">
          <button
            className="btn btn-archive"
            onClick={() => setShowArchive((prev) => !prev)}
          >
            <FaArchive className="btn-icon" />
            {showArchive ? "Back to Records" : "View Archive"}
          </button>

          <div className="profile-menu">
             <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="payment-records-content">
        <div className="policy-data-field">
          <div className="client-payment-table">
            {showArchive ? <PaymentDueArchive /> : <PaymentDueTable />}
          </div>
        </div>
      </div>
    </div>
  );
}
