import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  
  // Track the last known valid token to detect actual token changes
  const lastValidToken = useRef(null);

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
        navigate("/", { replace: true });
        return;
      }

      const userId = session.user.id;
      const currentToken = session.access_token;
      
      try {
        const { data, error } = await db
          .from("employee_Accounts")
          .select("current_session_token")
          .eq("id", userId)
          .single();
       
        if (error) {
          console.error("Database error:", error);
          return; // Don't lock on database errors
        }

        const dbToken = data?.current_session_token;

        // FIRST TIME: Initialize the last valid token
        if (lastValidToken.current === null) {
          lastValidToken.current = currentToken;
          
          // If tokens don't match on first check, update DB with current token
          if (dbToken !== currentToken) {
            await db
              .from("employee_Accounts")
              .update({ current_session_token: currentToken })
              .eq("id", userId);
          }
          return;
        }

        // Check if OUR current token has changed (Supabase auto-refreshed it)
        const ourTokenChanged = currentToken !== lastValidToken.current;
        
        if (ourTokenChanged) {
          // Our token refreshed - update the database
          lastValidToken.current = currentToken;
          await db
            .from("employee_Accounts")
            .update({ current_session_token: currentToken })
            .eq("id", userId);
          console.log("Session token refreshed and updated in database");
          return;
        }

        // Check if someone else logged in (DB token differs from our current token)
        if (dbToken && dbToken !== currentToken) {
          return lockScreen(
            "Another login has been detected. Click anywhere to go to login.",
            true,
            "Another login has been detected."
          );
        }

        // Check if token was cleared (logout from another device)
        if (!dbToken) {
          return lockScreen(
            "Session has been invalidated. Click anywhere to go to login.",
            true,
            "Your session has been logged out."
          );
        }

      } catch (err) {
        console.error("Session verification error:", err);
        // Don't lock on catch errors - might be network issues
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
  }, [navigate]);

  return (
    <>
      <GlobalAlert />
      <Outlet />
      {locked && <ScreenLock message={lockMessage} />}
    </>
  );
}