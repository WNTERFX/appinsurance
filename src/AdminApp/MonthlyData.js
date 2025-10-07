
import MonthlyDataPartners from './MonthlyDataPartners';
import MonthlyDataAgents from './MonthlyDataAgents';
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClientTableDue from './ClientTableDue';
import ClientTable from './AdminTables/ClientTable';

import PolicyTable from './AdminTables/PolicyTable';
import './styles/monthly-styles.css'; 
import  DropdownAccounts  from './DropDownAccounts'


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

          

              <p className="due-title"> Due </p> <div className="client-table-container"> <ClientTableDue/> </div>

              <p className="renewals-title"> Renewals </p> <div className="renewal-table-container">  </div>

             

              
        </div>
    );

}