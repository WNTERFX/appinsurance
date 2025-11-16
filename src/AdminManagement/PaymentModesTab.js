import React, { useState, useEffect } from "react";
import { db } from "../dbServer";

export default function PaymentModesTab() {
  const [paymentModes, setPaymentModes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modeName, setModeName] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPaymentModes();
  }, []);

  const loadPaymentModes = async () => {
    try {
      // 1. Call the new RPC function
      const { data, error } = await db.rpc("get_payment_modes_with_usage");

      if (error) throw error;
      setPaymentModes(data || []);
    } catch (error) {
      console.error("Error loading payment modes:", error);
      showMessage("Error loading payment modes", "error");
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setModeName("");
  };

  const handleEdit = (mode) => {
    setEditingId(mode.id);
    setIsAdding(false);
    setModeName(mode.payment_mode_name);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setModeName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!modeName.trim()) {
      showMessage("Payment mode name is required", "error");
      return;
    }

    // Prevent duplicate names
    const duplicate = paymentModes.find(
      (p) =>
        p.payment_mode_name?.toLowerCase() === modeName.trim().toLowerCase() &&
        p.id !== editingId
    );
    if (duplicate) {
      showMessage("Payment mode already exists", "error");
      return;
    }

    try {
      setIsSaving(true);

      if (isAdding) {
        const { error } = await db.from("payment_mode").insert([
          {
            payment_mode_name: modeName.trim(),
          },
        ]);
        if (error) throw error;
        showMessage("Payment mode added successfully", "success");
      } else if (editingId) {
        const { error } = await db
          .from("payment_mode")
          .update({ payment_mode_name: modeName.trim() })
          .eq("id", editingId);
        if (error) throw error;
        showMessage("Payment mode updated successfully", "success");
      }

      await loadPaymentModes(); // Reload data with usage counts
      handleCancel();
    } catch (error) {
      console.error("Error saving payment mode:", error);
      showMessage("Error saving payment mode: " + error.message, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment mode?")) {
      return;
    }

    try {
      const { error } = await db.from("payment_mode").delete().eq("id", id);
      if (error) {
        // Handle foreign key constraint error specifically if needed
        if (error.code === "23503") {
           showMessage("Cannot delete: This mode is still in use by payments.", "error");
        } else {
           throw error;
        }
      } else {
        showMessage("Payment mode deleted successfully", "success");
        loadPaymentModes(); // Reload data
      }
    } catch (error) {
      console.error("Error deleting payment mode:", error);
      showMessage("Error deleting payment mode: " + error.message, "error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>Payment Modes Management</h3>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            + Add Payment Mode
          </button>
        )}
      </div>

      {message.text && (
        <div
          style={{
            padding: "10px",
            marginBottom: "20px",
            borderRadius: "4px",
            background: message.type === "success" ? "#d4edda" : "#f8d7da",
            color: message.type === "success" ? "#155724" : "#721c24",
            border: `1px solid ${
              message.type === "success" ? "#c3e6cb" : "#f5c6cb"
            }`,
          }}
        >
          {message.text}
        </div>
      )}

      {(isAdding || editingId) && (
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <label style={{ fontWeight: "bold" }}>Payment Mode Name:</label>
            <input
              type="text"
              value={modeName}
              onChange={(e) => setModeName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                marginTop: "5px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: "10px 20px",
                background: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "10px 20px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "white",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <thead style={{ background: "#f1f1f1" }}>
          <tr>
            <th style={{ padding: "10px", textAlign: "left" }}>#</th>
            <th style={{ padding: "10px", textAlign: "left" }}>Payment Mode</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paymentModes.map((mode, index) => (
            <tr key={mode.id} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "10px" }}>{index + 1}</td>
              <td style={{ padding: "10px" }}>{mode.payment_mode_name}</td>
              <td style={{ padding: "10px", textAlign: "center" }}>
                <button
                  onClick={() => handleEdit(mode)}
                  style={{
                    padding: "5px 10px",
                    background: "#ffc107",
                    color: "black",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    marginRight: "5px",
                  }}
                >
                  Edit
                </button>
               {/* <button
                  onClick={() => handleDelete(mode.id)}
                  // 2. Add disabled prop based on usage_count
                  disabled={mode.usage_count > 0}
                  // 4. Add title for accessibility
                  title={
                    mode.usage_count > 0
                      ? "Cannot delete: This mode is in use."
                      : "Delete payment mode"
                  }
                  style={{
                    padding: "5px 10px",
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    // 3. Update style based on disabled state
                    cursor: mode.usage_count > 0 ? "not-allowed" : "pointer",
                    opacity: mode.usage_count > 0 ? 0.5 : 1,
                  }}
                >
                  Delete
                </button>*/}
              </td>
            </tr>
          ))}
          {paymentModes.length === 0 && (
            <tr>
              <td colSpan="4" style={{ textAlign: "center", padding: "15px" }}>
                No payment modes found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}