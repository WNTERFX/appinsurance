import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart } from '@mui/x-charts/BarChart';
import { FaUserCircle, FaUsers, FaFileAlt, FaTruck, FaCheckCircle, FaChartBar, FaHourglassHalf } from "react-icons/fa";
import DropdownAccountsModerator from './DropDownAccountsModerator';
import { useModeratorProfile } from './useModeratorProfile';
import "./moderator-styles/dashboard-styles-moderator.css";

export default function DashboardModerator() {

  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const profile = useModeratorProfile();

  // Close dropdown on outside click
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
        <div className="dashboard-container-moderator">
      <div className="dashboard-header-moderator">
        {/* Left Side */}
        <div className="right-actions-moderator">
          <div className="dashboard-title-container-moderator">
            <h4 className="dashboard-title-moderator">Dashboard</h4>
            <p className="welcome-text-moderator">
              Welcome back, {profile?.fullName || "Moderator"}!
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="left-actions-moderator">
          <div className="profile-menu-moderator">
            <button
              ref={buttonRef}
              className="profile-button-moderator"
              onClick={() => setOpen((s) => !s)}
              aria-haspopup="true"
              aria-expanded={open}
            >
              <span className="profile-name-moderator">
                {profile?.fullName || "?"}
              </span>
              <FaUserCircle className="profile-icon-moderator" />
            </button>

            <DropdownAccountsModerator
              open={open}
              onClose={() => setOpen(false)}
              onDarkMode={() => console.log("Dark Mode toggled")}
            />
          </div>
        </div>
      </div>

            
            <div className="dashboard-content-moderator">

                <div className ="active-clients-moderator">
                    
                    <div className="active-clients-data-moderator">
                        <h2><FaUsers className="card-icon-moderator" />Active Clients</h2>
                        
                         <p>150</p>
                    </div>
                </div>

                <div className ="due-clients-moderator">
                    
                    <div className="due-clients-data-moderator">
                        <h2><FaFileAlt className="card-icon-moderator" />Active Policy</h2>
                        <p>50</p>
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

                <div className="undelivered-policy-moderator">
                    
                    <div className="undelivered-policy-data-moderator">
                        <h2><FaTruck className="card-icon-moderator" />Undelivered Policy</h2>
                        <p>10</p>
                    </div>
                </div>

                <div className="delivered-policy-moderator">
                    
                    <div className="delivered-policy-data-moderator">
                        <h2><FaCheckCircle className="card-icon-moderator" />Delivered Policy</h2>
                        <p>140</p>
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

               <div className="monthly-data-moderator">
                <div className="monthly-data-header-moderator">
                 <h2><FaChartBar className="card-icon-moderator" /> Monthly Client Data</h2>
                    <div className="partner-container-moderator">
                       <span className="partner-moderator merchantile">Merchantile</span>
                    <span className="partner-moderator standard">Standard</span>
                     <span className="partner-moderator stronghold">Stronghold</span>
                    <span className="partner-moderator cocogen">Cocogen</span>
                    </div>
                        </div>

                      <div className="monthly-data-chart-moderator">
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

                   <div className="pending-claims-moderator">
                      <div className="pending-claims-header-moderator">
                        <h2><FaHourglassHalf className="card-icon-moderator" /> Pending Claims</h2>
                       <button className="view-claims-btn-moderator">View all claims</button>
                        </div>
                         {/* your pending claims content here */}
                         </div>
                            </div>

                           </div>

    );
}
