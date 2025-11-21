import { useEffect, useRef, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { db } from "../dbServer";
import ScreenLock from "./ScreenLock";
import GlobalAlert, { showGlobalAlert } from "./GlobalAlert";

export default function AuthChecker({ session, setSession, setCurrentUser }) {
  const IDLE_TIMEOUT = 15 * 60 * 1000; 
  const WARNING_TIME = 60 * 1000; 

  const idleTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const lastValidToken = useRef(null);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");

  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  // ----------------- Logout Helper -----------------
  const logoutUser = async (message = "You have been logged out.") => {
    if (locked) return;

    // ✅ Only use localStorage (single source of truth)
    localStorage.removeItem("currentUser");

    await db.auth.signOut();

    if (setSession) setSession(null);
    if (setCurrentUser) setCurrentUser(null);

    setLocked(true);
    setLockMessage(message);
    showGlobalAlert(message);

    setTimeout(() => {
      navigateRef.current("/", { replace: true });
    }, 0);
  };

  // ----------------- Cross-tab detection -----------------
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "currentUser" && e.newValue === null) {
        logoutUser("You have been logged out from another tab.");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // ----------------- Idle Timeout -----------------
  useEffect(() => {
    const resetIdleTimer = () => {
      clearTimeout(idleTimeout.current);
      clearTimeout(warningTimeout.current);

      warningTimeout.current = setTimeout(() => {
        showGlobalAlert("You will be logged out in 60 seconds due to inactivity.");
      }, IDLE_TIMEOUT - WARNING_TIME);

      idleTimeout.current = setTimeout(() => {
        logoutUser("You were logged out due to inactivity.");
      }, IDLE_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout.current);
      clearTimeout(warningTimeout.current);
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
    };
  }, []);

  // ----------------- Session Verification -----------------
  useEffect(() => {
    const verifySession = async () => {
      // ✅ Only check localStorage (single source of truth)
      const currentUserStr = localStorage.getItem("currentUser");
      
      if (!currentUserStr) {
        if (!locked) logoutUser();
        return;
      }

      const userObj = JSON.parse(currentUserStr);

      try {
        const { data: { session: currentSession }, error: sessionError } = await db.auth.getSession();
        
        if (sessionError || !currentSession) {
          logoutUser("Session expired.");
          return;
        }

        const { data, error } = await db
          .from("employee_Accounts")
          .select("current_session_token")
          .eq("id", userObj.id)
          .maybeSingle();

        if (error) { 
          console.error("DB Error", error); 
          return; 
        }

        const dbToken = data?.current_session_token;
        const currentToken = currentSession.access_token;

        if (lastValidToken.current === null) {
          lastValidToken.current = currentToken;
        }

        if (dbToken && dbToken !== currentToken) {
          logoutUser("You have logged in from another device.");
        }

        lastValidToken.current = currentToken;

      } catch (err) {
        console.error("Session verification error:", err);
      }
    };

    const interval = setInterval(verifySession, 15000);
    verifySession();

    return () => clearInterval(interval);
  }, []); 

  return (
    <>
      <GlobalAlert />
      {!locked && <Outlet />}
      {locked && <ScreenLock message={lockMessage} />}
    </>
  );
}