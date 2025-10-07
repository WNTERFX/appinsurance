import { useState } from "react";
import "../styles/account-management-styles.css";

export default function AccountManagement() {
  const [activeTab, setActiveTab] = useState("edit");

  return (
    <div className="Account-container">
      {/* Header */}
      <div className="Account-header">
        <div className="left-actions-account">
          <h2 className="account-title">Account Management</h2>
        </div>

        <div className="actions-right-account">
          <button
            className={`btn-add-account btn-account ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            Add Account
          </button>
          <button
            className={`btn-edit-account btn-account ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => setActiveTab("edit")}
          >
            Edit Accounts
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="account-data-field">
        {activeTab === "edit" ? (
          <div className="Account-content">
            <p>Select an account to view or edit details.</p>
            {/* Later: add table or cards of existing accounts */}
          </div>
        ) : (
          <div className="Account-content">
            <form className="add-account-form">
              <label>
                Username
                <input type="text" placeholder="Enter username" />
              </label>
              <label>
                Email
                <input type="email" placeholder="Enter email" />
              </label>
              <label>
                Password
                <input type="password" placeholder="Enter password" />
              </label>
              <button type="submit" className="btn-add-account-submit">
                Create Account
              </button>
            </form>

            <div> </div>
          </div>
        )}
      </div>
    </div>
  );
}
