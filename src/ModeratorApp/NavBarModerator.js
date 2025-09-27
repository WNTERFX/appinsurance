import "./moderator-styles/nav-moderator-styles.css"

import { Link, useLocation } from 'react-router-dom';
import React, { useState } from "react";

import {Menu} from 'lucide-react';
import { LuLayoutDashboard } from "react-icons/lu";
import { LuUser } from "react-icons/lu";
import { LuCalendarArrowUp } from "react-icons/lu";
import { LuClipboard } from "react-icons/lu";
import { LuMail } from "react-icons/lu";
import { LuFolder } from "react-icons/lu";
import { LuCreditCard } from "react-icons/lu";
import { LuSettings } from "react-icons/lu";
import { LuActivity } from "react-icons/lu";
import { LuInfo } from "react-icons/lu";



export default function NavBarModerator( {onMinimizeChange}) {

  const [isMinimize, setIsMinimize] = useState(false);

  const handleMinimize = () => {
    setIsMinimize((prev) => {
      const newState = !prev;
      onMinimizeChange(newState); 
      return newState;
    });
  };

  const location = useLocation();

  const isActive = (path) => location.pathname === path;


   return (
  <div className={`nav-bar-moderator ${isMinimize ? "minimize" : ""}`}>
    <div className="logo-bar-moderator">
      <button className="nav-bar-button-moderator" onClick={handleMinimize}> 
        <Menu className="nav-bar-icon-moderator" size={30} color="black" />
      </button>
      {!isMinimize && <h1 className="logo">Silverstar Insurance</h1>}   
    </div>

    {/* Sidebar container (full height flex) */}
    <div className="side-bar-moderator-container">
      
      {/* --- TOP LINKS --- */}
      <div className="side-bar moderator-top-links">

        <Link to="/appinsurance/MainAreaModerator/DashboardModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/DashboardModerator") ? " active" : "")}>
          {isMinimize ? <LuLayoutDashboard /> : (
            <div className="side-bar-label-moderator">
              <LuLayoutDashboard className="side-bar-icon-moderator" />
              <span className="side-bar-name-moderator">Dashboard</span>
            </div>
          )}
        </Link>

        <Link to="/appinsurance/MainAreaModerator/ClientModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/ClientModerator") ? " active" : "")}>
          {isMinimize ? <LuUser /> : (
            <div className="side-bar-label-moderator">
              <LuUser className="side-bar-icon-moderator" />
              <span>Clients</span>
            </div>
          )}
        </Link>


      {/*<Link to="/appinsurance/MainAreaModerator/DueModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/DueModerator") ? " active" : "")}>
        {isMinimize ? (
          <LuCalendarArrowUp />
        ) : (
          <div className="side-bar-label-moderator">
            <LuCalendarArrowUp className="side-bar-icon-moderator" />
            <span>Due</span>
         </div>
        )}   
      </Link>*/}
      
       <Link to="/appinsurance/MainAreaModerator/PolicyModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/PolicyModerator") ? " active" : "")}>
          {isMinimize ? <LuFolder /> : (
            <div className="side-bar-label-moderator">
              <LuFolder className="side-bar-icon-moderator" />
              <span>Policy</span>
            </div>
          )}
        </Link>

        <Link to="/appinsurance/MainAreaModerator/ClaimTableModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/ClaimTableModerator") ? " active" : "")}>
          {isMinimize ? <LuClipboard /> : (
            <div className="side-bar-label-moderator">
              <LuClipboard className="sside-bar-icon-moderator" />
              <span>Claims</span>
            </div>
          )}
        </Link>

      <Link to="/appinsurance/MainAreaModerator/DeliveryModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/DeliveryTableModerator") ? " active" : "")}>
        {isMinimize ? <LuMail /> : (
          <div className="side-bar-label-moderator">
            <LuMail  className="side-bar-icon-moderator" />
            <span>Deliveries</span>
          </div>
        )}
      </Link>  


       <Link to="/appinsurance/MainAreaModerator/MonthlyDataModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/MonthlyDataModerator") ? " active" : "")}>
          {isMinimize ? <LuActivity /> : (
            <div className="side-bar-label-moderator">
              <LuActivity className="side-bar-icon-moderator" />
              <span>Reports</span>
            </div>
          )}
        </Link>

        <Link to="/appinsurance/MainAreaModerator/PaymentRecordsModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/PaymentRecordsModerator") ? " active" : "")}>
          {isMinimize ? <LuCreditCard /> : (
            <div className="side-bar-label-moderator">
              <LuCreditCard className="side-bar-icon-moderator " />
              <span>Payments</span>
            </div>
          )}
        </Link>

      {/*<Link to="/appinsurance/MainAreaModerator/ProfileModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/ProfileModerator") ? " active" : "")}>
        {isMinimize ? (
         <LuSettings />
        ) : (
          <div className="side-bar-label-moderator">
            <LuSettings className="side-bar-icon-moderator" />
            <span>Profile</span>
          </div>
        )}
      </Link>
         */}
      
      <Link to="/appinsurance/MainAreaModerator/ProfileModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/ProfileModerator") ? " active" : "")}>

          {isMinimize ? <LuSettings /> : (
            <div className="side-bar-label-moderator">
              <LuSettings className="side-bar-icon-moderator" />
              <span>Manage Users</span>
            </div>
          )}
        </Link>
      
    </div>

      {/* --- BOTTOM LINKS --- */}
      <div className="side-bar moderator-bottom-links">
        <Link to="/appinsurance/MainAreaModerator/ProfileModerator" className="side-bar-item">
          {isMinimize ? <LuInfo  /> : (
            <div className="side-bar-label-moderator">
              <LuInfo  className="side-bar-icon-moderator" />
              <span className="side-bar-name-moderator">About</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  </div>
  );
}