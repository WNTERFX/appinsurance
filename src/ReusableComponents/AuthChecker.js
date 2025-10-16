import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { db } from "../dbServer";
import ScreenLock from "./ScreenLock";
import GlobalAlert, { showGlobalAlert } from "./GlobalAlert";

export default function AuthChecker() {
  const IDLE_TIMEOUT = 15 * 60 * 1000;
  const WARNING_TIME = 60 * 1000;
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
     
      if (showAlert) {
        showGlobalAlert(alertMessage || message);
      }
    };

    const verifySession = async () => {
      // Get current Supabase session
      const { data: { session }, error: sessionError } = await db.auth.getSession();
      
      if (sessionError || !session) {
        return lockScreen("You have been logged out due to inactivity.");
      }

      const userId = session.user.id;
      
      try {
        const { data, error } = await db
          .from("employee_Accounts")
          .select("current_session_token")
          .eq("id", userId)
          .single();
       
        // Compare with actual Supabase session token
        if (error || !data?.current_session_token || data.current_session_token !== session.access_token) {
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
      <GlobalAlert />
      <Outlet />
      {locked && <ScreenLock message={lockMessage} />}
    </>
  );
}