import "./styles/nav-styles.css"
import {Menu} from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState } from "react";
import { LuLayoutDashboard } from "react-icons/lu";
import { LuUser } from "react-icons/lu";
import { LuCalendarArrowUp } from "react-icons/lu";
import { LuFolder } from "react-icons/lu";

export default function NavBar( {onMinimizeChange}) {

  const [isMinimize, setIsMinimize] = useState(false);

  const handleMinimize = () => {
    setIsMinimize((prev) => {
      const newState = !prev;
      onMinimizeChange(newState); 
      return newState;
    });
  };

  return (
    <div className={`nav-bar ${isMinimize ? "minimize" : ""}`}>
      <div className="logo-bar">
        <button className="nav-bar-button" onClick={handleMinimize}> 
        <Menu className="nav-bar-icon" size={30} color="black" />
        </button>
       {!isMinimize && <h1 className="logo">Silverstar Insurance</h1>}       

    </div>
    <div className="side-bar">
      
      <Link to="/appinsurance/MainArea/Dashboard" className="side-bar-item">
       {isMinimize ? (
         <LuLayoutDashboard />
        ) : (
          <div className="side-bar-label">
            <LuLayoutDashboard className="side-bar-icon" />
            <span>Dashboard</span>
          </div>
        )}
      </Link>

      <Link to="/appinsurance/MainArea/Client" className="side-bar-item">
        {isMinimize ? (
          <LuUser /> 
        ) : ( 
          <div className="side-bar-label">
            <LuUser className="side-bar-icon" />
            <span>Clients</span>
          </div>
        )}   
      </Link>

      <Link to="/appinsurance/MainArea/Due" className="side-bar-item">
        {isMinimize ? (
          <LuCalendarArrowUp />
        ) : (
          <div className="side-bar-label">
            <LuCalendarArrowUp className="side-bar-icon" />
            <span>Due</span>
         </div>
        )}   
      </Link>

      <Link to="/appinsurance/MainArea/Policy" className="side-bar-item">
        {isMinimize ? (
          <LuFolder /> 
        ) : ( 
          <div className="side-bar-label">
            <LuFolder className="side-bar-icon" />
            <span>Policy</span>
          </div>
        )}  
      </Link>

      <Link to="#" className="side-bar-item">
        {isMinimize ? "M" : "Monthly Data"}  
      </Link> 

      <Link to="/appinsurance" className="side-bar-item">
        {isMinimize ? "L" : "Login"}  
      </Link>
      
    </div>
  </div>
  );
}