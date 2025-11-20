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
    // Load user data from localStorage or sessionStorage
    const storedSession = localStorage.getItem("user_session") ||sessionStorage.getItem("user_session");
    

    const storedUser = sessionStorage.getItem("currentUser");
    
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);
        setCurrentUser(session);
        
        // Build display name from session data
        const firstName = session.first_name?.trim() || "";
        const lastName = session.last_name?.trim() || "";
        
        if (firstName && lastName) {
          setDisplayName(`${firstName} ${lastName}`);
        } else if (firstName) {
          setDisplayName(firstName);
        } else if (lastName) {
          setDisplayName(lastName);
        } else if (session.personnel_Name) {
          setDisplayName(session.personnel_Name);
        } else {
          // Fallback to role if no name available
          setDisplayName(session.isAdmin ? "Admin" : "Moderator");
        }
      } catch (err) {
        console.error("Error parsing user_session from storage:", err);
      }
    } else if (storedUser) {
      // Fallback to old storage method
      try {
        const user = JSON.parse(storedUser);
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
        console.error("Error parsing currentUser from sessionStorage:", err);
      }
    }
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