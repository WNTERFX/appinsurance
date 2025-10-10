import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/account-management-styles.css";
import { createAccount, fetchAccounts, editAccount, deleteAccount } from "./AccountCreationActions";
import ScreenLock from "../../ReusableComponents/ScreenLock";
import { showGlobalAlert } from "../../ReusableComponents/GlobalAlert";
import { db } from "../../dbServer";

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
    accountStatus: "active", // renamed to avoid conflict
  });
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [emailLocked, setEmailLocked] = useState(true);
  const [passwordLocked, setPasswordLocked] = useState(true);
  const [showLockScreen, setShowLockScreen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await db.auth.getUser();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (activeTab === "edit") loadAccounts();
  }, [activeTab]);

  const loadAccounts = async () => {
    const data = await fetchAccounts();
    setAccounts(data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const { firstName, lastName, email, password, accountStatus } = formData;
    if (!firstName || !lastName || !email || (!password && !editingAccount)) {
      showGlobalAlert("Please fill in all required fields.");
      return;
    }

    // Convert accountStatus string to boolean for DB
    const submitData = {
      ...formData,
      status_Account: accountStatus === "active",
    };

    if (editingAccount) {
      const result = await editAccount(editingAccount.id, submitData);
      if (result.success) {
        showGlobalAlert("Account updated successfully!");
        if (result.selfChangedPassword) {
          setShowLockScreen(true);
          setTimeout(() => {
            localStorage.clear();
            navigate("/appinsurance");
          }, 1000);
        }
        handleBack(true);
        loadAccounts();
      } else {
        showGlobalAlert(`Error: ${result.error}`);
      }
    } else {
      const result = await createAccount(submitData);
      if (result.success) {
        showGlobalAlert("Account created successfully!");
        handleBack(false);
        loadAccounts();
      } else {
        showGlobalAlert(`Error: ${result.error}`);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    const result = await deleteAccount(id);
    if (result.success) {
      showGlobalAlert("Account deleted successfully.");
      loadAccounts();
    } else {
      showGlobalAlert(`Error: ${result.error}`);
    }
  };

  const handleEditClick = (acc) => {
    setEditingAccount(acc);
    setFormData({
      firstName: acc.first_name || "",
      middleName: acc.middle_name || "",
      lastName: acc.last_name || "",
      email: acc.employee_email || "",
      password: "",
      isAdmin: acc.is_Admin || false,
      accountStatus: acc.status_Account ? "active" : "inactive", // boolean -> string
    });
    setEmailLocked(true);
    setPasswordLocked(true);
    setActiveTab("add");
  };

  const handleBack = (goToEditTab = false) => {
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
            onClick={() => handleBack(false)}
          >
            Add Account
          </button>
          <button
            className={`btn-archive ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            Edit Accounts
          </button>
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
                      <td>{acc.personnel_Name}</td>
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
              <div>
                <label>Email *</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required disabled={emailLocked} style={{ flex: 1 }} />
                  {editingAccount && <button type="button" onClick={() => setEmailLocked(!emailLocked)}>{emailLocked ? "Unlock" : "Lock"}</button>}
                </div>
              </div>
              <div>
                <label>{editingAccount ? "New Password" : "Password *"}</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type={passwordLocked ? "password" : "text"} name="password" value={formData.password} onChange={handleChange} required={!editingAccount} style={{ flex: 1 }} />
                  {editingAccount && <button type="button" onClick={() => setPasswordLocked(!passwordLocked)}>{passwordLocked ? "Unlock" : "Lock"}</button>}
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
              <button type="submit" className="btn-add-account-submit">{editingAccount ? "Update Account" : "Create Account"}</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
