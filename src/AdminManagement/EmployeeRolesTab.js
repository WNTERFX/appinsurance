import React from "react";

export default function EmployeeRolesTab({ controller }) {
  return (
    <>
      <div className="admin-controller-header">
        {!controller.isCreatingRole && (
          <button
            onClick={controller.showCreateRoleForm}
            className="admin-controller-btn admin-controller-btn-primary"
          >
            Add New Employee Role
          </button>
        )}
      </div>

      {controller.isCreatingRole && (
        <form onSubmit={controller.handleRoleSubmit} className="admin-controller-form">
          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Role Name:
              <input
                type="text"
                value={controller.roleName}
                onChange={(e) => controller.setRoleName(e.target.value)}
                className="admin-controller-input"
                placeholder="e.g., Manager, Agent, Administrator"
                required
                disabled={controller.isEditingRole}
              />
            </label>
          </div>

          <div className="admin-controller-button-group">
            <button
              type="submit"
              className="admin-controller-btn admin-controller-btn-primary"
              disabled={controller.loadingRole}
            >
              {controller.loadingRole ? "Saving..." : controller.isEditingRole ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={controller.resetRoleForm}
              className="admin-controller-btn admin-controller-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-controller-table-wrapper">
        <h3 className="admin-controller-subtitle">Employee Roles</h3>
        <table className="admin-controller-table">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!controller.roles || controller.roles.length === 0 ? (
              <tr>
                <td colSpan="3" className="admin-controller-empty">
                  No employee roles found. Click "Add New Employee Role" to create one.
                </td>
              </tr>
            ) : (
              controller.roles.map((role) => (
                <tr key={role.id}>
                  <td><strong>{role.role_name}</strong></td>
                  <td>{new Date(role.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => controller.handleEditRole(role)}
                      className="admin-controller-btn admin-controller-btn-edit"
                    >
                      Edit
                    </button>
                   {/* <button
                      onClick={() => controller.handleDeleteRole(role.id)}
                      className="admin-controller-btn admin-controller-btn-delete"
                    >
                      Delete
                    </button>*/}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}