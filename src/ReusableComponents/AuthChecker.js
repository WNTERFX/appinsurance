import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { db } from "../dbServer";

export default function AuthChecker() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      // Step 1: Read session from localStorage
      const userId = localStorage.getItem("user_id");
      const token = localStorage.getItem("session_token");

      if (!userId || !token) {
        // No session → redirect to login
        return logout();
      }

      try {
        // Step 2: Fetch current DB token
        const { data, error } = await db
          .from("employee_Accounts")
          .select("current_session_token")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("AuthChecker DB error:", error);
          return logout();
        }

        // Step 3: If tokens mismatch → log out
        if (!data?.current_session_token || data.current_session_token !== token) {
          console.warn("Another session detected → logging out");
          return logout();
        }

        // ✅ Optional: console log for debug
        console.log("✅ Session valid for user:", userId);
      } catch (err) {
        console.error("AuthChecker error:", err);
        logout();
      }
    };

    const logout = async () => {
      localStorage.clear();
      await db.auth.signOut().catch(() => {});
      navigate("/appinsurance");
    };

    // Run immediately on mount
    verifySession();

    // Re-verify every 15s to enforce single session across devices
    const interval = setInterval(verifySession, 15000);

    return () => clearInterval(interval);
  }, [navigate]);

  return <Outlet />;
}
