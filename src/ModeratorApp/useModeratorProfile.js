import { useState, useEffect } from "react";
import { db } from "../dbServer";

export function useModeratorProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user }, error } = await db.auth.getUser();
      if (error || !user) return;

      const { data: employee, error: empError } = await db
        .from("employee_Accounts")
        .select("personnel_Name")
        .eq("id", user.id)   // auth.id === employee_Accounts.id
        .single();

      if (!empError && employee) {
        setProfile({
          ...user,
          fullName: employee.personnel_Name,
        });
      } else {
        setProfile(user);
      }
    }

    loadProfile();
  }, []);

  return profile;
}
