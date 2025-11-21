import React, { useState, useEffect } from "react";

// Global setter to trigger alert from anywhere
let globalAlertSetter = null;

export function showGlobalAlert(message, blocking = false) {
  console.log("showGlobalAlert called with:", message); // Debug
  if (globalAlertSetter) {
    globalAlertSetter(message, blocking);
  } else {
    console.log("globalAlertSetter not set yet!"); // Debug
  }
}

export default function GlobalAlert() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);
  const [blocking, setBlocking] = useState(false);

  console.log("GlobalAlert render:", { message, visible }); // Debug

  useEffect(() => {
    console.log("Setting up globalAlertSetter"); // Debug
    globalAlertSetter = (msg, isBlocking = false) => {
      console.log("globalAlertSetter invoked:", msg); // Debug
      setMessage(msg);
      setVisible(true);
      setBlocking(isBlocking);
    };

    return () => {
      globalAlertSetter = null;
    };
  }, []);

  useEffect(() => {
    // Don't auto-hide if blocking
    if (!visible || blocking) return;

    const hideAlert = () => {
      setVisible(false);
      setTimeout(() => setMessage(""), 300);
    };

    const timerId = setTimeout(() => {
      window.addEventListener("mousedown", hideAlert);
      window.addEventListener("keydown", hideAlert);
      window.addEventListener("touchstart", hideAlert);
    }, 100);

    return () => {
      clearTimeout(timerId);
      window.removeEventListener("mousedown", hideAlert);
      window.removeEventListener("keydown", hideAlert);
      window.removeEventListener("touchstart", hideAlert);
    };
  }, [visible, blocking]);

  console.log("Rendering alert, message:", message, "visible:", visible); // Debug

  if (!message) return null;

  return (
    <>
      {/* Backdrop blur overlay for blocking alerts */}
      {blocking && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)", // Safari support
            zIndex: 9999,
            opacity: visible ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      )}

      {/* Alert banner */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          backgroundColor: "#ffcc00",
          color: "#000",
          fontFamily: "'Montserrat', sans-serif",
          textAlign: "center",
          padding: "12px 0",
          fontWeight: "bold",
          zIndex: 10000,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          opacity: visible ? 1 : 0,
          pointerEvents: blocking ? "auto" : "none",
          transition: "opacity 0.3s ease-in-out",
        }}
      >
        {message}
      </div>
    </>
  );
}