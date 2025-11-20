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
    // Check if user has a saved session on mount
    const checkInitialSession = async () => {
      const savedSession = localStorage.getItem("user_session") || 
                           sessionStorage.getItem("user_session");
      
      if (!savedSession) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const sessionData = JSON.parse(savedSession);
        
        // Verify the saved session is still valid with Supabase
        const { data: { session }, error: sessionError } = await db.auth.getSession();
        
        if (sessionError || !session) {
          // Session expired or invalid - clear storage and redirect
          localStorage.removeItem("user_session");
          sessionStorage.removeItem("user_session");
          navigate("/", { replace: true });
          return;
        }
        
        // If tokens don't match, update the saved session
        if (session.access_token !== sessionData.accessToken) {
          const updatedSession = {
            ...sessionData,
            accessToken: session.access_token
          };
          
          // Update in the same storage that was used
          if (localStorage.getItem("user_session")) {
            localStorage.setItem("user_session", JSON.stringify(updatedSession));
          } else {
            sessionStorage.setItem("user_session", JSON.stringify(updatedSession));
          }
        }
      } catch (error) {
        console.error("Failed to parse saved session:", error);
        localStorage.removeItem("user_session");
        sessionStorage.removeItem("user_session");
        navigate("/", { replace: true });
      }
    };

    checkInitialSession();

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
        // Clear both storages and redirect
        localStorage.removeItem("user_session");
        sessionStorage.removeItem("user_session");
        navigate("/", { replace: true });
        return;
      }

      const userId = session.user.id;
      const currentToken = session.access_token;
      
      // Update saved session with current token
      const savedSession = localStorage.getItem("user_session") || 
                           sessionStorage.getItem("user_session");
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          if (sessionData.accessToken !== currentToken) {
            const updatedSession = {
              ...sessionData,
              accessToken: currentToken
            };
            
            if (localStorage.getItem("user_session")) {
              localStorage.setItem("user_session", JSON.stringify(updatedSession));
            } else {
              sessionStorage.setItem("user_session", JSON.stringify(updatedSession));
            }
          }
        } catch (error) {
          console.error("Error updating saved session:", error);
        }
      }
      
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
          // Clear saved sessions
          localStorage.removeItem("user_session");
          sessionStorage.removeItem("user_session");
          
          return lockScreen(
            "Another login has been detected. Click anywhere to go to login.",
            true,
            "Another login has been detected."
          );
        }

        // Check if token was cleared (logout from another device)
        if (!dbToken) {
          // Clear saved sessions
          localStorage.removeItem("user_session");
          sessionStorage.removeItem("user_session");
          
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
        // Clear saved sessions on idle timeout
        localStorage.removeItem("user_session");
        sessionStorage.removeItem("user_session");
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