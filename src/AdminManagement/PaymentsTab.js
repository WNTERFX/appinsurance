import React, { useState, useEffect } from "react";
import { db } from "../dbServer";

export default function PaymentTypesTab() {
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    payment_type_name: "",
    months_payment: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    loadPaymentTypes();
  }, []);

  const loadPaymentTypes = async () => {
    try {
      const { data, error } = await db
        .from("payment_type")
        .select("*")
        .order("months_payment", { ascending: true });

      if (error) throw error;
      setPaymentTypes(data || []);
    } catch (error) {
      console.error("Error loading payment types:", error);
      showMessage("Error loading payment types", "error");
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({ payment_type_name: "", months_payment: "" });
  };

  const handleEdit = (paymentType) => {
    setEditingId(paymentType.id);
    setIsAdding(false);
    setFormData({
      payment_type_name: paymentType.payment_type_name,
      months_payment: paymentType.months_payment
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ payment_type_name: "", months_payment: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.payment_type_name.trim()) {
      showMessage("Payment type name is required", "error");
      return;
    }

    if (!formData.months_payment || formData.months_payment <= 0) {
      showMessage("Months must be greater than 0", "error");
      return;
    }

    try {
      if (isAdding) {
        // Add new payment type
        const { error } = await db
          .from("payment_type")
          .insert([{
            payment_type_name: formData.payment_type_name.trim(),
            months_payment: parseInt(formData.months_payment)
          }]);

        if (error) throw error;
        showMessage("Payment type added successfully", "success");
      } else if (editingId) {
        // Update existing payment type
        const { error } = await db
          .from("payment_type")
          .update({
            payment_type_name: formData.payment_type_name.trim(),
            months_payment: parseInt(formData.months_payment)
          })
          .eq("id", editingId);

        if (error) throw error;
        showMessage("Payment type updated successfully", "success");
      }

      loadPaymentTypes();
      handleCancel();
    } catch (error) {
      console.error("Error saving payment type:", error);
      showMessage("Error saving payment type: " + error.message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment type?")) {
      return;
    }

    try {
      const { error } = await db
        .from("payment_type")
        .delete()
        .eq("id", id);

      if (error) throw error;
      showMessage("Payment type deleted successfully", "success");
      loadPaymentTypes();
    } catch (error) {
      console.error("Error deleting payment type:", error);
      showMessage("Error deleting payment type: " + error.message, "error");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Payment Types Management</h3>
        {!isAdding && !editingId && (
          <button
            onClick={handleAdd}
            style={{
              padding: "10px 20px",
              background: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            + Add Payment Type
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
            border: `1px solid ${message.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
          }}
        >
          {message.text}
        </div>
      )}

      {(isAdding || editingId) && (
        <div
          style={{
            background: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
            border: "1px solid #dee2e6"
          }}
        >
          <h4>{isAdding ? "Add New Payment Type" : "Edit Payment Type"}</h4>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Payment Type Name:
              </label>
              <input
                type="text"
                value={formData.payment_type_name}
                onChange={(e) => setFormData({ ...formData, payment_type_name: e.target.value })}
                placeholder="e.g., Semi-Annual, Annual, Quarterly"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da"
                }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Months:
              </label>
              <input
                type="number"
                value={formData.months_payment}
                onChange={(e) => setFormData({ ...formData, months_payment: e.target.value })}
                placeholder="e.g., 6, 12, 3"
                min="1"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ced4da"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="submit"
                style={{
                  padding: "10px 20px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                {isAdding ? "Add" : "Update"}
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
                  fontWeight: "bold"
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Payment Type Name</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Months</th>
              <th style={{ padding: "12px", textAlign: "left", fontWeight: "bold" }}>Created At</th>
              <th style={{ padding: "12px", textAlign: "center", fontWeight: "bold" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentTypes.length > 0 ? (
              paymentTypes.map((paymentType) => (
                <tr key={paymentType.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                  <td style={{ padding: "12px" }}>{paymentType.id}</td>
                  <td style={{ padding: "12px", fontWeight: "500" }}>{paymentType.payment_type_name}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      background: "#e3f2fd", 
                      padding: "4px 12px", 
                      borderRadius: "12px",
                      color: "#1976d2",
                      fontWeight: "bold"
                    }}>
                      {paymentType.months_payment} months
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "#6c757d" }}>
                    {new Date(paymentType.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(paymentType)}
                      style={{
                        padding: "6px 12px",
                        background: "#ffc107",
                        color: "#000",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "5px",
                        fontWeight: "bold"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(paymentType.id)}
                      style={{
                        padding: "6px 12px",
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold"
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: "20px", textAlign: "center", color: "#6c757d" }}>
                  No payment types found. Click "Add Payment Type" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}