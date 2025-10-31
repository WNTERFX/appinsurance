import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import { db } from "../../dbServer";
import { fetchClients } from "../AdminActions/ClientActions";
import { fetchPolicies, fetchRenewals } from "../AdminActions/PolicyActions";
import { fetchAllDues, fetchPaymentsWithPenalties } from "../AdminActions/PaymentDueActions";
import { fetchReportCreator, fetchQuotations, fetchDeliveries } from "./PrintingActions";

import "../styles/printing-record-styles.css";

export default function PrintingModal({ recordType, onClose }) {
  const [rangeType, setRangeType] = useState("monthly");
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest");
  const [partners, setPartners] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [reportCreator, setReportCreator] = useState("");

  const safeRecordType = recordType || "client";

  // Load report creator
  useEffect(() => {
    fetchReportCreator().then(setReportCreator);
  }, []);

  // Fetch employees
  useEffect(() => {
    db.from("employee_Accounts")
      .select("id, personnel_Name, first_name, last_name")
      .order("personnel_Name", { ascending: true })
      .then(({ data, error }) => {
        if (!error) setEmployees(data || []);
      });
  }, []);

  // Fetch insurance partners if needed
  useEffect(() => {
    if (safeRecordType === "policy" || safeRecordType === "quotation") {
      db.from("insurance_Partners")
        .select("id, insurance_Name")
        .order("insurance_Name", { ascending: true })
        .then(({ data }) => setPartners(data || []));
    }
  }, [safeRecordType]);

  const sortRecords = (data) => {
    if (!Array.isArray(data)) return [];
    const sorted = [...data].sort((a, b) => {
      let dateA, dateB;
      switch (safeRecordType) {
        case "client":
          dateA = new Date(a.client_Registered);
          dateB = new Date(b.client_Registered);
          break;
        case "policy":
        case "quotation":
          dateA = new Date(a.created_at);
          dateB = new Date(b.created_at);
          break;
        case "due":
        case "payment":
          dateA = new Date(a.payment_date);
          dateB = new Date(b.payment_date);
          break;
        case "renewal":
          dateA = new Date(a.renewal_date);
          dateB = new Date(b.renewal_date);
          break;
        case "delivery":
          dateA = new Date(a.delivery_date || a.estimated_delivery_date || a.created_at);
          dateB = new Date(b.delivery_date || b.estimated_delivery_date || b.created_at);
          break;
        default:
          return 0;
      }
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
    return sorted;
  };

  const generateYearOptions = () => {
    const years = [];
    const current = new Date().getFullYear();
    for (let i = 0; i <= 10; i++) years.push(current - i);
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
        if (!startDate || !endDate) return {};
        start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return {};
    }

    return { start, end };
  };

  const handleFetch = async () => {
    const { start, end } = getDateRange();
    if (!start || !end) {
      alert("Please select a valid range.");
      return;
    }

    const fmt = (d) => d.toISOString().split("T")[0];
    const from = fmt(start);
    const to = fmt(end);

    setIsLoading(true);
    setHasSearched(false);

    try {
      let data = [];
      switch (safeRecordType) {
        case "client":
          data = await fetchClients(selectedEmployee || null, false, from, to);
          break;
        case "policy":
          data = await fetchPolicies(from, to, selectedPartner || null, selectedEmployee || null);
          break;
        case "due":
          data = await fetchAllDues(from, to, selectedEmployee || null);
          break;
        case "payment":
          data = await fetchPaymentsWithPenalties(selectedEmployee || null);
          break;
        case "renewal":
          data = await fetchRenewals(from, to, selectedEmployee || null);
          break;
        case "quotation":
          data = await fetchQuotations(from, to, selectedPartner || null);
          break;
        case "delivery":
          data = await fetchDeliveries(from, to, selectedEmployee || null);
          break;
      }

      setRecords(sortRecords(data || []));
    } catch (err) {
      console.error("Fetch error:", err);
      setRecords([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  };

  const { headers, body } = useMemo(() => {
    let headers = [];
    let body = [];

    switch (safeRecordType) {
      case "client":
        headers = ["#", "Client Name", "Phone", "Address", "Agent", "Registered"];
        body = records.map((c, i) => [
          i + 1,
          `${c.prefix || ""} ${c.first_Name} ${c.middle_Name || ""} ${c.family_Name}`,
          c.phone_Number || "-",
          c.address || "-",
          c.employee?.personnel_Name || "-",
          c.client_Registered ? new Date(c.client_Registered).toLocaleDateString() : "-",
        ]);
        break;
      case "policy":
        headers = ["#", "Policy No", "Client", "Partner", "Type", "Premium", "Issued"];
        body = records.map((p, i) => [
          i + 1,
          p.internal_id || "-",
          `${p.clients_Table?.first_Name || ""} ${p.clients_Table?.family_Name || ""}`,
          p.insurance_Partners?.insurance_Name || "-",
          p.policy_type || "-",
          p.policy_Computation_Table?.[0]?.total_Premium || "-",
          p.created_at ? new Date(p.created_at).toLocaleDateString() : "-",
        ]);
        break;
      case "due":
        headers = ["#", "Policy", "Client", "Due Date", "Amount", "Status"];
        body = records.map((d, i) => [
          i + 1,
          d.policy_Table?.internal_id || "-",
          `${d.policy_Table?.clients_Table?.first_Name || ""} ${d.policy_Table?.clients_Table?.family_Name || ""}`,
          d.payment_date ? new Date(d.payment_date).toLocaleDateString() : "-",
          `₱${d.amount_to_be_paid?.toLocaleString() || "-"}`,
          d.is_paid ? "Paid" : "Unpaid",
        ]);
        break;
      case "payment":
        headers = ["#", "Month", "Payment Date", "Amount", "Paid", "Penalty", "Total Due"];
        body = records.map((p, i) => [
          i + 1,
          `Month ${i + 1}`,
          new Date(p.payment_date).toLocaleDateString(),
          `₱${p.amount_to_be_paid.toLocaleString()}`,
          p.is_paid ? "Yes" : "No",
          `₱${p.totalPenalty.toLocaleString()}`,
          `₱${p.totalDue.toLocaleString()}`,
        ]);
        break;
      case "renewal":
        headers = ["#", "Policy No", "Client", "Partner", "Policy Type", "Renewal Date", "Remarks"];
        body = records.map((r, i) => [
          i + 1,
          r.policy_Table?.internal_id || "-",
          `${r.policy_Table?.clients_Table?.first_Name || ""} ${r.policy_Table?.clients_Table?.family_Name || ""}`,
          r.policy_Table?.insurance_Partners?.insurance_Name || "-",
          r.policy_Table?.policy_type || "-",
          r.renewal_date ? new Date(r.renewal_date).toLocaleDateString() : "-",
          r.remarks || "—",
        ]);
        break;
      case "quotation":
        headers = ["#", "Quote No", "Client Name", "Vehicle", "Partner", "Total Premium", "Created"];
        body = records.map((q, i) => [
          i + 1,
          q.quotation_number || "-",
          q.client_name || `${q.firstName || ""} ${q.lastName || ""}`.trim() || "-",
          q.vehicle_name || `${q.make || ""} ${q.model || ""}`.trim() || "-",
          q.insurance_partner || "-",
          q.total_premium ? `₱${q.total_premium.toLocaleString()}` : "-",
          q.created_at ? new Date(q.created_at).toLocaleDateString() : "-",
        ]);
        break;
      case "delivery":
        headers = ["#", "Policy No", "Client", "Agent", "Est. Delivery", "Actual Delivery", "Status"];
        body = records.map((d, i) => {
          const agentName = d.employee_Accounts?.personnel_Name || 
                           `${d.employee_Accounts?.first_name || ""} ${d.employee_Accounts?.last_name || ""}`.trim() || "-";
          const clientName = `${d.policy_Table?.clients_Table?.first_Name || ""} ${d.policy_Table?.clients_Table?.family_Name || ""}`.trim() || "-";
          const status = d.delivered_at ? "Delivered" : d.is_archived ? "Archived" : "Pending";
          
          return [
            i + 1,
            d.policy_Table?.internal_id || "-",
            clientName,
            agentName,
            d.estimated_delivery_date ? new Date(d.estimated_delivery_date).toLocaleDateString() : "-",
            d.delivered_at ? new Date(d.delivered_at).toLocaleDateString() : "-",
            status,
          ];
        });
        break;
    }

    return { headers, body };
  }, [records, safeRecordType]);

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    const { start, end } = getDateRange();

    const formattedStart = start ? new Date(start).toLocaleDateString() : "N/A";
    const formattedEnd = end ? new Date(end).toLocaleDateString() : "N/A";
    const createdDate = new Date().toLocaleString();

    // Count summary
    const recordCount = records.length;
    const typeLabel = safeRecordType.charAt(0).toUpperCase() + safeRecordType.slice(1);
    const rangeLabel = rangeType.charAt(0).toUpperCase() + rangeType.slice(1);

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`${typeLabel.toUpperCase()} REPORT`, 14, 15);

    // Report metadata
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Created by: ${reportCreator || "System"}`, 14, 22);
    doc.text(`Report range: ${formattedStart} — ${formattedEnd} (${rangeLabel})`, 14, 27);
    doc.text(`Generated on: ${createdDate}`, 14, 32);

    // Add summary of how many records were fetched
    doc.setFont("helvetica", "bold");
    doc.text(`${recordCount} ${recordCount === 1 ? "record" : "records"} fetched.`, 14, 37);

    // Table
    autoTable(doc, {
      head: [headers],
      body,
      startY: 42,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [103, 59, 146] },
    });

    doc.save(`${safeRecordType}_report.pdf`);
  };

  return (
    <div className="printing-record-modal-container">
      <div className="printing-record-modal-content">
        <div className="printing-record-modal-header">
          <span>Print {safeRecordType.charAt(0).toUpperCase() + safeRecordType.slice(1)} Report</span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="printing-record-modal-body">
          <div className="left-column">
            <p>Select a timeframe:</p>
            <div className="printing-record-selection">
              <select value={rangeType} onChange={(e) => setRangeType(e.target.value)}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>

              {rangeType === "yearly" && (
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {generateYearOptions().map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}

              {(safeRecordType === "policy" || safeRecordType === "quotation") && (
                <div>
                  <label>Filter by Partner:</label>
                  <select value={selectedPartner} onChange={(e) => setSelectedPartner(e.target.value)}>
                    <option value="">All Partners</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>{p.insurance_Name}</option>
                    ))}
                  </select>
                </div>
              )}

              {["policy", "due", "payment", "client", "renewal", "delivery"].includes(safeRecordType) && (
                <div>
                  <label>Filter by Employee:</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                  >
                    <option value="">All Employees</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.personnel_Name || `${emp.first_name} ${emp.last_name}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <label>Sort:</label>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="latest">Latest to Oldest</option>
                <option value="oldest">Oldest to Latest</option>
              </select>

              {rangeType === "custom" && (
                <>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
                <p>No data loaded. Click "Fetch Data".</p>
              ) : records.length === 0 ? (
                <p>No records found for the selected range.</p>
              ) : (
                <table>
                  <thead>
                    <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {body.map((row, i) => (
                      <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="printing-record-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          {records.length > 0 && (
            <button className="btn-print" onClick={handlePrintPDF}>Print PDF</button>
          )}
        </div>
      </div>
    </div>
  );
}