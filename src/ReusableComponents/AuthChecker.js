import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { db } from "../dbServer";
import ScreenLock from "./ScreenLock";
import GlobalAlert, { showGlobalAlert } from "./GlobalAlert";

export default function AuthChecker() {
  const IDLE_TIMEOUT = 15 * 60 * 1000; // 30 seconds for testing (change back to 15 * 60 * 1000 for production)
  const WARNING_TIME = 60 * 1000; // 10 seconds warning for testing (change back to 60 * 1000 for production)
  const idleTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");

  useEffect(() => {
    const lockScreen = (message, showAlert = false, alertMessage = null) => {
      clearTimeout(idleTimeout.current);
      clearTimeout(warningTimeout.current);
      setLockMessage(message);
      setLocked(true);
      
      // Show alert at the same time as the lock screen
      if (showAlert) {
        showGlobalAlert(alertMessage || message);
      }
    };

    const verifySession = async () => {
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("session_token");
      if (!userId || !token) {
        return lockScreen("You have been logged out due to inactivity.");
      }
      try {
        const { data, error } = await db
          .from("employee_Accounts")
          .select("current_session_token")
          .eq("id", userId)
          .single();
       
        if (error || !data?.current_session_token || data.current_session_token !== token) {
          return lockScreen(
            "Another login has been detected. Click anywhere to go to login.",
            true,
            "Another login has been detected."
          );
        }
      } catch (err) {
        console.error(err);
        lockScreen("An error occurred. Click anywhere to go to login.");
      }
    };

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout.current);
      clearTimeout(warningTimeout.current);
     
      warningTimeout.current = setTimeout(() => {
        showGlobalAlert("You will be logged out in 60 seconds due to inactivity.");
      }, IDLE_TIMEOUT - WARNING_TIME);
     
      idleTimeout.current = setTimeout(() => {
        lockScreen("You have been logged out due to inactivity.");
      }, IDLE_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    resetIdleTimer();
    verifySession();
    const interval = setInterval(verifySession, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(idleTimeout.current);
      clearTimeout(warningTimeout.current);
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
    };
  }, []);

  return (
    <>
      {/* GlobalAlert must be rendered for showGlobalAlert() to work */}
      <GlobalAlert />
      {/* Always render Outlet so there's content to blur */}
      <Outlet />
      {/* Render ScreenLock on top when locked */}
      {locked && <ScreenLock message={lockMessage} />}
    </>
  );
}