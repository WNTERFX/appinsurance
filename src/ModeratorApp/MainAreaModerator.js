import './moderator-styles/main-area-moderator-styles.css';
import NavBarModerator from "./NavBarModerator";
import React, { useEffect, useState } from "react";

import { Outlet } from 'react-router-dom';

export default function MainAreaModerator() 
{

    const [isMinimized, setIsMinimized] = useState(false);

    const handleMinimizeChange = (newMinimizedState) => {
      setIsMinimized(newMinimizedState);
    };  

    return (
        <div className="main-area-moderator">
            <div className="nav-area-moderator" > 
                <NavBarModerator onMinimizeChange={handleMinimizeChange} /> 
            </div>
            <div className="content-area-moderator" style={{ marginLeft: isMinimized ? "-130px" : "20px" }}>
                <Outlet/>
            </div>
        </div>
    );
}