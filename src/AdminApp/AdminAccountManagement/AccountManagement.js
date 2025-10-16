import { useState, useEffect, useRef } from "react"; // ADDED useRef
import { useNavigate } from "react-router-dom";
import "../styles/account-management-styles.css";
import { createAccount, fetchAccounts, editAccount, deleteAccount } from "./AccountCreationActions";
import ScreenLock from "../../ReusableComponents/ScreenLock";
import { showGlobalAlert } from "../../ReusableComponents/GlobalAlert";
import { db } from "../../dbServer";

import DropdownAccounts from "../DropDownAccounts";
import { FaUserCircle } from "react-icons/fa"; // ADDED FaUserCircle import

// 🪵 Logging utility
function logEvent(label, data = null) {
  const timestamp = new Date().toLocaleString();
  console.log(`[AccountManagement | ${timestamp}] ${label}`, data ?? "");
}

export default function AccountManagement() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("edit");
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    isAdmin: false,
    accountStatus: "active",
  });
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [emailLocked, setEmailLocked] = useState(true);
  const [passwordLocked, setPasswordLocked] = useState(true);
  const [showLockScreen, setShowLockScreen] = useState(false);

  // Profile Menu State and Refs
  const profileButtonRef = useRef(null); // Renamed from buttonRef to avoid confusion
  const dropdownRef = useRef(null);     // ADDED dropdownRef
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // Renamed from open to avoid confusion


  // 🧭 Load current user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await db.auth.getUser();
      setCurrentUser(user);
      logEvent("Current user loaded", user);
    };
    loadUser();
  }, []);

  // 📋 Load accounts on tab change
  useEffect(() => {
    if (activeTab === "edit") loadAccounts();
  }, [activeTab]);

  // Click outside handler for profile menu dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        profileButtonRef.current && // Use the new ref name here
        !profileButtonRef.current.contains(e.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // ADDED: Dependency array for useEffect


  const loadAccounts = async () => {
    logEvent("Fetching accounts...");
    const data = await fetchAccounts();
    logEvent("Accounts loaded", data);
    setAccounts(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddClick = () => {
  logEvent("Add Account button clicked");
  handleBack(false); // Reset form
  setActiveTab("add"); // Switch to add tab
};


  // 💾 Handle create / edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const { firstName, lastName, email, password } = formData;

    logEvent("Form submit triggered", { formData, editingAccount });

    if (!firstName || !lastName || !email) {
      showGlobalAlert("Please fill in all required fields.");
      logEvent("Missing required fields");
      return;
    }

    if (!editingAccount && !password) {
      showGlobalAlert("Password is required for new accounts.");
      logEvent("Missing password for new account");
      return;
    }

    if (editingAccount) {
      logEvent("Editing existing account", editingAccount);

      const result = await editAccount(editingAccount.id, formData);
      logEvent("Edit result", result);

      if (result.success) {
        showGlobalAlert("Account updated successfully!");
        await loadAccounts();
        setTimeout(() => handleBack(true), 100);
      } else {
        showGlobalAlert(`Error: ${result.error}`);
      }
    } else {
      logEvent("Creating new account", formData);

      const result = await createAccount(formData);
      logEvent("Create result", result);

      if (result.success) {
        showGlobalAlert("Account created successfully!");
        await loadAccounts();
        setTimeout(() => handleBack(false), 100);
      } else {
        showGlobalAlert(`Error: ${result.error}`);
      }
    }
  };

  // 🗑️ Handle account delete
  const handleDelete = async (id) => {
    logEvent("Delete requested", id);
    if (!window.confirm("Are you sure you want to delete this account?")) return;

    const result = await deleteAccount(id);
    logEvent("Delete result", result);

    if (result.success) {
      showGlobalAlert("Account deleted successfully.");
      loadAccounts();
    } else {
      showGlobalAlert(`Error: ${result.error}`);
    }
  };

  // ✏️ Handle account edit button click
  const handleEditClick = (acc) => {
    logEvent("Edit button clicked", acc);

    setEditingAccount(acc);
    setFormData({
      firstName: acc.first_name || "",
      middleName: acc.middle_name || "",
      lastName: acc.last_name || "",
      email: acc.employee_email || "",
      password: "",
      isAdmin: acc.is_Admin || false,
      accountStatus: acc.status_Account ? "active" : "inactive",
    });

    setEmailLocked(true);
    setPasswordLocked(true);
    setActiveTab("add");

    logEvent("Editing account form populated", acc);
  };

  // 🔙 Handle back button
  const handleBack = (goToEditTab = false) => {
    logEvent("Back button clicked");
    setEditingAccount(null);
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      isAdmin: false,
      accountStatus: "active",
    });
    if (goToEditTab) setActiveTab("edit");
  };

  // 🧩 Render
  return (
    <div className="Account-container">
      {showLockScreen && <ScreenLock message="You changed your password. Logging out..." />}

      <div className="Account-header">
        <div className="left-actions-client">
          <h2 className="client-title">Account Management</h2>
        </div>

        <div className="right-actions-client">
            <button
            className={`btn-create ${activeTab === "add" ? "active" : ""}`}
            onClick={handleAddClick}
          >
            Add Account
          </button>
          <button
            className={`btn-archive ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            Edit Accounts
          </button>

          {/* ADDED: Profile Menu     nextime the ui in profile-menu*/}
          <div className="profile-menu">
            <button
              ref={profileButtonRef} // Use the new ref name
              className="profile-button"
              onClick={() => setIsProfileMenuOpen((s) => !s)} // Use the new state name
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen} // Use the new state name
            >
              <span className="profile-name">Admin</span> {/* Display current user's email or "Admin" */}
              <FaUserCircle className="profile-icon" />
            </button>

            <div ref={dropdownRef}> {/* ADDED ref to the dropdown container */}
              <DropdownAccounts
                open={isProfileMenuOpen} // Use the new state name
                onClose={() => setIsProfileMenuOpen(false)} // Use the new state name
                onDarkMode={() => console.log("Dark Mode toggled")} // Placeholder for dark mode logic
              />
            </div>
          </div>
          {/* END ADDED: Profile Menu */}

        </div>
      </div>

      <div className="account-data-field">
        {activeTab === "edit" && !editingAccount ? (
          <div className="Account-content account-table-scroll">
            {accounts.length === 0 ? (
              <p>No accounts available.</p>
            ) : (
              <table className="account-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Admin</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>

                   {accounts.map(acc => (
                    <tr key={acc.id}>
                      <td>
                        {[acc.first_name, acc.middle_name, acc.last_name]
                          .filter(Boolean)
                          .join(" ")}
                      </td>
                      <td>{acc.employee_email ?? "N/A"}</td>

                      <td>
                        <span className={acc.status_Account ? "account-status-active" : "account-status-inactive"}>
                          {acc.status_Account ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>{acc.is_Admin ? "Yes" : "No"}</td>
                      <td className="account-table-actions">
                        <button onClick={() => handleEditClick(acc)}>Edit</button>
                        <button onClick={() => handleDelete(acc.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="Account-content">
            <button className="btn-back-account" onClick={() => handleBack(true)}>&larr; Back</button>
            <form className="add-account-form" onSubmit={handleSubmit}>
              <div>
                <label>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div>
                <label>Middle Name</label>
                <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} />
              </div>
              <div>
                <label>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <label>Email *</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={editingAccount && emailLocked} // ✅ Only lock when editing
                      style={{ flex: 1 }}
                    />
                    {editingAccount && (
                      <button type="button" onClick={() => setEmailLocked(!emailLocked)}>
                        {emailLocked ? "Unlock" : "Lock"}
                      </button>
                    )}
                  </div>
                <div>
                <label>{editingAccount ? "New Password" : "Password *"}</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type={passwordLocked ? "password" : "text"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingAccount}
                    style={{ flex: 1 }}
                  />
                  {editingAccount && (
                    <button type="button" onClick={() => setPasswordLocked(!passwordLocked)}>
                      {passwordLocked ? "Unlock" : "Lock"}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label>Account Status</label>
                <select name="accountStatus" value={formData.accountStatus} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label>Administrative Rights</label>
                <input type="checkbox" name="isAdmin" checked={formData.isAdmin} onChange={handleChange} />
              </div>
              <button type="submit" className="btn-add-account-submit">
                {editingAccount ? "Update Account" : "Create Account"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}