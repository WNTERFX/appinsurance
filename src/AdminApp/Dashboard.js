import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart } from '@mui/x-charts/BarChart';
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import  DropdownAccounts  from './DropDownAccounts';
import { recentClientTable, fetchRecentPolicy ,getClientCount } from "./AdminActions/DashboardActions";


export default function Dashboard() {
    
    const navigate = useNavigate();
    
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const [clientCount, setClientCount] = useState(0);
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
    async function fetchCount() {
      const count = await getClientCount();
      setClientCount(count);
    }
    fetchCount();
  }, []);
 
    return (
        <div className="dashboard-container">
  <div className="dashboard-header">
    
    {/* Left side */}
    <div className="right-actions">
      <p className="dashboard-title">Dashboard</p>
      
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
                    
                    <div className="active-clients-data">
                        <h2>Active Clients</h2>
                        
                         <p>{clientCount}</p>
                    </div>
                </div>

                <div className ="due-clients">
                    
                    <div className="due-clients-data">
                        <h2>Due Clients</h2>
                        <p>50</p>
                    </div>
                </div>

                <div className="clients-list" 
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
                </div>

                <div className="undelivered-policy">
                    
                    <div className="undelivered-policy-data">
                        <h2>Undelivered Policy</h2>
                        <p>10</p>
                    </div>
                </div>

                <div className="delivered-policy">
                    
                    <div className="delivered-policy-data">
                        <h2>Delivered Policy</h2>
                        <p>140</p>
                    </div>
                </div>

                <div className="recent-policy"
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
                </div>

                <div className="monthly-data">
                    <div className="monthly-data-chart">
                        <h2>Monthly Data</h2>
                        <BarChart
                           xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                           series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                           height={200}
                           width={1000}
                        />    
                    </div>
                </div>

            </div>
        </div>
    );
}
