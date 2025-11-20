import { useEffect, useRef, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { db } from "../dbServer";
import ScreenLock from "./ScreenLock";
import GlobalAlert, { showGlobalAlert } from "./GlobalAlert";

export default function AuthChecker({ setCurrentUser }) {
  const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 min
  const WARNING_TIME = 60 * 1000; // 1 min
  const idleTimeout = useRef(null);
  const warningTimeout = useRef(null);
  const [locked, setLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState("");
  const navigate = useNavigate();
  const lastValidToken = useRef(null);

  useEffect(() => {
    const checkSession = async () => {
      const savedSession = localStorage.getItem("user_session") || sessionStorage.getItem("currentUser");
      if (!savedSession) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const { data: { session }, error } = await db.auth.getSession();
        if (!session || error) {
          localStorage.removeItem("user_session");
          sessionStorage.removeItem("currentUser");
          navigate("/", { replace: true });
          return;
        }

        const currentToken = session.access_token;
        const userId = session.user.id;

        // Update currentUser if needed
        const savedUser = sessionStorage.getItem("currentUser");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user.access_token !== currentToken) {
            user.access_token = currentToken;
            sessionStorage.setItem("currentUser", JSON.stringify(user));
            setCurrentUser(user);
          }
        }

        // Check DB token
        const { data, error: dbError } = await db
          .from("employee_Accounts")
          .select("current_session_token")
          .eq("id", userId)
          .single();

        if (dbError) return;

        if (lastValidToken.current === null) {
          lastValidToken.current = currentToken;
          if (data.current_session_token !== currentToken) {
            await db.from("employee_Accounts").update({ current_session_token: currentToken }).eq("id", userId);
          }
        }

        if (data.current_session_token && data.current_session_token !== currentToken) {
          localStorage.removeItem("user_session");
          sessionStorage.removeItem("currentUser");
          setLocked(true);
          setLockMessage("Another login detected. Click to login.");
          showGlobalAlert("Another login detected.");
        }

      } catch (err) {
        console.error(err);
      }
    };

    checkSession();

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout.current);
      clearTimeout(warningTimeout.current);

      warningTimeout.current = setTimeout(() => {
        showGlobalAlert("You will be logged out in 60 seconds due to inactivity.");
      }, IDLE_TIMEOUT - WARNING_TIME);

      idleTimeout.current = setTimeout(() => {
        localStorage.removeItem("user_session");
        sessionStorage.removeItem("currentUser");
        setLocked(true);
        setLockMessage("You have been logged out due to inactivity.");
      }, IDLE_TIMEOUT);
    };

    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    resetIdleTimer();
    const interval = setInterval(checkSession, 15000);

    return () => {
      clearInterval(interval);
      clearTimeout(idleTimeout.current);
      clearTimeout(warningTimeout.current);
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
    };
  }, [navigate, setCurrentUser]);

  return (
    <>
      <GlobalAlert />
      <Outlet />
      {locked && <ScreenLock message={lockMessage} />}
    </>
  );
}
