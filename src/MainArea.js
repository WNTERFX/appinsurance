
import "./styles/main_area-styles.css";
import NavBar from "./NavBar";
import "./styles/policy-styles.css"
import "./styles/dashboard-styles.css"
import "./styles/client-styles.css"
import "./styles/due-styles.css"
import React, { useState } from "react";
import { Outlet } from 'react-router-dom';

export default function MainArea() 
{

    const [isMinimized, setIsMinimized] = useState(false);

    const handleMinimizeChange = (newMinimizedState) => {
      setIsMinimized(newMinimizedState);
    };  

    return (
        <div className="main-area">
            <div className="nav-area" > 
                <NavBar onMinimizeChange={handleMinimizeChange} /> 
            </div>
            <div className="content-area" style={{ marginLeft: isMinimized ? "-130px" : "20px" }}>
                <Outlet/>
            </div>
        </div>
    );
}