import React, { useState, useEffect, useMemo } from "react";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

import { fetchClients } from "../AdminActions/ClientActions";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import { fetchAllDues, fetchPaymentsWithPenalties } from "../AdminActions/PaymentDueActions";
import { fetchReportCreator } from "./PrintingActions";
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
  const [reportCreator, setReportCreator] = useState("");
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");


  const safeRecordType = recordType || "client";

  useEffect(() => {
    async function loadCreator() {
      const creator = await fetchReportCreator();
      setReportCreator(creator);
    }
    loadCreator();
  }, []);

  useEffect(() => {
    if (safeRecordType === "policy") fetchInsurancePartners();
  }, [safeRecordType]);

  const fetchInsurancePartners = async () => {
    try {
      const { data, error } = await db
        .from("insurance_Partners")
        .select("id, insurance_Name")
        .order("insurance_Name", { ascending: true });
      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error("Error fetching insurance partners:", error);
    }
  };

  const sortRecords = (data) => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => {
      let dateA, dateB;
      switch (safeRecordType) {
        case "client":
          dateA = new Date(a.client_Registered);
          dateB = new Date(b.client_Registered);
          break;
        case "policy":
          dateA = new Date(a.created_at);
          dateB = new Date(b.created_at);
          break;
        case "due":
        case "payment":
          dateA = new Date(a.payment_date);
          dateB = new Date(b.payment_date);
          break;
        default:
          return 0;
      }
      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await db
        .from("employee_Accounts")
        .select("id, personnel_Name, first_name, last_name")
        .order("personnel_Name", { ascending: true });
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    if (records.length > 0) setRecords(sortRecords(records));
  }, [sortOrder]);

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
    const opt = { year: "numeric", month: "long", day: "numeric" };
    return `${start.toLocaleDateString("en-US", opt)} - ${end.toLocaleDateString("en-US", opt)}`;
  };

  const handleFetch = async () => {
    const { start, end } = getDateRange();
    if (rangeType === "custom" && (!startDate || !endDate)) {
      alert("Please select both start and end dates");
      return;
    }
    if (!start || !end) return;

    const formatDate = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
      ).padStart(2, "0")}`;

    const from = formatDate(start);
    const to = formatDate(end);

    setIsLoading(true);
    setCurrentDateRange({ start, end });

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
        default:
          data = [];
      }
      setRecords(sortRecords(Array.isArray(data) ? data : []));
      setHasSearched(true);
    } catch (err) {
      console.error("Error fetching data:", err);
      setRecords([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
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
          p.clients_Table
            ? `${p.clients_Table.first_Name} ${p.clients_Table.family_Name}`
            : "-",
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
          d.policy_Table?.clients_Table
            ? `${d.policy_Table.clients_Table.first_Name} ${d.policy_Table.clients_Table.family_Name}`
            : "-",
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
    }
    return { headers, body };
  }, [records, safeRecordType]);

  // ✅ UPDATED handlePrintPDF with grouping by client → policy
  const handlePrintPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("PAYMENT REPORT", 14, 15);

    if (safeRecordType !== "payment") {
      // Keep the old logic for non-payment reports
      autoTable(doc, {
        head: [headers],
        body,
        startY: 25,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
      });
      doc.save(`${safeRecordType}_report.pdf`);
      return;
    }

    // 🔹 Group by client → policy
    const grouped = {};
    for (const p of records) {
      const clientInternalId = p.policy_Table?.clients_Table?.internal_id || "N/A";
      const clientName = p.policy_Table?.clients_Table
        ? `${p.policy_Table.clients_Table.first_Name} ${p.policy_Table.clients_Table.family_Name}`
        : "Unknown Client";
      const clientKey = `${clientInternalId} - ${clientName}`;
      const policyNum = p.policy_Table?.internal_id || "Unknown Policy";

      if (!grouped[clientKey]) grouped[clientKey] = {};
      if (!grouped[clientKey][policyNum]) grouped[clientKey][policyNum] = [];
      grouped[clientKey][policyNum].push(p);
    }

    let y = 25;

    for (const [client, policies] of Object.entries(grouped)) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Client: ${client}`, 14, y);
      y += 8;

      for (const [policyNum, payments] of Object.entries(policies)) {
        doc.setFontSize(11);
        doc.text(`Policy: ${policyNum}`, 16, y);
        y += 6;

        const rows = payments.map((p, i) => [
          i + 1,
          new Date(p.payment_date).toLocaleDateString(),
          `₱${p.amount_to_be_paid.toLocaleString()}`,
          p.is_paid ? "Paid" : "Unpaid",
          `₱${p.totalPenalty?.toLocaleString() || "0.00"}`,
          `₱${p.totalDue?.toLocaleString() || "0.00"}`,
        ]);

        autoTable(doc, {
          startY: y,
          head: [["Month", "Payment Date", "Amount", "Status", "Penalty", "Total Due"]],
          body: rows,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202] },
          margin: { left: 16 },
        });

        const finalY = doc.lastAutoTable.finalY + 5;

        const totalPaid = payments
          .filter((r) => r.is_paid)
          .reduce((sum, r) => sum + (r.paid_amount || 0), 0);
        const totalPenalty = payments.reduce((sum, r) => sum + (r.totalPenalty || 0), 0);
        const totalDue = payments.reduce((sum, r) => sum + (r.totalDue || 0), 0);

        doc.setFontSize(9);
        doc.text(`Total Paid: ₱${totalPaid.toLocaleString()}`, 16, finalY);
        doc.text(`Total Penalties: ₱${totalPenalty.toLocaleString()}`, 16, finalY + 6);
        doc.text(`Total Due: ₱${totalDue.toLocaleString()}`, 16, finalY + 12);

        y = finalY + 20;

        // Add a page break if near bottom
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
      }

      // Add a visual separator between clients
      doc.setDrawColor(150);
      doc.line(14, y, 195, y);
      y += 10;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }

    doc.save(`payment_report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="printing-record-modal-container">
      <div className="printing-record-modal-content">
        <div className="printing-record-modal-header">
          <span>Print {safeRecordType.charAt(0).toUpperCase() + safeRecordType.slice(1)} Report</span>
          <button onClick={onClose}>✕</button>
        </div>

        {/* UI untouched */}
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
                  {generateYearOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              )}

              {safeRecordType === "policy" && (
                <div className="partner-filter">
                  <label>Filter by Partner:</label>
                  <select
                    value={selectedPartner}
                    onChange={(e) => {
                      setSelectedPartner(e.target.value);
                      setRecords([]);
                      setHasSearched(false);
                    }}
                  >
                    <option value="">All Partners</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.insurance_Name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {["policy", "due", "payment", "client"].includes(safeRecordType) && (
                <div className="employee-filter">
                  <label>Filter by Employee:</label>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => {
                      setSelectedEmployee(e.target.value);
                      setRecords([]);
                      setHasSearched(false);
                    }}
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

              <div className="sort-controls">
                <label>Sort by:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
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

          {/* Output preview remains unchanged */}
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
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {body.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td key={j}>{cell}</td>
                        ))}
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
