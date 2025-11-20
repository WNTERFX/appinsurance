import "./styles/main_area-styles.css";
import NavBar from "./NavBar";
import "./styles/policy-styles.css";
import "./styles/dashboard-styles.css";
import "./styles/client-styles.css";
import "./styles/due-styles.css";
import SessionMonitor from "../ReusableComponents/SessionMonitor";

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export default function MainArea({ setSession }) {
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

  return (
    <div className="main-area">
      <SessionMonitor />
      <div className="nav-area">
        <NavBar setSession={setSession} />
      </div>
      <div className="content-area">
        <div className="content-wrapper" style={{ zoom: scale }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
