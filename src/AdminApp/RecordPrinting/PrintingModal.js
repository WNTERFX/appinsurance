import React, { useState } from "react";
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

import { fetchClients } from "../AdminActions/ClientActions";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { fetchPaymentSchedule } from "../AdminActions/PaymentDueActions";

import "../styles/printing-record-styles.css";

export default function PrintingModal({ recordType, onClose }) {
  const [rangeType, setRangeType] = useState("monthly");
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const safeRecordType = recordType || "client";

  const getDateRange = () => {
    const today = new Date();
    let start, end;

    switch (rangeType) {
      case "weekly":
        start = new Date(today.setDate(today.getDate() - 7));
        end = new Date();
        break;
      case "monthly":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case "quarterly":
        start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        end = new Date();
        break;
      case "yearly":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date();
        break;
      case "custom":
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = null;
        end = null;
    }

    return { start, end };
  };

  const handleFetch = async () => {
    const { start, end } = getDateRange();
    if (!start || !end) return;

    const from = start.toISOString();
    const to = end.toISOString();

    let data = [];

    switch (safeRecordType) {
      case "client":
        data = await fetchClients(null, false, from, to);
        break;
      case "policy":
        data = await fetchPolicies(from, to);
        break;
      case "due":
        data = await fetchPaymentSchedule(from, to);
        break;
      default:
        data = [];
    }

    setRecords(data || []);
  };

    const handlePrintPDF = () => {
    const doc = new jsPDF();
    const title = `${safeRecordType.charAt(0).toUpperCase() + safeRecordType.slice(1)} Report`;

    doc.text(title, 14, 15);

    let headers = [];
    let body = [];

    if (safeRecordType === "client") {
        headers = ["#", "Client Name", "Phone Number", "Address", "Agent", "Date Registered"];
        body = records.map((c, i) => [
        i + 1,
        `${c.prefix ? c.prefix + " " : ""}${c.first_Name} ${c.middle_Name ? c.middle_Name + " " : ""}${c.family_Name}${c.suffix ? ", " + c.suffix : ""}`,
        c.phone_Number || "-",
        c.address || "-",
        c.employee?.personnel_Name || "-", // assuming fetch includes employee relation
        c.client_Registered ? new Date(c.client_Registered).toLocaleDateString() : "-",
        ]);
    } else if (safeRecordType === "policy") {
        headers = ["#", "Policy Number", "Client", "Type", "Premium", "Date Issued"];
        body = records.map((p, i) => [
        i + 1,
        p.policy_number || "-",
        p.client_Name || "-",
        p.policy_Type || "-",
        p.total_Premium || "-",
        p.created_at ? new Date(p.created_at).toLocaleDateString() : "-",
        ]);
    } else if (safeRecordType === "due") {
        headers = ["#", "Policy", "Client", "Due Date", "Amount", "Status"];
        body = records.map((d, i) => [
        i + 1,
        d.policy_Id || "-",
        d.client_Name || "-",
        d.due_Date ? new Date(d.due_Date).toLocaleDateString() : "-",
        d.amount_Due || "-",
        d.is_Paid ? "Paid" : "Unpaid",
        ]);
    }

    // ✅ Use the imported function
    autoTable(doc, {
        head: [headers],
        body,
        startY: 25,
    });

    doc.save(`${safeRecordType}_report.pdf`);
    };

  return (
    <div className="printing-record-modal-container">
      <div className="printing-record-modal-content">
        <div className="printing-record-modal-header">
          <span>
            Print {safeRecordType.charAt(0).toUpperCase() + safeRecordType.slice(1)} Information
          </span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="printing-record-modal-body">
          {/* LEFT COLUMN */}
          <div className="left-column">
            <p>Select a timeframe:</p>
            <div className="printing-record-selection">
              <select
                value={rangeType}
                onChange={(e) => setRangeType(e.target.value)}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>

              {rangeType === "custom" && (
                <>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </>
              )}

              <button onClick={handleFetch}>Fetch Data</button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="right-column">
            <p>Output:</p>
            <div className="printing-record-output">
              {records.length === 0 ? (
                <p>No data available.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      {safeRecordType === "client" && (
                         <>
                            <th>#</th>
                            <th>Client Name</th>
                            <th>Phone Number</th>
                            <th>Address</th>
                            <th>Agent</th>
                            <th>Date Registered</th>
                        </>
                        )}
                      {safeRecordType === "policy" && (
                        <>
                          <th>#</th>
                          <th>Policy Number</th>
                          <th>Client</th>
                          <th>Type</th>
                          <th>Premium</th>
                          <th>Date Issued</th>
                        </>
                      )}
                      {safeRecordType === "due" && (
                        <>
                          <th>#</th>
                          <th>Policy</th>
                          <th>Client</th>
                          <th>Due Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((item, i) => (
                      <tr key={item.id || i}>
                        {safeRecordType === "client" && (
                          <>
                            <td>{i + 1}</td>
                            <td>
                            {`${item.prefix ? item.prefix + " " : ""}${item.first_Name} ${item.middle_Name ? item.middle_Name + " " : ""}${item.family_Name}${item.suffix ? ", " + item.suffix : ""}`}
                            </td>
                            <td>{item.phone_Number}</td>
                            <td>{item.address}</td>
                            <td>{item.employee?.personnel_Name || "-"}</td>
                            <td>{new Date(item.client_Registered).toLocaleDateString()}</td>
                          </>
                        )}
                        {safeRecordType === "policy" && (
                          <>
                            <td>{i + 1}</td>
                            <td>{item.policy_number}</td>
                            <td>{item.client_Name}</td>
                            <td>{item.policy_Type}</td>
                            <td>{item.total_Premium}</td>
                            <td>{new Date(item.created_at).toLocaleDateString()}</td>
                          </>
                        )}
                        {safeRecordType === "due" && (
                          <>
                            <td>{i + 1}</td>
                            <td>{item.policy_Id}</td>
                            <td>{item.client_Name}</td>
                            <td>{new Date(item.due_Date).toLocaleDateString()}</td>
                            <td>{item.amount_Due}</td>
                            <td>{item.is_Paid ? "Paid" : "Unpaid"}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="printing-record-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          {records.length > 0 && (
            <button className="btn-print" onClick={handlePrintPDF}>
              Print PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
