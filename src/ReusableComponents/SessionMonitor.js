import { useEffect } from "react";
import { db } from "../dbServer";
import { showGlobalAlert } from "./GlobalAlert";

export default function SessionMonitor({ session }) {
  useEffect(() => {
    const checkSession = async () => {
      try {
        const storedUserId = localStorage.getItem("user_id");
        const storedToken = localStorage.getItem("session_token");

        if (!storedUserId || !storedToken) return; // nothing to check

        const { data, error } = await db
          .from("employee_Accounts")
          .select("current_session_token")
          .eq("id", storedUserId)
          .single();

        if (error) {
          console.error(error);
          return;
        }

      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(checkSession, 5000);
    return () => clearInterval(interval);
  }, [session]);

  return null;
}
