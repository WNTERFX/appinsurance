import './styles/claims-styles.css';
import Filter from './Filter';
import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import  DropdownAccounts  from './DropDownAccounts'

import ClaimsTable from './AdminTables/ClaimsTable';

export default function Claims() {
    
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
                   <div className="claims-records-table">
                     <ClaimsTable/>
                   </div>
                 </div>
                
            </div>


            

    </div>
    );
}