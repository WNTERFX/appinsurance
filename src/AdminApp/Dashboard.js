// Dashboard.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart } from '@mui/x-charts/BarChart';
import { FaUserCircle, FaSpinner } from "react-icons/fa";
import DropdownAccounts from './DropDownAccounts';
import {
  recentClientTable,
  fetchRecentPolicy,
  getClientCount,
  getTotalPolicyCount,
  getTotalDeliveredPolicyCount,
  getMonthlyPartnerPolicyData,
  getAllPartners,
  getThisMonthsDuePaymentsDetails,
  getPendingClaims
} from "./AdminActions/DashboardActions";
import ProfileMenu from "../ReusableComponents/ProfileMenu";
import { FaUsers, FaFileAlt, FaTruck, FaCheckCircle, FaChartBar, FaHourglassHalf, FaMoneyBill, FaCalendarAlt } from "react-icons/fa";

export default function Dashboard() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Data states
  const [clientCount, setClientCount] = useState(0);
  const [policyCount, setPolicyCount] = useState(0);
  const [totalDeliveredCount, setTotalDeliveredCount] = useState(0);
  const [recentClients, setRecentClients] = useState([]);
  const [recentPolicies, setRecentPolicies] = useState([]);
  const [chartData, setChartData] = useState({ xAxis: [], series: [] });
  const [partners, setPartners] = useState([]);
  const [partnerColors, setPartnerColors] = useState({});
  const [duePayments, setDuePayments] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);

  // ✅ Loading states
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [isLoadingDuePayments, setIsLoadingDuePayments] = useState(true);
  const [isLoadingClaims, setIsLoadingClaims] = useState(true);

  useEffect(() => {
    async function fetchDuePayments() {
      setIsLoadingDuePayments(true);
      try {
        const result = await getThisMonthsDuePaymentsDetails();
        setDuePayments(result);
      } catch (err) {
        console.error("Error fetching due payments:", err);
      } finally {
        setIsLoadingDuePayments(false);
      }
    }
    fetchDuePayments();
  }, []);

  useEffect(() => {
    async function fetchPendingClaims() {
      setIsLoadingClaims(true);
      try {
        const result = await getPendingClaims();
        setPendingClaims(result);
      } catch (err) {
        console.error("Error fetching pending claims:", err);
      } finally {
        setIsLoadingClaims(false);
      }
    }
    fetchPendingClaims();
  }, []);

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

  useEffect(() => {
    async function recentClientTableData() {
      const clients = await recentClientTable();
      setRecentClients(clients);
    }
    recentClientTableData();
  }, []);

  useEffect(() => {
    async function recentPolicyData() {
      const policies = await fetchRecentPolicy();
      setRecentPolicies(policies);
    }
    recentPolicyData();
  }, [])

  useEffect(() => {
    async function fetchAllCounts() {
      setIsLoadingCounts(true);
      try {
        const [clients, totalPolicies, totalDelivered] = await Promise.all([
          getClientCount(),
          getTotalPolicyCount(),
          getTotalDeliveredPolicyCount()
        ]);
        setClientCount(clients || 0);
        setPolicyCount(totalPolicies || 0);
        setTotalDeliveredCount(totalDelivered || 0);
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
      } finally {
        setIsLoadingCounts(false);
      }
    }
    fetchAllCounts();
  }, []);

  useEffect(() => {
    async function fetchChartDataAndPartners() {
      setIsLoadingChart(true);
      try {
        const [chartResult, partnersData] = await Promise.all([
          getMonthlyPartnerPolicyData(),
          getAllPartners()
        ]);
        
        setChartData(chartResult);
        setPartners(partnersData);
        
        setPartnerColors((prevColors) => {
          const newColors = { ...prevColors };
          partnersData.forEach((p) => {
            if (!newColors[p.insurance_Name]) {
              newColors[p.insurance_Name] = generateRandomColor();
            }
          });
          return newColors;
        });
      } catch (err) {
        console.error("Error fetching chart data:", err);
      } finally {
        setIsLoadingChart(false);
      }
    }
    fetchChartDataAndPartners();
  }, []);

  const handleViewAllClaims = () => {
    navigate("/appinsurance/main-app/claim");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        {/* Left side */}
        <div className="right-actions">
          <div className="dashboard-title-container">
            <h4 className="dashboard-title">Dashboard</h4>
            <p className="welcome-text">Welcome back, Here's your current overview.</p>
          </div>
        </div>
        {/* Right side */}
        <div className="left-actions">
          <div className="profile-menu">
            <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Cards with Loading */}
        <div className="active-clients">
          <div className="active-clients-data"
            onClick={() => !isLoadingCounts && navigate("/appinsurance/main-app/client")} 
            style={{ cursor: isLoadingCounts ? 'default' : 'pointer' }}>
            <h2><FaUsers className="card-icon" />Total Clients</h2>
            {isLoadingCounts ? (
              <FaSpinner className="spinner" />
            ) : (
              <p>{clientCount}</p>
            )}
          </div>
        </div>

        <div className="active-policy">
          <div className="active-policy-data"
            onClick={() => !isLoadingCounts && navigate("/appinsurance/main-app/policy")}
            style={{ cursor: isLoadingCounts ? 'default' : 'pointer' }}>
            <h2><FaFileAlt className="card-icon" />Total Policies</h2>
            {isLoadingCounts ? (
              <FaSpinner className="spinner" />
            ) : (
              <p>{policyCount}</p>
            )}
          </div>
        </div>

        <div className="delivered-policy"
          onClick={() => !isLoadingCounts && navigate("/appinsurance/main-app/delivery")}
          style={{ cursor: isLoadingCounts ? 'default' : 'pointer' }}>
          <div className="delivered-policy-data">
            <h2><FaTruck className="card-icon" />Total Deliveries</h2>
            {isLoadingCounts ? (
              <FaSpinner className="spinner" />
            ) : (
              <p>{totalDeliveredCount}</p>
            )}
          </div>
        </div>

        <div className="payment"
          onClick={() => !isLoadingCounts && navigate("/appinsurance/main-app/payment-records")}
          style={{ cursor: isLoadingCounts ? 'default' : 'pointer' }}>
          <div className="payment-data">
            <h2><FaMoneyBill className="card-icon" />Total Payment Records</h2>
            {isLoadingCounts ? (
              <FaSpinner className="spinner" />
            ) : (
              <p>{policyCount}</p>
            )}
          </div>
        </div>

        {/* Monthly Data Chart with Loading */}
        <div className="monthly-data">
          <div className="monthly-data-header">
            <h2><FaChartBar className="card-icon" /> Monthly Data</h2>
            {/* Dynamic legend */}
            {!isLoadingChart && (
              <div className="partner-container">
                {partners.map((p) => (
                  <span
                    key={p.id}
                    className="partner"
                    style={{
                      backgroundColor: partnerColors[p.insurance_Name] || "#888",
                      color: "white",
                      padding: "4px 10px",
                      borderRadius: "16px",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.insurance_Name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="monthly-data-chart">
            {isLoadingChart ? (
              <div className="loading-overlay">
                <FaSpinner className="spinner" />
                <p>Loading chart data...</p>
              </div>
            ) : (
              <BarChart
                xAxis={[{ scaleType: "band", data: chartData.xAxis }]}
                series={chartData.series.map((s) => ({
                  ...s,
                  color: partnerColors[s.label] || "#888888",
                }))}
                height={300}
                sx={{ width: '100%' }}
              />
            )}
          </div>
        </div>

        {/* Pending Claims with Loading */}
        <div className="pending-claims">
          <div className="pending-claims-header">
            <h2><FaHourglassHalf className="card-icon" /> Pending Claims</h2>
            <button 
              className="view-all-claims-btn"
              onClick={handleViewAllClaims}
            >
              View all claims
            </button>
          </div>
          
          <div className="pending-claims-list">
            {isLoadingClaims ? (
              <div className="loading-overlay">
                <FaSpinner className="spinner" />
                <p>Loading pending claims...</p>
              </div>
            ) : pendingClaims.length === 0 ? (
              <p className="no-claims-message">No pending claims</p>
            ) : (
              pendingClaims.map((claim) => (
                <div key={claim.id} className="claim-item">
                  <div className="claim-info">
                    <p className="claim-policy-id">Policy ID: {claim.policy_id}</p>
                    <p className="claim-policy-holder">Policy Holder: {claim.policy_holder}</p>
                  </div>
                  <span className="claim-status-badge">Status: {claim.status}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Due Payments with Loading */}
        <div className="due-payments-list">
          <h2><FaCalendarAlt className="card-icon" /> This Month's Due Payments</h2>
          <div className="due-payments-items scrollable-table">
            {isLoadingDuePayments ? (
              <div className="loading-overlay">
                <FaSpinner className="spinner" />
                <p>Loading due payments...</p>
              </div>
            ) : duePayments.length === 0 ? (
              <p>No due payments this month</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Client Name</th>
                    <th>Policy ID</th>
                    <th>Due Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {duePayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.client_name}</td>
                      <td>{payment.policy_id}</td>
                      <td>{payment.payment_date}</td>
                      <td>{payment.amount_to_be_paid.toLocaleString(undefined, { style: 'currency', currency: 'PHP' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function generateRandomColor() {
  // Soft random pastel tones
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 50%)`;
}