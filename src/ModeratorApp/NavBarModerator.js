import "./moderator-styles/nav-moderator-styles.css"

import { Link, useLocation } from 'react-router-dom';
import React, { useState } from "react";

import "./images/logo_.png"

import { LuLayoutDashboard, LuUser, LuClipboard, LuMail, LuFolder, LuCreditCard, LuSettings, LuActivity, LuInfo } from "react-icons/lu";



export default function NavBarModerator() {

  const location = useLocation();
  const isActive = (path) => location.pathname === path;


   return (
  <div className="nav-bar-moderator">
    <div className="logo-container-moderator">
          <img className="nav-logo-img-moderator" src={require("./images/logo_.png")} alt="silverstar_insurance_inc_Logo" />
        <h1 className="logo-moderator">Silverstar Insurance</h1>
    </div>

      {/* Divider line */}
      <hr className="nav-divider-moderator" />

    <div className="side-bar-container-moderator">
      {/* --- TOP LINKS --- */}
      <div className="side-bar moderator-top-links">
        <Link to="/appinsurance/MainAreaModerator/DashboardModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/DashboardModerator") ? " active" : "")}>
            <div className="side-bar-label-moderator">
              <LuLayoutDashboard className="side-bar-icon-moderator" />
              <span>Dashboard</span>
            </div>
        </Link>

        <Link to="/appinsurance/MainAreaModerator/ClientModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/ClientModerator") ? " active" : "")}>
            <div className="side-bar-label-moderator">
              <LuUser className="side-bar-icon-moderator" />
              <span>Clients</span>
            </div>
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
            <div className="side-bar-label-moderator">
              <LuFolder className="side-bar-icon-moderator" />
              <span>Policy</span>
            </div>
        </Link>

        <Link to="/appinsurance/MainAreaModerator/ClaimTableModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/ClaimTableModerator") ? " active" : "")}>
            <div className="side-bar-label-moderator">
              <LuClipboard className="sside-bar-icon-moderator" />
              <span>Claims</span>
            </div>
        </Link>

      <Link to="/appinsurance/MainAreaModerator/DeliveryModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/DeliveryTableModerator") ? " active" : "")}>
          <div className="side-bar-label-moderator">
            <LuMail  className="side-bar-icon-moderator" />
            <span>Deliveries</span>
          </div>
      </Link>  


       <Link to="/appinsurance/MainAreaModerator/MonthlyDataModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/MonthlyDataModerator") ? " active" : "")}>
            <div className="side-bar-label-moderator">
              <LuActivity className="side-bar-icon-moderator" />
              <span>Reports</span>
            </div>
        </Link>

        <Link to="/appinsurance/MainAreaModerator/PaymentRecordsModerator" className={"side-bar-item-moderator " + (isActive("/appinsurance/MainAreaModerator/PaymentRecordsModerator") ? " active" : "")}>
            <div className="side-bar-label-moderator">
              <LuCreditCard className="side-bar-icon-moderator " />
              <span>Payments</span>
            </div>
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
            <div className="side-bar-label-moderator">
              <LuSettings className="side-bar-icon-moderator" />
              <span>Manage Users</span>
            </div>
        </Link>
      
    </div>

      {/* --- BOTTOM LINKS --- */}
      <div className="side-bar moderator-bottom-links">
        <Link to="/appinsurance/MainAreaModerator/ProfileModerator" className="side-bar-item">
            <div className="side-bar-label-moderator">
              <LuInfo  className="side-bar-icon-moderator" />
              <span className="side-bar-name-moderator">About</span>
            </div>
        </Link>
      </div>
    </div>
  </div>
  );
}