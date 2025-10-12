import React, { useState, useEffect } from "react";
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

import { fetchClients } from "../AdminActions/ClientActions";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { fetchAllDues } from "../AdminActions/PaymentDueActions";
import { db } from "../../dbServer";

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
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");

  const safeRecordType = recordType || "client";

  // Fetch insurance partners on mount if recordType is policy
  useEffect(() => {
    if (safeRecordType === "policy") {
      fetchInsurancePartners();
    }
  }, [safeRecordType]);

  const fetchInsurancePartners = async () => {
    try {
      const { data, error } = await db
        .from("insurance_Partners")
        .select("id, insurance_Name")
        .order("insurance_Name", { ascending: true });
      
      if (error) throw error;
      console.log("Fetched partners:", data);
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching insurance partners:", error);
    }
  };

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
        dateA = new Date(a.payment_date);
        dateB = new Date(b.payment_date);
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
    
    console.log("=== FETCH DEBUG ===");
    console.log("Range type:", rangeType);
    console.log("Selected year:", selectedYear);
    console.log("Start date object:", start);
    console.log("End date object:", end);
    
    if (rangeType === "custom" && (!startDate || !endDate)) {
      alert("Please select both start and end dates");
      return;
    }
    
    if (!start || !end) return;

    setCurrentDateRange({ start, end });

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const from = formatDate(start);
    const to = formatDate(end);

    console.log("Formatted dates:", { from, to });
    console.log("==================");

    let data = [];
    setIsLoading(true);

    try {
      switch (safeRecordType) {
        case "client":
          data = await fetchClients(null, false, from, to);
          console.log("Fetched clients:", data);
          break;
        case "policy":
          const partnerIdToSend = selectedPartner === "" ? null : selectedPartner;
          console.log("Fetching policies with partner:", { 
            selectedPartner, 
            partnerIdToSend,
            willFilter: partnerIdToSend !== null 
          });
          data = await fetchPolicies(from, to, partnerIdToSend);
          console.log("Fetched policies:", data);
          console.log("Number of policies:", data?.length);
          if (data && data.length > 0) {
            console.log("First policy partner_id:", data[0].partner_id);
            console.log("All unique partner_ids:", [...new Set(data.map(p => p.partner_id))]);
          }
          break;
        case "due":
          console.log("Calling fetchAllDues with:", { from, to });
          data = await fetchAllDues(from, to);
          console.log("Fetched all dues:", data);
          console.log("Number of dues fetched:", data?.length);
          if (data && data.length > 0) {
            console.log("First due sample:", data[0]);
          }
          break;
        default:
          data = [];
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
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    if (currentDateRange.start && currentDateRange.end) {
      doc.setFontSize(10);
      const dateRangeText = `Period: ${formatDateRange(currentDateRange.start, currentDateRange.end)}`;
      doc.text(dateRangeText, 14, 23);
    }
    
    // Add partner filter info for policy reports
    if (safeRecordType === "policy" && selectedPartner) {
      const partnerName = partners.find(p => p.id === selectedPartner)?.insurance_Name;
      if (partnerName) {
        doc.setFontSize(10);
        doc.text(`Partner: ${partnerName}`, 14, 29);
      }
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 35);
    } else {
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 29);
    }

    let headers = [];
    let body = [];
    let startY = safeRecordType === "policy" && selectedPartner ? 41 : 35;

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
      headers = ["#", "Policy Number", "Client", "Partner", "Type", "Premium", "Date Issued"];
      body = records.map((p, i) => [
        i + 1,
        p.internal_id || "-",
        p.clients_Table
          ? `${p.clients_Table.prefix ? p.clients_Table.prefix + " " : ""}${p.clients_Table.first_Name} ${p.clients_Table.middle_Name ? p.clients_Table.middle_Name + " " : ""}${p.clients_Table.family_Name}${p.clients_Table.suffix ? ", " + p.clients_Table.suffix : ""}`
          : "-",
        p.insurance_Partners?.insurance_Name || "-",
        p.policy_type || "-",
        p.policy_Computation_Table?.[0]?.total_Premium || "-",
        p.created_at ? new Date(p.created_at).toLocaleDateString() : "-",
      ]);
    } else if (safeRecordType === "due") {
      headers = ["#", "Policy", "Client", "Due Date", "Amount", "Status"];
      body = records.map((d, i) => [
        i + 1,
        d.policy_Table?.internal_id || "-",
        d.policy_Table?.clients_Table
          ? `${d.policy_Table.clients_Table.prefix ? d.policy_Table.clients_Table.prefix + " " : ""}${d.policy_Table.clients_Table.first_Name} ${d.policy_Table.clients_Table.middle_Name ? d.policy_Table.clients_Table.middle_Name + " " : ""}${d.policy_Table.clients_Table.family_Name}${d.policy_Table.clients_Table.suffix ? ", " + d.policy_Table.clients_Table.suffix : ""}`
          : "-",
        d.payment_date ? new Date(d.payment_date).toLocaleDateString() : "-",
        d.amount_to_be_paid || "-",
        d.is_paid ? "Paid" : "Unpaid",
      ]);
    }

    const tableConfig = {
      head: [headers],
      body,
      startY: startY,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    };

    // Add conditional styling for dues table
    if (safeRecordType === "due") {
      tableConfig.didParseCell = function(data) {
        // Color the Status column (last column, index 5)
        if (data.column.index === 5 && data.section === 'body') {
          const status = data.cell.raw;
          if (status === "Paid") {
            data.cell.styles.fillColor = [144, 238, 144]; // Light green
            data.cell.styles.textColor = [0, 100, 0]; // Dark green text
          } else if (status === "Unpaid") {
            data.cell.styles.fillColor = [255, 182, 193]; // Light red/pink
            data.cell.styles.textColor = [139, 0, 0]; // Dark red text
          }
        }
      };
    }

    autoTable(doc, tableConfig);

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

              {safeRecordType === "policy" && (
                <div className="partner-filter">
                  <label>Filter by Partner:</label>
                  <select
                    value={selectedPartner}
                    onChange={(e) => {
                      console.log("Partner selected:", e.target.value);
                      console.log("Partner value type:", typeof e.target.value);
                      setSelectedPartner(e.target.value);
                      setRecords([]);
                      setHasSearched(false);
                    }}
                  >
                    <option value="">All Partners</option>
                    {partners.map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.insurance_Name}
                      </option>
                    ))}
                  </select>
                </div>
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
                          <th>Partner</th>
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
                            <td>{item.internal_id || "-"}</td>
                            <td>
                              {item.clients_Table
                                ? `${item.clients_Table.prefix ? item.clients_Table.prefix + " " : ""}${item.clients_Table.first_Name || ""} ${item.clients_Table.middle_Name ? item.clients_Table.middle_Name + " " : ""}${item.clients_Table.family_Name || ""}${item.clients_Table.suffix ? ", " + item.clients_Table.suffix : ""}`
                                : "-"}
                            </td>
                            <td>{item.insurance_Partners?.insurance_Name || "-"}</td>
                            <td>{item.policy_type || "-"}</td>
                            <td>
                              {item.policy_Computation_Table && Array.isArray(item.policy_Computation_Table) && item.policy_Computation_Table.length > 0
                                ? item.policy_Computation_Table[0].total_Premium
                                : "-"}
                            </td>
                            <td>{item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}</td>
                          </>
                        )}
                        {safeRecordType === "due" && (
                          <>
                            <td>{i + 1}</td>
                            <td>{item.policy_Table?.internal_id || "-"}</td>
                            <td>
                              {item.policy_Table?.clients_Table
                                ? `${item.policy_Table.clients_Table.prefix ? item.policy_Table.clients_Table.prefix + " " : ""}${item.policy_Table.clients_Table.first_Name} ${item.policy_Table.clients_Table.middle_Name ? item.policy_Table.clients_Table.middle_Name + " " : ""}${item.policy_Table.clients_Table.family_Name}${item.policy_Table.clients_Table.suffix ? ", " + item.policy_Table.clients_Table.suffix : ""}`
                                : "-"}
                            </td>
                            <td>{item.payment_date ? new Date(item.payment_date).toLocaleDateString() : "-"}</td>
                            <td>{item.amount_to_be_paid || "-"}</td>
                            <td>{item.is_paid ? "Paid" : "Unpaid"}</td>
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