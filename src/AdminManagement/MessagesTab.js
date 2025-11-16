
import React from "react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
};

export default function MessagesTab({ controller }) {
  return (
    <>
      <div className="admin-controller-header">
        {!controller.isCreatingMsg && (
          <button
            onClick={controller.showCreateMsgForm}
            className="admin-controller-btn admin-controller-btn-primary"
          >
            Add New Message
          </button>
        )}
      </div>

      {controller.isCreatingMsg && (
        <form onSubmit={controller.handleMsgSubmit} className="admin-controller-form">
          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Message Type:
              <input
                type="text"
                value={controller.messageType}
                onChange={(e) => controller.setMessageType(e.target.value)}
                className="admin-controller-input"
                placeholder="e.g., Info, Warning, Error, Success"
                required
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Message Description:
              <textarea
                value={controller.messageDesc}
                onChange={(e) => controller.setMessageDesc(e.target.value)}
                className="admin-controller-input"
                placeholder="Enter message description"
                rows="4"
                required
              />
            </label>
          </div>

          <div className="admin-controller-button-group">
            <button
              type="submit"
              className="admin-controller-btn admin-controller-btn-primary"
              disabled={controller.loadingMsg}
            >
              {controller.loadingMsg ? "Saving..." : controller.isEditingMsg ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={controller.resetMsgForm}
              className="admin-controller-btn admin-controller-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-controller-table-wrapper">
        <h3 className="admin-controller-subtitle">Messages</h3>
        <table className="admin-controller-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Message Type</th>
              <th>Message Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {controller.messages.length === 0 ? (
              <tr>
                <td colSpan="5" className="admin-controller-empty">
                  No messages found. Click "Add New Message" to create one.
                </td>
              </tr>
            ) : (
              controller.messages.map((msg) => (
                <tr key={msg.id}>
                  <td>{msg.id}</td>
                  <td><strong>{msg.message_type}</strong></td>
                  <td>{msg.message_desc}</td>
                  <td>{formatDate(msg.created_at)}</td>
                  <td>
                    <button
                      onClick={() => controller.handleEditMsg(msg)}
                      className="admin-controller-btn admin-controller-btn-edit"
                    >
                      Edit
                    </button>
                    {/*<button
                      onClick={() => controller.handleDeleteMsg(msg.id)}
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