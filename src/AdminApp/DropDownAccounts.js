// components/ProfileDropdown.jsx
import { useRef, useEffect } from "react";
import { FaMoon, FaSignOutAlt } from "react-icons/fa";
import { logoutUser } from "./AdminActions/LogoutActions";
// You can remove useNavigate, we will use window.location
// import { useNavigate } from "react-router-dom"; 

export default function ProfileDropdown({ open, onClose, onDarkMode, setSession }) {
  const dropdownRef = useRef(null);
  // const navigate = useNavigate(); // Not needed for the fix

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  async function handleLogout() {
    const error = await logoutUser();
    
    // 1. Explicitly clear the storage immediately
    localStorage.removeItem("user_session");
    sessionStorage.removeItem("user_session");

    if (!error) {
        // 2. Use window.location.href instead of navigate.
        // This forces the browser to reload the page.
        // When App.js reloads, it will check storage, find nothing, 
        // and set 'session' to null, allowing the LoginForm to show.
        window.location.href = "/";
    } else {
      console.error("Logout failed:", error.message);
    }
  }

  return (
    <div
      ref={dropdownRef}
      className={`dropdown ${open ? "open" : ""}`}
      role="menu"
      aria-hidden={!open}
    >
      {/* <button className="dropdown-item" onClick={onDarkMode}>
        <FaMoon className="dropdown-icon" />
        Dark Mode
      </button>*/}

      <button className="dropdown-item" onClick={handleLogout}>
        <FaSignOutAlt className="dropdown-icon" />
        Log Out
      </button>
    </div>
  );
}