
import MonthlyDataPartners from './MonthlyDataPartners';
import MonthlyDataAgents from './MonthlyDataAgents';
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClientTableDue from './ClientTableDue';
import ClientTable from './AdminTables/ClientTable';

import PolicyTable from './AdminTables/PolicyTable';
import './styles/monthly-styles.css'; 


export default function MonthlyData({
    view,
    setView
}) {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
          const dropdownRef = useRef(null);
          const buttonRef = useRef(null);
        
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
    
    
    return (

        
        <div className="monthly-data-container">
            <div className="monthly-data-header">
                <div className="right-actions">
                <p className="reports-title">Reports</p>
                    
             
                <input
                    type="text"
                    className="monthly-data-search"
                    placeholder="Search clients..."
                />
            </div>    
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
                
                        <div
                          ref={dropdownRef}
                          className={`dropdown ${open ? "open" : ""}`}
                          role="menu"
                          aria-hidden={!open}
                        >
                          <button className="dropdown-item">
                                <FaMoon className="dropdown-icon" />
                                Dark Mode
                              </button>
                              <button className="dropdown-item" onClick={() => navigate("/appinsurance")}>
                                <FaSignOutAlt className="dropdown-icon" />
                                Log Out
                              </button>
                        </div>
                      </div>
            </div>

            </div>

           {/* <div className="monthly-data-buttons">
                <button onClick={() => setView("partners")}>Monthly View</button>
                <button onClick={() => setView("agent")}>Agent View</button>
            </div>

            <div className='data-area'>
                 {view === "partners" ? <MonthlyDataPartners /> : <MonthlyDataAgents />}
            </div>
           

            <div className="graph-container">
                <p>List for Selected Partner</p>
                <div className="insurance-partner-list">
                    
                </div>
            </div>
            */}

             

               <p className="client-title">Client</p> <div className="client-table-container">  <ClientTable/></div>
               <p className="client-title">Policy</p> <div className="policy-data-field">  <PolicyTable/></div>

                 <p className="claims-title">Claims</p>
                <div className="claims-table"> 
                <table>
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Client Name</th>
                            <th>Agent</th>
                            <th>Partner Company</th>
                            <th>Incident Date</th>
                            <th>Claim Date</th>
                            <th>Claim Amount</th>
                            <th>Approved Amount</th>
                            <th>Remarks</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>Lily Bon</td>
                            <td>Cocogen</td>
                            <td>2025-20-01</td>
                            <td>2025-21-01</td>
                            <td>PHP 20000</td>
                            <td>PHP 20000</td>
                            <td>Approved</td>
                        </tr>
                          <tr>
                            <td>2</td>
                            <td>Jane Doe</td>
                            <td>Lily Bon</td>
                            <td>Cocogen</td>
                            <td>-------</td>
                            <td>-------</td>
                            <td>PHP 0</td>
                            <td>PHP 0</td>
                            <td>Pending</td>
                        </tr>
                    </tbody>
                </table>
                </div>     

                <p className="delivery-title">Delivery</p>
                <div className="delivery-table"> 
                <table>
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Client Name</th>
                            <th>Agent</th>
                            <th>Partner Company</th>
                            <th>Address</th>
                            <th>Phone Number</th>
                            <th>Set Delivery Date</th>
                            <th>Delivered Date</th>
                            <th>Remarks</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>Lily Bon</td>
                            <td>Cocogen</td>
                            <td>123 Main St, Quezon City</td>
                            <td>123-456-7890</td>
                            <td>2025-10-01</td>
                            <td>2025-12-01</td>
                            <td>Delivered</td>
                        </tr>
                    </tbody>
                </table>
                </div>     

                 <p className="Payment-title">Payment</p>
                <div className="client-payment-table"> 
                <table>
                    <thead>
                        <tr>
                            <th>Client ID</th>
                            <th>Client Name</th>
                            <th>Partner Company</th>
                            <th>Client Registered</th>
                            <th>Month</th>
                            <th>Client Payment Status</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>Cocogen</td>
                            <td>2025-10-01</td>
                            <td>January</td>
                            <td>Paid</td>
                        </tr>
                          <tr>
                            <td>2</td>
                            <td>Jane</td>
                            <td>Cocogen</td>
                            <td>2025-10-01</td>
                            <td>January</td>
                            <td>Not Paid</td>
                        </tr>
                    </tbody>
                </table>            

              </div>
                


              <p className="due-title">Due</p> <div className="client-table-container"> <ClientTableDue/> </div>


              
        </div>
    );

}