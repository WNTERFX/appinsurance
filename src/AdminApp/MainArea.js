import "./styles/main_area-styles.css";
import NavBar from "./NavBar";
import "./styles/policy-styles.css"
import "./styles/dashboard-styles.css"
import "./styles/client-styles.css"
import "./styles/due-styles.css"
import SessionMonitor from "../ReusableComponents/SessionMonitor";

import { useState, useEffect } from "react";
import { Outlet } from 'react-router-dom';

export default function MainArea() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [scale, setScale] = useState(1);
  
  const handleMinimizeChange = (newMinimizedState) => {
    setIsMinimized(newMinimizedState);
  };
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1440) {
        setScale(0.8);   // scale down on smaller screens
      } else {
        setScale(1);     // full size on larger screens
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize(); // run once on mount
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  return (
    <div className="main-area">
       <SessionMonitor />
      <div className={`nav-area ${isMinimized ? "minimized" : ""}`}>
        <NavBar onMinimizeChange={handleMinimizeChange} />
      </div>
      <div className={`content-area ${isMinimized ? "minimized" : ""}`}>
        <div
          className="content-wrapper"
          style={{ 
            zoom: scale,  
          }}
        >
          <Outlet />
         
        </div>
         
      </div>
      
    </div>
  );
}