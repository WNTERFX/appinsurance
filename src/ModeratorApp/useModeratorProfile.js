import { useState, useEffect } from "react";
import { db } from "../dbServer";

export function useModeratorProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user }, error } = await db.auth.getUser();
      if (error || !user) {
        setProfile(null); // Ensure profile is null if no user
        return;
      }

      const { data: employee, error: empError } = await db
        .from("employee_Accounts")
        .select("id, first_name, last_name") // Select first_name and last_name
        .eq("id", user.id)   // auth.id === employee_Accounts.id
        .single();

      if (!empError && employee) {
        setProfile({
          ...user,
          // Combine first_name and last_name to create fullName
          fullName: `${employee.first_name} ${employee.last_name}`,
        });
      } else {
        // Fallback if employee data isn't found, use user's email or a generic name
        setProfile({
          ...user,
          fullName: user.email || "Moderator",
        });
      }
    }

    loadProfile();
  }, []);

  return profile;
}