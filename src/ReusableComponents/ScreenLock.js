import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ScreenLock({ message }) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade-in on mount
    const timeout = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(timeout);
  }, []);

  const handleClick = () => {
    localStorage.clear();
    navigate("/appinsurance");
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        fontFamily: "'Montserrat', sans-serif",
        fontSize: "1.5rem",
        fontWeight: "bold",
        color: "#fff",
        cursor: "pointer",

        // Semi-transparent background is required for backdrop-filter
        backgroundColor: visible
          ? "rgba(0, 0, 0, 0.35)"
          : "rgba(0, 0, 0, 0)",

        // Blur effect
        backdropFilter: visible ? "blur(8px)" : "blur(0px)",
        WebkitBackdropFilter: visible ? "blur(8px)" : "blur(0px)",

        // Smooth fade-in
        transition:
          "background-color 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease",
        padding: "0 20px",
      }}
    >
      {message || "You have been logged out. Click anywhere to go to login."}
    </div>
  );
}
