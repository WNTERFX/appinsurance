
import ClientTableModerator from "./ClientTableModerator";
import './moderator-styles/client-styles-moderator.css';
import React, { useState, useRef, useEffect } from "react";

import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import  DropdownAccountsModerator  from './DropDownAccountsModerator';
import { FaPlus, FaArchive, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function ClientModerator() {
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
        <div className="Client-container-moderator">
           
            <div className="Client-header-moderator">
               {/* Left side: title + search */}
             <div className="right-actions-moderator">
             <p className="client-title-moderator">Client</p>
           <input
           type="text"
           className="client-search-moderator"
           placeholder="Search clients..."
          />
        </div>

  {/* Right side: create + archive + profile */}
    <div className="left-actions-moderator">
      <button
        className="btn btn-create-moderator" 
        onClick={() =>
                navigate("/appinsurance/MainAreaModerator/ClientModerator/ModeratorClientCreationForm")
              }
        >
        <FaPlus className="btn-icon-moderator" />
        Create
      </button>

      <button className="btn btn-archive-moderator">
        <FaArchive className="btn-icon-moderator" /> View Archive
      </button>
    
      <div className="profile-menu-moderator">
        <button
          ref={buttonRef}
          className="profile-button-moderator"
          onClick={() => setOpen((s) => !s)}
          aria-haspopup="true"
          aria-expanded={open}
        >
            <span className="profile-name-moderator">Agent:?</span>
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


           
            <div className="Client-content-moderator">
                
                <div className="Agents-moderator">
                    Lily bon                    
                        <p>Total Client</p>
                        <p>Client_Count</p>
                </div>
              
             
            </div>

            <div className="client-table-container-moderator "> 
                <ClientTableModerator />
            </div>
        </div>
    );
}