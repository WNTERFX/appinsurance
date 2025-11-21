import { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import DropdownAccounts from "../AdminApp/DropDownAccounts";

export default function ProfileMenu({ onDarkMode }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [session, setSession] = useState(null);
  const [displayName, setDisplayName] = useState("User");
  const profileButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // ✅ Load user data from localStorage (cross-tab sync)
    const storedUser = localStorage.getItem("currentUser");
    
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        
        // Build display name from user data
        const firstName = user.first_name?.trim() || "";
        const lastName = user.last_name?.trim() || "";
        
        if (firstName && lastName) {
          setDisplayName(`${firstName} ${lastName}`); // ✅ Fixed syntax
        } else if (firstName) {
          setDisplayName(firstName);
        } else if (lastName) {
          setDisplayName(lastName);
        } else if (user.personnel_Name) {
          setDisplayName(user.personnel_Name);
        } else {
          // Fallback to role if no name available
          setDisplayName(user.is_Admin ? "Admin" : "Moderator");
        }
      } catch (err) {
        console.error("Error parsing currentUser from localStorage:", err);
      }
    }
  }, []);

  // ✅ Optional: Listen for storage changes to update name in real-time across tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "currentUser") {
        if (e.newValue) {
          try {
            const user = JSON.parse(e.newValue);
            setCurrentUser(user);
            
            const firstName = user.first_name?.trim() || "";
            const lastName = user.last_name?.trim() || "";
            
            if (firstName && lastName) {
              setDisplayName(`${firstName} ${lastName}`);
            } else if (firstName) {
              setDisplayName(firstName);
            } else if (lastName) {
              setDisplayName(lastName);
            } else if (user.personnel_Name) {
              setDisplayName(user.personnel_Name);
            } else {
              setDisplayName(user.is_Admin ? "Admin" : "Moderator");
            }
          } catch (err) {
            console.error("Error parsing storage change:", err);
          }
        } else {
          // User was logged out in another tab
          setCurrentUser(null);
          setDisplayName("User");
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="profile-menu">
      <button
        ref={profileButtonRef}
        className="profile-button"
        onClick={() => setIsProfileMenuOpen((s) => !s)}
        aria-haspopup="true"
        aria-expanded={isProfileMenuOpen}
      >
        <span className="profile-name">{displayName}</span>
        <FaUserCircle className="profile-icon" />
      </button>
      <div ref={dropdownRef}>
        <DropdownAccounts
          open={isProfileMenuOpen}
          onClose={() => setIsProfileMenuOpen(false)}
          onDarkMode={onDarkMode}
          setSession={setSession} 
        />
      </div>
    </div>
  );
}