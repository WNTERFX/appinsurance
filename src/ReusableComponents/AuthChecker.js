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

  const lastValidToken = useRef(null);

  useEffect(() => {
    // 🚫 Removed navigate()
    const checkInitialSession = async () => {
      const savedSession = localStorage.getItem("user_session") || 
                           sessionStorage.getItem("user_session");

      if (!savedSession) return;

      try {
        const sessionData = JSON.parse(savedSession);

        const { data: { session }, error: sessionError } = await db.auth.getSession();

        if (sessionError || !session) {
          localStorage.removeItem("user_session");
          sessionStorage.removeItem("user_session");
          return;
        }

        if (session.access_token !== sessionData.accessToken) {
          const updated = {
            ...sessionData,
            accessToken: session.access_token
          };

          if (localStorage.getItem("user_session")) {
            localStorage.setItem("user_session", JSON.stringify(updated));
          } else {
            sessionStorage.setItem("user_session", JSON.stringify(updated));
          }
        }
      } catch (err) {
        localStorage.removeItem("user_session");
        sessionStorage.removeItem("user_session");
      }
    };

    const lockScreen = (message, alert = false) => {
      clearTimeout(idleTimeout.current);
      clearTimeout(warningTimeout.current);
      setLocked(true);
      setLockMessage(message);

      if (alert) showGlobalAlert(message);
    };

    const verifySession = async () => {
      const { data: { session }, error } = await db.auth.getSession();

      if (error || !session) {
        localStorage.removeItem("user_session");
        sessionStorage.removeItem("user_session");
        return; // ❗ NO navigate()
      }

      const userId = session.user.id;
      const currentToken = session.access_token;

      const savedSession = localStorage.getItem("user_session") || sessionStorage.getItem("user_session");
      if (savedSession) {
        try {
          const s = JSON.parse(savedSession);
          if (s.accessToken !== currentToken) {
            const updated = { ...s, accessToken: currentToken };
            if (localStorage.getItem("user_session")) {
              localStorage.setItem("user_session", JSON.stringify(updated));
            } else {
              sessionStorage.setItem("user_session", JSON.stringify(updated));
            }
          }
        } catch {}
      }

      const { data, error: dbError } = await db
        .from("employee_Accounts")
        .select("current_session_token")
        .eq("id", userId)
        .single();

      if (dbError) return;

      const dbToken = data?.current_session_token;

      if (lastValidToken.current === null) {
        lastValidToken.current = currentToken;

        if (dbToken !== currentToken) {
          await db.from("employee_Accounts")
            .update({ current_session_token: currentToken })
            .eq("id", userId);
        }
        return;
      }

      const tokenRefreshed = currentToken !== lastValidToken.current;
      if (tokenRefreshed) {
        lastValidToken.current = currentToken;
        await db.from("employee_Accounts")
          .update({ current_session_token: currentToken })
          .eq("id", userId);
        return;
      }

      if (dbToken && dbToken !== currentToken) {
        localStorage.removeItem("user_session");
        sessionStorage.removeItem("user_session");
        return lockScreen("Another login detected.", true);
      }

      if (!dbToken) {
        localStorage.removeItem("user_session");
        sessionStorage.removeItem("user_session");
        return lockScreen("Your session has been logged out.", true);
      }
    };

    const resetIdleTimer = () => {
      clearTimeout(idleTimeout.current);
      clearTimeout(warningTimeout.current);

      warningTimeout.current = setTimeout(() => {
        showGlobalAlert("You will be logged out in 60 seconds due to inactivity.");
      }, IDLE_TIMEOUT - WARNING_TIME);

      idleTimeout.current = setTimeout(() => {
        localStorage.removeItem("user_session");
        sessionStorage.removeItem("user_session");
        lockScreen("You have been logged out due to inactivity.");
      }, IDLE_TIMEOUT);
    };

    checkInitialSession();
    verifySession();

    const interval = setInterval(verifySession, 15000);

    const events = ["mousemove", "keydown", "mousedown", "touchstart"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));

    resetIdleTimer();

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
