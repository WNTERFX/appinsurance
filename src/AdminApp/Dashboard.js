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
  getTotalDeliveredPolicyCount 
} from "./AdminActions/DashboardActions";
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

    return (
        <div className="dashboard-container">
  <div className="dashboard-header">

    {/* Left side */}
    <div className="right-actions">
      <div className="dashboard-title-container">
      <h4 className="dashboard-title">Dashboard</h4>
      <p className="welcome-text">Welcome back, ADMIN! Here's  your Silverstar agency overview. </p>
      </div>
    </div>

    {/* Right side */}
    <div className="left-actions">
      <div className="profile-menu">
        <button
          ref={buttonRef}
          className="profile-button"
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
        >
            <span className="profile-name">Admin</span>
          <FaUserCircle className="profile-icon" />

        </button>

        <div>
          <DropdownAccounts
          open={open}
          onClose={() => setOpen(false)}
          onDarkMode={() => console.log("Dark Mode toggled")}
          />
        </div>
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
                 <h2><FaChartBar className="card-icon" /> Monthly Client Data</h2>
                    <div className="partner-container">
                       <span className="partner merchantile">Merchantile</span>
                    <span className="partner standard">Standard</span>
                     <span className="partner stronghold">Stronghold</span>
                    <span className="partner cocogen">Cocogen</span>
                    </div>
                        </div>

                      <div className="monthly-data-chart">
                      <BarChart
                      xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                       series={[
                      { data: [4, 3, 5] },
                     { data: [1, 6, 3] },
                    { data: [2, 5, 6] },
                        ]}
                    height={200}
                     width={1000}
                          />
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