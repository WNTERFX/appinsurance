import './moderator-styles/main-area-moderator-styles.css';
import NavBarModerator from "./NavBarModerator";
import React, { useEffect, useState } from "react";

import { Outlet } from 'react-router-dom';

export default function MainAreaModerator() {
      const [scale, setScale] = useState(1);

        useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1440) {
        setScale(0.8);
      } else {
        setScale(1);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);


    const [isMinimized, setIsMinimized] = useState(false);


  return (
    <div className="main-area-moderator">
      <div className="nav-area-moderator">
        <NavBarModerator />
      </div>
      <div className="content-area-moderator">
        <div className="content-area-wrapper-moderator" style={{ zoom: scale }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}