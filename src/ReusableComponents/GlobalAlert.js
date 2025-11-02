import React, { useState, useEffect } from "react";

// Global setter to trigger alert from anywhere
let globalAlertSetter = null;

export function showGlobalAlert(message) {
  console.log("showGlobalAlert called with:", message); // Debug
  if (globalAlertSetter) {
    globalAlertSetter(message);
  } else {
    console.log("globalAlertSetter not set yet!"); // Debug
  }
}

export default function GlobalAlert() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  console.log("GlobalAlert render:", { message, visible }); // Debug

  useEffect(() => {
    console.log("Setting up globalAlertSetter"); // Debug
    globalAlertSetter = (msg) => {
      console.log("globalAlertSetter invoked:", msg); // Debug
      setMessage(msg);
      setVisible(true);
    };

    return () => {
      globalAlertSetter = null;
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

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
  }, [visible]);

  console.log("Rendering alert, message:", message, "visible:", visible); // Debug

  if (!message) return null;

  return (
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
        pointerEvents: "none",
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      {message}
    </div>
  );
}