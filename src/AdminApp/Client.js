import React, { useState, useRef, useEffect } from "react";
import ClientTable from "./AdminTables/ClientTable";
import { FaPlus, FaArchive, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import  DropdownAccounts  from './DropDownAccounts'

export default function Client() {

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
        <div className="Client-container">
           
            <div className="Client-header">
               {/* Left side: title + search */}
             <div className="right-actions">
             <p className="client-title">Client</p>
           <input
           type="text"
           className="client-search"
           placeholder="Search clients..."
          />
  </div>

  {/* Right side: create + archive + profile */}
    <div className="left-actions">
      <button
        className="btn btn-create"
        onClick={() =>
          navigate("/appinsurance/MainArea/Client/ClientCreationForm")
        }
      >
        <FaPlus className="btn-icon" />
        Create
      </button>

      <button className="btn btn-archive">
        <FaArchive className="btn-icon" /> View Archive
      </button>
    
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

            <div className="Client-content">
                

           <div className="Agents">
           <div className="agent-header">
           <FaUser className="agent-icon" />
             <h3>Sales Agent 1</h3>
            </div>
          <p>Total Client : ??</p>
          <button className="view-all-client-button">View All</button>
          </div>

        <div className="Agents">
       <div className="agent-header">
       <FaUser className="agent-icon" />
        <h3>Sales Agent 2</h3>
       </div>
       <p>Total Client : ??</p>
      <button className="view-all-client-button">View All</button>
      </div>

     <div className="Agents">
    <div className="agent-header">
      <FaUser className="agent-icon" />
      <h3>Sales Agent 3</h3>
    </div>
    <p>Total Client : ??</p>
    <button className="view-all-client-button">View All</button>
   </div>
            </div>

            <div className="client-table-container"> 
                <ClientTable/>
            </div>
        </div>
    );
}

