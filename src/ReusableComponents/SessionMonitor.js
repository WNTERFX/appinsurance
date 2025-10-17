import { useEffect } from "react";
import { db } from "../dbServer";
import { showGlobalAlert } from "./GlobalAlert";

export default function SessionMonitor({ session }) {
  useEffect(() => {
    const checkSession = async () => {
      try {
    
        const { data: { session: currentSession } } = await db.auth.getSession();
        
        if (!currentSession) {
          console.warn("No active Supabase session");
          return;
        }

        const userId = currentSession.user.id;
        const currentToken = currentSession.access_token;

        const { data, error } = await db
          .from("employee_Accounts")
          .select("current_session_token")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("Supabase error:", error);
          return;
        }

        if (data && data.current_session_token !== currentToken) {
          showGlobalAlert("Your session has expired or logged in elsewhere.");
          await db.auth.signOut(); 
          window.location.reload();
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };

    if (session) {
      const interval = setInterval(checkSession, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return null;
}