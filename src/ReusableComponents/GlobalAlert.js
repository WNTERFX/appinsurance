import React, { useState, useEffect } from "react";

// Global setter to trigger alert from anywhere
let globalAlertSetter = null;
export function showGlobalAlert(message) {
  if (globalAlertSetter) {
    globalAlertSetter(message);
  }
}

export default function GlobalAlert() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
   globalAlertSetter = (msg) => {
        setMessage(msg);           // show message in DOM
        setVisible(true);          // fade in

        setTimeout(() => setVisible(false), 3000); // fade out after 2s
        setTimeout(() => setMessage(""), 3500);    // remove message from DOM
        };

    return () => {
      globalAlertSetter = null;
    };
  }, []);

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
    textAlign: "center",
    padding: "12px 0",
    fontWeight: "bold",
    zIndex: 9999,
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        opacity: visible ? 1 : 0,         // <-- important
    pointerEvents: "none",

  }}
>
  {message}
</div>

  );
}
