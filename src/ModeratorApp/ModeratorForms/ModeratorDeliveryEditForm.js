// 📁 src/ModeratorApp/ModeratorForms/ModeratorDeliveryEditForm.js
import "../moderator-styles/delivery-update-styles-moderator.css";

export default function ModeratorDeliveryEditForm({
  formData,
  originalData = {},
  policies = [],
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
        const selectedPolicy = policies.find((p) => String(p.id) === String(formData.policyId));

  return (
    <div className="delivery-update-container-moderator">
      <form className="form-card-delivery-update-moderator" onSubmit={onSubmit}>
        <h2>Edit Delivery</h2>

        <div className="form-grid-delivery-update-moderator">
          {/* Policy (read-only) */}
          <div className="form-group-delivery-update-moderator">
            <label>Policy *</label>
            <select
              name="policyId"
              value={formData.policyId}
              disabled
              style={{
                appearance: "none",
                backgroundColor: "#f5f5f5",
                pointerEvents: "none",
                fontStyle: "italic",
              }}
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  Policy {p.internal_id ? `#${p.internal_id}` : `#${p.id}`} — {p.policy_type} (
                  {p.policy_inception} to {p.policy_expiry})
                  {String(formData.policyId) === String(p.id)
                  
                    ? " — [Already Scheduled]"
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Date (read-only) */}
          <div className="form-group-delivery-update-moderator">
            <label>Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={originalData.deliveryDate || ""}
              readOnly
              disabled
              style={{ backgroundColor: "#f5f5f5" }}
            />
          </div>

          {/* Est. Delivery Date */}
          <div className="form-group-delivery-update-moderator">
            <label>Est. Delivery Date</label>
            <input
              type="date"
              value={originalData.estDeliveryDate || ""}
              readOnly
              disabled
              style={{
                backgroundColor: "#f5f5f5",
                marginBottom: "0.3rem",
              }}
            />
            <input
              type="date"
              name="estDeliveryDate"
              value={formData.estDeliveryDate || ""}
              onChange={onChange}
            />
          </div>

          {/* Remarks */}
          <div className="form-group-delivery-update-moderator">
            <label>Remarks</label>
            <textarea
              value={originalData.remarks || ""}
              readOnly
              disabled
              style={{
                backgroundColor: "#f5f5f5",
                marginBottom: "0.3rem",
              }}
            />
            <textarea
              name="remarks"
              value={formData.remarks || ""}
              onChange={onChange}
              placeholder="Update remarks..."
            />
          </div>
        </div>

        <div className="delivery-update-controls-moderator">
          <button
            type="button"
            className="delivery-update-cancel-btn-moderator"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="delivery-update-submit-btn-moderator"
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
