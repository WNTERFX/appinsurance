// Dashboard.js

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart } from '@mui/x-charts/BarChart';
import { FaUserCircle  } from "react-icons/fa"; 
import  DropdownAccounts  from './DropDownAccounts';
import {
  recentClientTable,
  fetchRecentPolicy ,
  getClientCount ,
  getTotalPolicyCount,         
  getTotalDeliveredPolicyCount,
  getMonthlyPartnerPolicyData,
  getAllPartners,
  getThisMonthsDuePaymentsDetails
} from "./AdminActions/DashboardActions";
import ProfileMenu from "../ReusableComponents/ProfileMenu";
import {FaUsers, FaFileAlt,FaTruck, FaCheckCircle, FaChartBar,FaHourglassHalf , FaMoneyBill} from "react-icons/fa";


export default function Dashboard() {

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [clientCount, setClientCount] = useState(0);
    const [policyCount, setPolicyCount] = useState(0); 
    const [totalDeliveredCount, setTotalDeliveredCount] = useState(0); 
    const [recentClients, setRecentClients] = useState([]);
    const [recentPolicies, setRecentPolicies] = useState([]);
    const [chartData, setChartData] = useState({ xAxis: [], series: [] });
    const [partners, setPartners] = useState([]);
    const [partnerColors, setPartnerColors] = useState({});
    const [duePayments, setDuePayments] = useState([]);

    useEffect(() => {
      async function fetchDuePayments() {
        const result = await getThisMonthsDuePaymentsDetails();
        setDuePayments(result);
      }
      fetchDuePayments();
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

  useEffect (() => {
      async function recentClientTableData() {
          const clients = await recentClientTable();
          setRecentClients(clients);
      }
      recentClientTableData();
  }, []);

  useEffect (() => {
      async function recentPolicyData() {
         const policies = await fetchRecentPolicy();
        setRecentPolicies(policies);
      }
      recentPolicyData();
  }, [])


useEffect(() => {
  async function fetchAllCounts() {
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
    }
  }
  fetchAllCounts();
  
  }, []);

  useEffect(() => {
    async function fetchChartData() {
      const result = await getMonthlyPartnerPolicyData();
      setChartData(result);
    }
    fetchChartData();
  }, []);

  useEffect(() => {
  async function fetchPartners() {
    const partnersData = await getAllPartners();
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
  }
  fetchPartners();
}, []);

    return (
        <div className="dashboard-container">
  <div className="dashboard-header">

    {/* Left side */}
    <div className="right-actions">
      <div className="dashboard-title-container">
      <h4 className="dashboard-title">Dashboard</h4>
      <p className="welcome-text">Welcome back, Here's  your current overview. </p>
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

                <div className ="active-clients">

                    <div className="active-clients-data"
                    onClick={() =>  navigate("/appinsurance/main-app/client")} >
                        <h2><FaUsers className="card-icon" />Total Clients</h2>

                         <p>{clientCount}</p>
                    </div>
                </div>

                <div className ="active-policy">

                    <div className="active-policy-data"
                    onClick={() =>  navigate("/appinsurance/main-app/policy")} >
                        <h2><FaFileAlt className="card-icon" />Total Policies</h2> 
                        <p>{policyCount}</p>
                    </div>
                </div>

                <div className="delivered-policy"
                 onClick={() =>  navigate("/appinsurance/main-app/delivery")}
                   >
                    <div className="delivered-policy-data">

                        <h2><FaTruck className="card-icon" />Total Deliveries</h2> 
                        <p>{totalDeliveredCount}</p> 
                    </div>
                </div>

                <div className="payment"
                 onClick={() =>  navigate("/appinsurance/main-app/payment-records")}
                   >
                    <div className="payment-data">

                        <h2><FaMoneyBill className="card-icon" />Total Payment Records</h2> 
                        <p>{policyCount}</p> 
                    </div>
                </div>


              <div className="monthly-data">
              <div className="monthly-data-header">
                <h2><FaChartBar className="card-icon" /> Monthly Data</h2>

                {/* Dynamic legend */}
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
              </div>

              <div className="monthly-data-chart">
                  <BarChart
                    xAxis={[{ scaleType: "band", data: chartData.xAxis }]}
                    series={chartData.series.map((s) => ({
                      ...s,
                      color: partnerColors[s.label] || "#888888",
                    }))}
                    height={300}
                    sx={{ width: '100%' }}  // ✅ let it adapt to container width
                  />
              </div>

              <div className="due-payments-list">
                <h2><FaHourglassHalf className="card-icon" /> This Month's Due Payments</h2>
                <div className="due-payments-items scrollable-table">
                  {duePayments.length === 0 ? (
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

                   <div className="pending-claims">
                      <div className="pending-claims-header">
                        <h2><FaHourglassHalf className="card-icon" /> Pending Claims</h2>
                       <button className="view-claims-btn">View all claims</button>
                        </div>
                         {/* your pending claims content here */}
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