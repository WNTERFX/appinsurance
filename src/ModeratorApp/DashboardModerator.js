import { BarChart } from '@mui/x-charts/BarChart';
import "./moderator-styles/dashboard-styles-moderator.css"; 
import { useNavigate } from "react-router-dom";
import { FaUserCircle} from "react-icons/fa";
import  DropdownAccountsModerator  from './DropDownAccountsModerator';
import React, { useState, useRef, useEffect } from "react";
import { useModeratorProfile } from './useModeratorProfile';


export default function DashboardModerator() {
    
        const navigate = useNavigate();

          const [open, setOpen] = useState(false);
          const dropdownRef = useRef(null);
          const buttonRef = useRef(null);
          const profile = useModeratorProfile();

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
         <div className="dashboard-container-moderator">
          <div className="dashboard-header-moderator">
            
            {/* Left side */}
            <div className="right-actions-moderator">
              <p className="dashboard-title-moderator">Dashboard</p>
              
            </div>
        
            {/* Right side */}
            <div className="left-actions-moderator">
              <div className="profile-menu-moderator">
                <button
                  ref={buttonRef}
                  className="profile-button-moderator"
                  onClick={() => setOpen((s) => !s)}
                  aria-haspopup="true"
                  aria-expanded={open}
                >
                    <span className="profile-name-moderator">{profile?.fullName || "?"}</span>
                  <FaUserCircle className="profile-icon-moderator" />
                  
                </button>
                 <div>
                    <DropdownAccountsModerator 
                    open={open}
                    onClose={() => setOpen(false)}
                    onDarkMode={() => console.log("Dark Mode toggled")}
                    />
                    </div>
                
                    
        
              
              </div>
            </div>
        
          </div>
        
                    
                    <div className="dashboard-content-moderator">
        
                        <div className ="active-clients-moderator">
                            
                            <div className="active-clients-data-moderator">
                                <h2>Active Clients</h2>
                                
                                <p>150</p>
                            </div>
                        </div>
        
                        <div className ="due-clients-moderator">
                            
                            <div className="due-clients-data-moderator">
                                <h2>Due Clients</h2>
                                <p>50</p>
                            </div>
                        </div>
        
                        <div className="clients-list-moderator" 
                            onClick={() =>  navigate("/appinsurance/MainAreaModerator/ClientModerator")} 
                            style={{ cursor: "pointer" }}>  
             
                            
                            <div className="clients-list-data-moderator">
                                <h2>Clients List</h2>
                                
                                <div className="dashboard-table-moderator">
                                <table > 
                                    <tr> 
                                        <th>Policy Number</th>
                                        <th>Agent</th>
                                        <th>Policy Holder</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                    </tr> 
                                    <tr>
                                         
                                        <td>12345</td>
                                        <td>Lily Bon</td>
                                        <td>John Doe</td>
                                        <td>2023-01-01</td>
                                        <td>2023-12-31</td>
                                    </tr>
                                   
                                 </table>    
        
                                 </div> 
                                 
                            </div>
                        </div>
        
                        <div className="undelivered-policy-moderator">
                            
                            <div className="undelivered-policy-data-moderator">
                                <h2>Undelivered Policy</h2>
                                <p>10</p>
                            </div>
                        </div>
        
                        <div className="delivered-policy-moderator">
                            
                            <div className="delivered-policy-data-moderator">
                                <h2>Delivered Policy</h2>
                                <p>140</p>
                            </div>
                        </div>
        
                        <div className="recent-policy-moderator">
                            
                            <div className="recent-policy-data-moderator">
                                <h2>Recent Policy</h2>
                                 <div className="dashboard-table-moderator">
                                 <table>
                                    
                                    <tbody>
                                    <tr>
                                        <td>1001</td>
                                        <td>Jane Smith</td>
                                        <td>2023-12-01</td>
                                    </tr>
                                   
                                    </tbody>
                                </table>
                                </div>
                             </div>
                        </div>
        
                        <div className="monthly-data-moderator">
                            Monthly Data
                            <div className="monthly-data-chart-moderator">
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