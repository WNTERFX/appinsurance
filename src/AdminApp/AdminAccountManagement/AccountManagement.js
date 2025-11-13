import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/account-management-styles.css";
import { createAccount, fetchAccounts, editAccount, deleteAccount } from "./AccountCreationActions";
import { fetchAllEmployeeRoles } from "../AdminActions/EmployeeRoleActions";
import ScreenLock from "../../ReusableComponents/ScreenLock";
import { showGlobalAlert } from "../../ReusableComponents/GlobalAlert";
import ProfileMenu from "../../ReusableComponents/ProfileMenu";
import { db } from "../../dbServer";

import DropdownAccounts from "../DropDownAccounts";
import { FaUserCircle } from "react-icons/fa";

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
    roleId: "", // Added role selection
  });
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]); // All available roles
  const [editingAccount, setEditingAccount] = useState(null);
  const [emailLocked, setEmailLocked] = useState(true);
  const [passwordLocked, setPasswordLocked] = useState(true);
  const [showLockScreen, setShowLockScreen] = useState(false);

  // Profile Menu State and Refs
  const profileButtonRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // 🧭 Load current user
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await db.auth.getUser();
      if (!user) return;

      // Fetch user role from employee_Accounts
      const { data: account, error } = await db
        .from("employee_Accounts")
        .select("is_Admin")
        .eq("id", user.id)
        .single();

      if (!error && account) {
        setCurrentUser({ ...user, isAdmin: account.is_Admin });
      }

      logEvent("Current user loaded", user);
    };

    loadUser();
  }, []);

  // Load roles on mount
  useEffect(() => {
    loadRoles();
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
        profileButtonRef.current &&
        !profileButtonRef.current.contains(e.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAccounts = async () => {
    logEvent("Fetching accounts...");
    const data = await fetchAccounts();
    logEvent("Accounts loaded", data);
    setAccounts(data);
  };

  const loadRoles = async () => {
    logEvent("Fetching employee roles...");
    try {
      const data = await fetchAllEmployeeRoles();
      logEvent("Employee roles loaded", data);
      setRoles(data || []);
    } catch (error) {
      logEvent("Error loading roles", error);
      showGlobalAlert("Error loading employee roles");
    }
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
    handleBack(false);
    setActiveTab("add");
  };

  // 💾 Handle create / edit submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const { firstName, lastName, email, password, roleId } = formData;

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

      if (password && password.length < 10) {
      showGlobalAlert("Password must be at least 10 characters long.");
      logEvent("Password length too short");
      return;
    }

    const passRegex = new RegExp(
      "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"|<>?,./`~])"
    );

    if (!passRegex.test(password)) {
      showGlobalAlert(
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character."
      );
      logEvent("Password failed complexity check");
      return;
    }

    // Prepare form data with role
    const accountData = {
      ...formData,
      roleId: roleId || null, // Include role ID
    };

    if (editingAccount) {
      logEvent("Editing existing account", editingAccount);

      const result = await editAccount(editingAccount.id, accountData);
      logEvent("Edit result", result);

      if (result.success) {
        showGlobalAlert("Account updated successfully!");
        await loadAccounts();
        setTimeout(() => handleBack(true), 100);
      } else {
        showGlobalAlert(`Error: ${result.error}`);
      }
    } else {
      logEvent("Creating new account", accountData);

      const result = await createAccount(accountData);
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
      roleId: acc.role_id || "", // Load existing role
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
      roleId: "",
    });
    if (goToEditTab) setActiveTab("edit");
  };

  // Helper function to get role name by ID
  const getRoleName = (roleId) => {
    if (!roleId) return "N/A";
    const role = roles.find(r => r.id === roleId);
    return role ? role.role_name : "N/A";
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
          {currentUser?.isAdmin && (
            <>
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
            </>
          )}
          {/* Profile Menu */}
          <div className="profile-menu">
            <ProfileMenu onDarkMode={() => console.log("Dark Mode toggled")} />
          </div>
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
                    <th>Role</th>
                    <th>Status</th>
                    {currentUser?.isAdmin && <th>Privilage</th>}
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
                      <td><strong>{getRoleName(acc.role_id)}</strong></td>
                      <td>
                        <span className={acc.status_Account ? "account-status-active" : "account-status-inactive"}>
                          {acc.status_Account ? "Active" : "Inactive"}
                        </span>
                      </td>
                      {currentUser?.isAdmin && <td>{acc.is_Admin ? "Admin" : "Moderator"}</td>}
                      <td className="account-table-actions">
                        <button onClick={() => handleEditClick(acc)}>Edit</button>
                        {currentUser?.isAdmin && (
                          <button onClick={() => handleDelete(acc.id)}>Delete</button>
                        )}
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
                  disabled={editingAccount && emailLocked}
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
                <label>Employee Role</label>
                <select name="roleId" value={formData.roleId} onChange={handleChange}>
                  <option value="">Select a role...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
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