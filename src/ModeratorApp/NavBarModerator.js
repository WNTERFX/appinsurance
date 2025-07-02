import "./moderator-styles/nav-moderator-styles.css"
import {Menu} from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { LuUser } from "react-icons/lu";
import { LuCalendarArrowUp } from "react-icons/lu";
import { LuClipboard } from "react-icons/lu";
import { LuMail } from "react-icons/lu";
import { LuFolder } from "react-icons/lu";
import { LuCreditCard } from "react-icons/lu";
import { LuSettings } from "react-icons/lu";
import { LuActivity } from "react-icons/lu";



export default function NavBarModerator( {onMinimizeChange}) {

  const [isMinimize, setIsMinimize] = useState(false);

  const handleMinimize = () => {
    setIsMinimize((prev) => {
      const newState = !prev;
      onMinimizeChange(newState); 
      return newState;
    });
  };

  return (
    <div className={`nav-bar-moderator  ${isMinimize ? "minimize" : ""}`}>
      <div className="logo-bar-moderator ">
        <button className="nav-bar-button-moderator " onClick={handleMinimize}> 
        <Menu className="nav-bar-icon-moderator " size={30} color="black" />
        </button>
       {!isMinimize && <h1 className="logo">Silverstar Insurance</h1>}       

    </div>
    <div className="side-bar-moderator ">
      <Link to="/appinsurance/MainAreaModerator/DashboardModerator" className="side-bar-item-moderator ">
       {isMinimize ? (
         <LuLayoutDashboard />
        ) : (
          <div className="side-bar-label-moderator ">
            <LuLayoutDashboard className="side-bar-icon-moderator " />
            <span className="side-bar-name-moderator " >Dashboard</span>
          </div>
        )}
      </Link>

      <Link to="/appinsurance/MainAreaModerator/ClientModerator" className="side-bar-item-moderator ">
        {isMinimize ? (
          <LuUser /> 
        ) : ( 
          <div className="side-bar-label-moderator ">
            <LuUser className="side-bar-icon-moderator " />
            <span>Clients</span>
          </div>
        )}   
      </Link>

      <Link to="/appinsurance/MainAreaModerator/DueModerator" className="side-bar-item-moderator ">
        {isMinimize ? (
          <LuCalendarArrowUp />
        ) : (
          <div className="side-bar-label-moderator ">
            <LuCalendarArrowUp className="side-bar-icon-moderator " />
            <span>Due</span>
         </div>
        )}   
      </Link>
      
      <Link to="/appinsurance/MainAreaModerator/PolicyModerator" className="side-bar-item-moderator ">
        {isMinimize ? (
          <LuFolder /> 
        ) : ( 
          <div className="side-bar-label-moderator ">
            <LuFolder className="side-bar-icon-moderator " />
            <span>Policy</span>
          </div>
        )}  
      </Link>

      <Link to="/appinsurance/MainAreaModerator/ClaimTableModerator" className="side-bar-item-moderator ">
        {isMinimize ? (
         <LuClipboard />
        ) : (
          <div className="side-bar-label">
            <LuClipboard   className="side-bar-icon-moderator " />
            <span className="side-bar-name-moderator ">Claims</span>
          </div>
        )}
      </Link>

      <Link to="/appinsurance/MainAreaModerator/DeliveryTableModerator" className="side-bar-item-moderator ">
        {isMinimize ? (
         <LuMail />
        ) : (
          <div className="side-bar-label-moderator ">
            <LuMail   className="side-bar-icon-moderator " />
            <span className="side-bar-name-moderator ">Deliveries</span>
          </div>
        )}
      </Link>


      <Link to="/appinsurance/MainAreaModerator/MonthlyDataModerator" className="side-bar-item-moderator ">
      {isMinimize ? (
         <LuActivity />
        ) : (
          <div className="side-bar-label-moderator ">
            <LuActivity className="side-bar-icon-moderator " />
            <span className="side-bar-name-moderator " >Monthly Data</span>
          </div>
        )}  
      </Link> 

      
      <Link to="/appinsurance/MainAreaModerator/PaymentRecordsModerator"className="side-bar-item-moderator ">
      {isMinimize ? (
         <LuCreditCard />
        ) : (
          <div className="side-bar-label-moderator ">
            <LuCreditCard className="side-bar-icon-moderator " />
            <span className="side-bar-name-moderator " >Records</span>
          </div>
        )}  
      </Link> 

      <Link to="/appinsurance/MainAreaModerator/ProfileModerator" className="side-bar-item-moderator ">
        {isMinimize ? (
         <LuSettings />
        ) : (
          <div className="side-bar-label-moderator ">
            <LuSettings className="side-bar-icon-moderator " />
            <span className="side-bar-name-moderator " >Profile</span>
          </div>
        )}
      </Link>
      
    </div>
  </div>
  );
}