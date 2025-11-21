import { useEffect, useRef } from "react";
import { db } from "../dbServer";
import { showGlobalAlert } from "./GlobalAlert";

export default function SessionMonitor({ session }) {
  const hasShownAlert = useRef(false); // Prevent multiple alerts

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await db.auth.getSession();
        
        if (!currentSession) {
          console.warn("No active Account session");
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
          // Prevent multiple alerts
          if (hasShownAlert.current) return;
          hasShownAlert.current = true;

          // Show blocking alert (second parameter = true)
          showGlobalAlert("Your session has expired or logged in elsewhere.", true);

          // Wait 3 seconds so user can see the alert
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Sign out
          await db.auth.signOut();
          
          // Reload
          window.location.reload();
        }
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };

    if (session) {
      // Check immediately on mount
      checkSession();
      
      // Then check every 5 seconds
      const interval = setInterval(checkSession, 5000);
      
      return () => clearInterval(interval);
    }
  }, [session]);

  return null;
}