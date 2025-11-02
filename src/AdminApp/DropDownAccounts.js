// components/ProfileDropdown.jsx
import { useRef, useEffect } from "react";
import { FaMoon, FaSignOutAlt } from "react-icons/fa";
import { logoutUser } from "./AdminActions/LogoutActions";
import { useNavigate } from "react-router-dom";

export default function ProfileDropdown({ open, onClose, onDarkMode }) {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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
    if (!error) {
      navigate("/"); // redirect after logout
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
      <button className="dropdown-item" onClick={onDarkMode}>
        <FaMoon className="dropdown-icon" />
        Dark Mode
      </button>

      <button className="dropdown-item" onClick={handleLogout}>
        <FaSignOutAlt className="dropdown-icon" />
        Log Out
      </button>
    </div>
  );
}
