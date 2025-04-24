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
        {isMinimize ? <LuLayoutDashboard /> : "Dashboard"}
      </Link>

      <Link to="/appinsurance/MainArea/Client" className="side-bar-item">
        {isMinimize ? <LuUser /> : "Clients"}  
      </Link>

      <Link to="/appinsurance/MainArea/Due" className="side-bar-item">
        {isMinimize ? <LuCalendarArrowUp /> : "Due"}  
      </Link>

      <Link to="/appinsurance/MainArea/Policy" className="side-bar-item">
        {isMinimize ? <LuFolder /> : "Policy"}  
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