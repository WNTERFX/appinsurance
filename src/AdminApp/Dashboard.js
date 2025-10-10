import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart } from '@mui/x-charts/BarChart';
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import  DropdownAccounts  from './DropDownAccounts';
import { 
  recentClientTable, 
  fetchRecentPolicy ,
  getClientCount ,  
  getActivePolicyCount,
  getDeliveredAndUndeliveredCounts} from "./AdminActions/DashboardActions";
import {FaUsers, FaFileAlt,FaTruck, FaCheckCircle, FaChartBar,FaHourglassHalf} from "react-icons/fa";


export default function Dashboard() {
    
    const navigate = useNavigate();
    
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [clientCount, setClientCount] = useState(0);
    const [policyCount, setPolicyCount] = useState(0);
    const [undeliveredCount, setUndeliveredCount] = useState(0);
    const [deliveredCount, setDeliveredCount] = useState(0);
    const [recentClients, setRecentClients] = useState([]);
    const [recentPolicies, setRecentPolicies] = useState([]);

  // close when clicking outside
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
      const [clients, policies, deliveredInfo] = await Promise.all([
        getClientCount(),
        getActivePolicyCount(),
        getDeliveredAndUndeliveredCounts()
      ]);
      setClientCount(clients || 0);
      setPolicyCount(policies || 0);
      setDeliveredCount(deliveredInfo?.deliveredCount ?? 0);
      setUndeliveredCount(deliveredInfo?.undeliveredCount ?? 0);
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
                    onClick={() =>  navigate("/appinsurance/main-app/Client")} >
                        <h2><FaUsers className="card-icon" />Active Clients</h2>
                        
                         <p>{clientCount}</p>
                    </div>
                </div>

                <div className ="active-policy">
                    
                    <div className="active-policy-data"
                    onClick={() =>  navigate("/appinsurance/main-app/policy")} >
                        <h2><FaFileAlt className="card-icon" />Active Policy</h2>
                        <p>{policyCount}</p>
                    </div>
                </div>

            {/*    <div className="clients-list" 
                    onClick={() =>  navigate("/appinsurance/MainArea/Client")} 
                    style={{ cursor: "pointer" }}>  
     
                    
                    <div className="clients-list-data">
                        <h2>Recent Clients</h2>
                        
                    <div className="dashboard-table">
                          <table>
                            <thead>
                              <tr>
                                <th>1</th>
                                <th>Client Name</th>
                                <th>Agent</th>
                                <th>Date Added</th>
                              </tr>
                            </thead>
                            <tbody>
                              {recentClients.length > 0 ? (
                                recentClients.map((c, index) => (
                                  <tr key={c.uid}>
                                    <td>{index + 1}</td>
                                    <td>{c.fullName}</td>
                                    <td>{c.agent_Name}</td>
                                    <td>{c.client_Registered}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3">No recent clients found</td>
                                </tr>
                              )}
                            </tbody>
                            </table>    
                        </div>
                      
                         
                    </div>
                </div> */}

                <div className="undelivered-policy">
                    
                    <div className="undelivered-policy-data"
                    onClick={() =>  navigate("/appinsurance/main-app/delivery")} 
                    >
                        <h2><FaTruck className="card-icon" />Undelivered Policy</h2>
                        <p>{undeliveredCount}</p>
                    </div>
                </div>

                <div className="delivered-policy"
                 onClick={() =>  navigate("/appinsurance/main-app/delivery")} 
                   >
                    <div className="delivered-policy-data">
                      
                        <h2><FaCheckCircle className="card-icon" />Delivered Policy</h2>
                        <p>{deliveredCount}</p>
                    </div>
                </div>

              {/*  <div className="recent-policy"
                    onClick={() =>  navigate("/appinsurance/MainArea/Policy")} 
                    style={{ cursor: "pointer" }}>  
     
                    
                    <div className="recent-policy-data">
                        <h2>Recent Policy</h2>
                         <div className="dashboard-table">
                         <table>
                            
                            <tbody>
                            <tr>
                                <th></th>
                                <th>Policy Number</th>
                                <th>Policy Holder</th>
                                <th>Date Added</th>
                            </tr>
                          
                          {recentPolicies.length > 0 ? (
                            recentPolicies.map((p, index) => (
                              <tr key={p.uid}>
                                <td>{index + 1}</td>
                                <td>{p.internal_id}</td>
                                <td>{p.clients_Table?.prefix} {p.clients_Table?.first_Name} {p.clients_Table?.middle_Name} {p.clients_Table?.family_Name} {p.clients_Table?.suffix}</td>
                                <td>{p.created_at}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3">No recent policies found</td>
                            </tr>
                          )}
                        
                          </tbody>
                        </table>
                        </div>
                     </div>
                </div> */}

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
