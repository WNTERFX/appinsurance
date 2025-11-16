import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileMenu from "../ReusableComponents/ProfileMenu";
import PrintingModal from "./RecordPrinting/PrintingModal";

import "./styles/monthly-styles.css";

export default function MonthlyData({ view, setView }) {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [recordType, setRecordType] = useState(null);

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="right-actions">
          <p className="reports-title">Reports</p>
        </div>
        <div className="left-actions">
          <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
        </div>
      </div>

      {[
        { label: "Client", type: "client" },
        { label: "Policy", type: "policy" },
        { label: "Due", type: "due" },
        { label: "Payment", type: "payment" },
        { label: "Renewal", type: "renewal" }, 
        { label: "Quotation", type: "quotation" },
        { label: "Delivery", type: "delivery" },
        { label: "Claims", type: "claim" }
      ].map(({ label, type }) => (
        <div key={type} className={`${type}-record-container header-with-button`}>
          <p className={`${type}-title`}>{label}</p>
          <button
            className="btn btn-create"
            onClick={() => {
              setRecordType(type);
              setOpenModal(true);
            }}
          >
            Print
          </button>
        </div>
      ))}

      {openModal && (
        <PrintingModal recordType={recordType} onClose={() => setOpenModal(false)} />
      )}
    </div>
  );
}
