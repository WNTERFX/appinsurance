import './styles/claims-table-styles.css';
import Filter from './Filter';
import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import  DropdownAccounts  from './DropDownAccounts'

export default function ClaimTable() {
    
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

    return(
     <div className="claims-container">
            <div className="claims-header">
                <div className="right-actions">
                <p className="claims-title">Claims</p>
                          
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
        

            <div className="claims-records-content">
            <div className="claims-data-field">
                <div className="control-options-claims">
                    <button className="approve-btn-claims">Approve</button>
                    <button className="disapprove-btn-claims">Edit</button>
                    <button className="print-btn-claims">Print</button>
                </div>
            
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
            </div>
            
            </div>  
             


    </div>
    );
}