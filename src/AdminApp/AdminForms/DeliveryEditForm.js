// src/AdminForms/DeliveryEditForm.jsx
import React from "react";
import "../styles/delivery-creation-styles.css";

export default function DeliveryEditForm({
  formData,
  originalData = {},
  policies = [],
  selectedClient = null,
  loading,
  onChange,
  onSubmit,
  onCancel,
  displayAddressText = "",
  addressMeta = { isDefault: false, isDelivered: false },
  onOpenAddressPicker,
}) {
  const clientLabel = selectedClient
    ? `${selectedClient.internal_id} | ${selectedClient.first_Name || ""} ${selectedClient.middle_Name || ""} ${selectedClient.family_Name || ""}`.replace(/\s+/g, " ")
    : "—";

  return (
    <div className="delivery-modal-overlay">
      <div className="delivery-modal-container">
        <button type="button" className="delivery-modal-close-btn" onClick={onCancel} aria-label="Close">
          ✕
        </button>

        <form className="delivery-form" onSubmit={onSubmit}>
          <h2 className="delivery-form-title">Edit Delivery</h2>

          {/* Client (disabled) | Policy (disabled) */}
          <div className="delivery-form-grid delivery-top-two">
            <div className="delivery-form-group">
              <label className="delivery-form-label">Client</label>
              <select
                className="delivery-form-select"
                disabled
                value={selectedClient?.uid || ""}
                style={{ backgroundColor: "#f5f5f5", fontStyle: "italic" }}
                onChange={() => {}}
              >
                <option value={selectedClient?.uid || ""}>{clientLabel}</option>
              </select>
            </div>

            <div className="delivery-form-group">
              <label className="delivery-form-label">Policy</label>
              <select
                name="policyId"
                value={formData.policyId}
                disabled
                className="delivery-form-select"
                style={{ backgroundColor: "#f5f5f5", fontStyle: "italic" }}
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.internal_id ? `#${p.internal_id}` : `Policy #${p.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="delivery-form-grid">
            <div className="delivery-form-group">
              <label className="delivery-form-label">Delivery Date (Original)</label>
              <input
                type="date"
                value={originalData.deliveryDate || ""}
                readOnly
                className="delivery-form-input"
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            <div className="delivery-form-group">
              <label className="delivery-form-label">Est. Delivery Date</label>
              <input
                type="date"
                value={originalData.estDeliveryDate || ""}
                readOnly
                className="delivery-form-input"
                style={{ backgroundColor: "#f5f5f5", marginBottom: "0.3rem" }}
              />
              <input
                type="date"
                name="estDeliveryDate"
                value={formData.estDeliveryDate || ""}
                onChange={onChange}
                className="delivery-form-input"
              />
            </div>
          </div>

          {/* Address with Edit Functionality */}
          <div className="delivery-form-group">
            <label className="delivery-form-label">
              Address{" "}
              {addressMeta.isDefault && (
                <span className="delivery-form-label-secondary">(Default)</span>
              )}
            </label>

            <button
              type="button"
              className={`delivery-form-address-display ${selectedClient ? "clickable" : "disabled"}`}
              onClick={selectedClient ? onOpenAddressPicker : undefined}
              title={selectedClient ? "Click to choose/add address" : "Select a client first"}
            >
              <span>{displayAddressText || "No address on file"}</span>
              <span className="delivery-form-address-right">›</span>
            </button>

            <div className="delivery-form-badges">
              {addressMeta.isDefault && <span className="badge-default">Default</span>}
              {addressMeta.isDelivered && <span className="badge-delivered">Delivered Address</span>}
            </div>
          </div>

          {/* Remarks */}
          <div className="delivery-form-group">
            <label className="delivery-form-label">Special Instruction</label>
            <textarea
              value={originalData.remarks || ""}
              readOnly
              className="delivery-form-textarea"
              style={{ backgroundColor: "#f5f5f5", marginBottom: "0.3rem" }}
            />
            <textarea
              name="remarks"
              value={formData.remarks || ""}
              onChange={onChange}
              placeholder="Update special instruction..."
              rows="4"
              className="delivery-form-textarea"
            />
          </div>

          <div className="delivery-form-actions">
            <button type="button" className="delivery-form-btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="delivery-form-btn-submit" disabled={loading}>
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}