import { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import DropdownAccounts from "../AdminApp/DropDownAccounts";

export default function ProfileMenu({ onDarkMode }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const profileButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing currentUser from localStorage:", err);
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
        <span className="profile-name">
          {currentUser?.is_Admin ? "Admin" : "Moderator"}
        </span>
        <FaUserCircle className="profile-icon" />
      </button>

      <div ref={dropdownRef}>
        <DropdownAccounts
          open={isProfileMenuOpen}
          onClose={() => setIsProfileMenuOpen(false)}
          onDarkMode={onDarkMode}
        />
      </div>
    </div>
  );
}
