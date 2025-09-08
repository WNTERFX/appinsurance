import "./styles/nav-styles.css";

import { useState } from "react";

import {Menu} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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



export default function NavBar( {onMinimizeChange}) {

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
  <div className={`nav-bar ${isMinimize ? "minimize" : ""}`}>
    <div className="logo-bar">
      <button className="nav-bar-button" onClick={handleMinimize}> 
        <Menu className="nav-bar-icon" size={30} color="black" />
      </button>
      {!isMinimize && <h1 className="logo">Silverstar Insurance</h1>}   
    </div>

    {/* Sidebar container (full height flex) */}
    <div className="side-bar-container">
      
      {/* --- TOP LINKS --- */}
      <div className="side-bar top-links">
        <Link to="/appinsurance/MainArea/Dashboard" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Dashboard") ? " active" : "")}>
          {isMinimize ? <LuLayoutDashboard /> : (
            <div className="side-bar-label">
              <LuLayoutDashboard className="side-bar-icon" />
              <span className="side-bar-name">Dashboard</span>
            </div>
          )}
        </Link>

        <Link to="/appinsurance/MainArea/Client" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Client") ? " active" : "")}>
          {isMinimize ? <LuUser /> : (
            <div className="side-bar-label">
              <LuUser className="side-bar-icon" />
              <span>Clients</span>
            </div>
          )}
        </Link>


      {/*<Link to="/appinsurance/MainArea/Due" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Due") ? " active" : "")}>
        {isMinimize ? (
          <LuCalendarArrowUp />
        ) : (
          <div className="side-bar-label">
            <LuCalendarArrowUp className="side-bar-icon" />
            <span>Due</span>
         </div>
        )}   
      </Link>*/}
      
       <Link to="/appinsurance/MainArea/Policy" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Policy") ? " active" : "")}>
          {isMinimize ? <LuFolder /> : (
            <div className="side-bar-label">
              <LuFolder className="side-bar-icon" />
              <span>Policy</span>
            </div>
          )}
        </Link>

        <Link to="/appinsurance/MainArea/ClaimTable" className={"side-bar-item" + (isActive("/appinsurance/MainArea/ClaimTable") ? " active" : "")}>
          {isMinimize ? <LuClipboard /> : (
            <div className="side-bar-label">
              <LuClipboard className="side-bar-icon" />
              <span>Claims</span>
            </div>
          )}
        </Link>

      <Link to="/appinsurance/MainArea/DeliveryTable" className={"side-bar-item" + (isActive("/appinsurance/MainArea/DeliveryTable") ? " active" : "")}>
        {isMinimize ? <LuMail /> : (
          <div className="side-bar-label">
            <LuMail  className="side-bar-icon" />
            <span>Deliveries</span>
          </div>
        )}
      </Link>  


       <Link to="/appinsurance/MainArea/MonthlyData" className={"side-bar-item" + (isActive("/appinsurance/MainArea/MonthlyData") ? " active" : "")}>
          {isMinimize ? <LuActivity /> : (
            <div className="side-bar-label">
              <LuActivity className="side-bar-icon" />
              <span>Reports</span>
            </div>
          )}
        </Link>

        <Link to="/appinsurance/MainArea/PaymentRecords" className={"side-bar-item" + (isActive("/appinsurance/MainArea/PaymentRecords") ? " active" : "")}>
          {isMinimize ? <LuCreditCard /> : (
            <div className="side-bar-label">
              <LuCreditCard className="side-bar-icon" />
              <span>Payments</span>
            </div>
          )}
        </Link>

      {/*<Link to="/appinsurance/MainArea/Profile" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Profile") ? " active" : "")}>
        {isMinimize ? (
         <LuSettings />
        ) : (
          <div className="side-bar-label">
            <LuSettings className="side-bar-icon" />
            <span className="side-bar-name" >Profile</span>
          </div>
        )}
      </Link>
         */}
      
      <Link to="/appinsurance/MainArea/Profile" className={"side-bar-item" + (isActive("/appinsurance/MainArea/Profile") ? " active" : "")}>
          {isMinimize ? <LuSettings /> : (
            <div className="side-bar-label">
              <LuSettings className="side-bar-icon" />
              <span>Manage Users</span>
            </div>
          )}
        </Link>
      
    </div>

      {/* --- BOTTOM LINKS --- */}
      <div className="side-bar bottom-links">
        <Link to="/appinsurance/MainArea/Profile" className="side-bar-item">
          {isMinimize ? <LuInfo  /> : (
            <div className="side-bar-label">
              <LuInfo  className="side-bar-icon" />
              <span className="side-bar-name">About</span>
            </div>
          )}
        </Link>
      </div>
    </div>
  </div>
  );
}
