import React, { useState, useEffect } from "react";
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentDateRange, setCurrentDateRange] = useState({ start: null, end: null });
  const [sortOrder, setSortOrder] = useState("latest");

  const safeRecordType = recordType || "client";

  const sortRecords = (data) => {
  if (!Array.isArray(data)) return [];

    return [...data].sort((a, b) => {
      let dateA, dateB;

      if (safeRecordType === "client") {
        dateA = new Date(a.client_Registered);
        dateB = new Date(b.client_Registered);
      } else if (safeRecordType === "policy") {
        dateA = new Date(a.created_at);
        dateB = new Date(b.created_at);
      } else if (safeRecordType === "due") {
        dateA = new Date(a.due_Date);
        dateB = new Date(b.due_Date);
      }

      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
};

  

  // Re-sort records when sort order changes
  useEffect(() => {
    if (records.length > 0) {
      const sortedData = sortRecords(records);
      setRecords(sortedData);
    }
  }, [sortOrder]);

  // Generate array of years (current year + 10 years back)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 10; i++) {
      years.push(currentYear - i);
    }
    return years;
  };

  const getDateRange = () => {
    const today = new Date();
    let start, end;

    switch (rangeType) {
      case "weekly":
        start = new Date(today);
        start.setDate(today.getDate() - 7);
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
        start = new Date(selectedYear, 0, 1);
        end = new Date(selectedYear, 11, 31);
        break;
      case "custom":
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start = null;
        end = null;
    }

    return { start, end };
  };

  const formatDateRange = (start, end) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', options);
    return `${startStr} - ${endStr}`;
  };

  const handleFetch = async () => {
    const { start, end } = getDateRange();
    
    if (rangeType === "custom" && (!startDate || !endDate)) {
      alert("Please select both start and end dates");
      return;
    }
    
    if (!start || !end) return;

    // Store the current date range for PDF generation
    setCurrentDateRange({ start, end });

    // Format dates as YYYY-MM-DD to avoid timezone issues
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const from = formatDate(start);
    const to = formatDate(end);

    console.log("Date range:", { from, to, start, end });

    let data = [];
    setIsLoading(true);

    try {
      switch (safeRecordType) {
        case "client":
          data = await fetchClients(null, false, from, to);
          console.log("Fetched clients:", data);
          break;
        case "policy":
          data = await fetchPolicies(from, to);
          console.log("Fetched policies:", data);
          break;
        case "due":
          data = await fetchPaymentSchedule(from, to);
          console.log("Fetched payment schedules:", data);
          break;
        default:
          data = [];
      }
      
      console.log("Final data to set:", data);
      if (safeRecordType === "client" && Array.isArray(data)) {
        console.log("Client registration dates:", data.map(c => ({
          name: c.first_Name,
          registered: c.client_Registered
        })));
      }
      const sortedData = sortRecords(Array.isArray(data) ? data : []);
      setRecords(sortedData);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      setRecords([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    const title = `${safeRecordType.charAt(0).toUpperCase() + safeRecordType.slice(1)} Report`;
    
    // Add title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Add date range
    if (currentDateRange.start && currentDateRange.end) {
      doc.setFontSize(10);
      const dateRangeText = `Period: ${formatDateRange(currentDateRange.start, currentDateRange.end)}`;
      doc.text(dateRangeText, 14, 23);
    }
    
    // Add generation date
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 29);

    let headers = [];
    let body = [];

    if (safeRecordType === "client") {
      headers = ["#", "Client Name", "Phone Number", "Address", "Agent", "Date Registered"];
      body = records.map((c, i) => [
        i + 1,
        `${c.prefix ? c.prefix + " " : ""}${c.first_Name} ${c.middle_Name ? c.middle_Name + " " : ""}${c.family_Name}${c.suffix ? ", " + c.suffix : ""}`,
        c.phone_Number || "-",
        c.address || "-",
        c.employee?.personnel_Name || "-",
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

    autoTable(doc, {
      head: [headers],
      body,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    doc.save(`${safeRecordType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
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
          <div className="left-column">
            <p>Select a timeframe:</p>
            <div className="printing-record-selection">
              <select
                value={rangeType}
                onChange={(e) => {
                  setRangeType(e.target.value);
                  setRecords([]);
                  setHasSearched(false);
                }}
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>

              {rangeType === "yearly" && (
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(Number(e.target.value));
                    setRecords([]);
                    setHasSearched(false);
                  }}
                >
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}

              <div className="sort-controls">
                <label>Sort by:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value);
                  }}
                >
                  <option value="latest">Latest to Oldest</option>
                  <option value="oldest">Oldest to Latest</option>
                </select>
              </div>

              {rangeType === "custom" && (
                <>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setRecords([]);
                      setHasSearched(false);
                    }}
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setRecords([]);
                      setHasSearched(false);
                    }}
                  />



                  
                </>



              )}

              <button onClick={handleFetch}>Fetch Data</button>
            </div>
          </div>

          <div className="right-column">
            <p>Output:</p>
            <div className="printing-record-output">
              {isLoading ? (
                <p>Loading data...</p>
              ) : !hasSearched ? (
                <p>No data available. Click "Fetch Data" to load records.</p>
              ) : records.length === 0 ? (
                <p>No records found for the selected date range.</p>
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