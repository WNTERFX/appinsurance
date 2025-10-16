
import MonthlyDataPartners from './MonthlyDataPartners';
import MonthlyDataAgents from './MonthlyDataAgents';
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClientTableDue from './ClientTableDue';
import ClientTable from './AdminTables/ClientTable';

import PolicyTable from './AdminTables/PolicyTable';
import ProfileMenu from "../ReusableComponents/ProfileMenu";
import './styles/monthly-styles.css'; 
import  DropdownAccounts  from './DropDownAccounts'

import PrintingModal from './RecordPrinting/PrintingModal';


export default function MonthlyData({
    view,
    setView
}) {
    const navigate = useNavigate();

          const [open, setOpen] = useState(false);
          const dropdownRef = useRef(null);
          const buttonRef = useRef(null);
          const [openModal, setOpenModal] = useState(false);
          const [recordType, setRecordType] = useState(null);
        
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

        
        <div className="reports-container">
            <div className="reports-header">
                <div className="right-actions">
                <p className="reports-title">Reports</p>

            </div>    
            <div className="left-actions">

                <div className="profile-menu">
                 <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
                </div>
            </div>

            </div>

            
      
              <div className="client-record-container header-with-button">
                <p className="client-title">Client</p>
                <button
                  className="btn btn-create"
                  onClick={() => {
                    setRecordType("client");
                    setOpenModal(true);
                  }}
                >
                  Print
                </button>
              </div>

              <div className="policy-record-container header-with-button">
                <p className="policy-title">Policy</p>
                <button
                  className="btn btn-create"
                  onClick={() => {
                    setRecordType("policy");
                    setOpenModal(true);
                  }}
                >
                  Print
                </button>
              </div>

              <div className="due-record-container header-with-button">
                <p className="due-title">Due</p>
                <button
                  className="btn btn-create"
                  onClick={() => {
                    setRecordType("due");
                    setOpenModal(true);
                  }}
                >
                  Print
                </button>
              </div>

              <div className="renewal-record-container header-with-button">
                <p className="renewals-title">Renewals</p>
                <button className="btn btn-create">Print</button>
              </div>
             
              {openModal && (
                <PrintingModal
                  recordType={recordType}
                  onClose={() => setOpenModal(false)}
                />
              )}
                            
        </div>
    );

}