import React, { useState, useEffect } from "react";
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

import { fetchModeratorClients } from "../ModeratorActions/ModeratorClientActions";
import { fetchModeratorPolicies } from "../ModeratorActions/ModeratorPolicyActions";
//import { fetchAllDues } from "../AdminActions/PaymentDueActions";
import { fetchReportCreator } from "./PrintingActionsModerator";
import { db } from "../../dbServer";

import "../moderator-styles/printing-record-moderator-styles.css";

export default function PrintingModalModerator({ recordType, onClose }) {
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

  const safeRecordType = recordType || "client";

  useEffect(() => {
    async function loadCreator() {
      const creator = await fetchReportCreator();
      setReportCreator(creator);
    }
    loadCreator();
  }, []);

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

  useEffect(() => {
    if (records.length > 0) {
      const sortedData = sortRecords(records);
      setRecords(sortedData);
    }
  }, [sortOrder]);

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

  const handleFetch = async () => {
    const { start, end } = getDateRange();
    if (!start || !end) return;

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const from = formatDate(start);
    const to = formatDate(end);
    let data = [];

    setIsLoading(true);

    try {
      switch (safeRecordType) {
        case "client":
          data = await fetchModeratorClients (null, false, from, to);
          break;
        case "policy":
          data = await fetchModeratorPolicies(from, to, selectedPartner || null);
          break;
        default:
          data = [];
      }
      const sortedData = sortRecords(data);
      setRecords(sortedData);
      setHasSearched(true);
    } catch (error) {
      console.error(error);
      setRecords([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="monthly-moderator-modal-container">
      <div className="monthly-moderator-modal-content">
        <div className="monthly-moderator-modal-header">
          <span>
            Print {safeRecordType.charAt(0).toUpperCase() + safeRecordType.slice(1)} Information
          </span>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="monthly-moderator-modal-body">
          <div className="monthly-moderator-left-column">
            <p>Select a timeframe:</p>
            <div className="monthly-moderator-selection">
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
                  {generateYearOptions().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}

              <div className="monthly-moderator-sort-controls">
                <label>Sort by:</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                  <option value="latest">Latest to Oldest</option>
                  <option value="oldest">Oldest to Latest</option>
                </select>
              </div>

              {rangeType === "custom" && (
                <>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </>
              )}

              <button onClick={handleFetch}>Fetch Data</button>
            </div>
          </div>

          <div className="monthly-moderator-right-column">
            <p>Output:</p>
            <div className="monthly-moderator-output">
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
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((item, i) => (
                      <tr key={item.id || i}>
                        <td>{i + 1}</td>
                        <td>{item.first_Name} {item.family_Name}</td>
                        <td>{item.phone_Number}</td>
                        <td>{item.address}</td>
                        <td>{item.employee?.personnel_Name || "-"}</td>
                        <td>{new Date(item.client_Registered).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="monthly-moderator-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          {records.length > 0 && (
            <button className="btn-print">Print PDF</button>
          )}
        </div>
      </div>
    </div>
  );
}
