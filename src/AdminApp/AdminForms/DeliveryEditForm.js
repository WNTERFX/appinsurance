import "../styles/delivery-update-styles.css";

export default function DeliveryEditForm({
  formData,
  originalData = {}, // ✅ default to prevent undefined errors
  policies = [],
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
  const selectedPolicy = policies.find((p) => String(p.id) === String(formData.policyId));

  return (
    <div className="delivery-creation-container">
      <form className="form-card-delivery-creation" onSubmit={onSubmit}>
        <h2>Edit Delivery</h2>

        <div className="form-grid-delivery-creation">
          {/* Policy (Read-only) */}
          <div className="form-group-delivery-creation">
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

          {/* Delivery Date (Read-only) */}
          <div className="form-group-delivery-creation">
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

          {/* Est. Delivery Date (Original + Editable) */}
          <div className="form-group-delivery-creation">
            <label>Est. Delivery Date</label>
            {/* Original fixed value */}
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
            {/* Editable new value */}
            <input
              type="date"
              name="estDeliveryDate"
              value={formData.estDeliveryDate || ""}
              onChange={onChange}
            />
          </div>

          {/* Remarks (Original + Editable) */}
          <div className="form-group-delivery-creation">
            <label>Remarks</label>
            {/* Original remarks */}
            <textarea
              value={originalData.remarks || ""}
              readOnly
              disabled
              style={{
                backgroundColor: "#f5f5f5",
                marginBottom: "0.3rem",
              }}
            />
            {/* Editable textarea */}
            <textarea
              name="remarks"
              value={formData.remarks || ""}
              onChange={onChange}
              placeholder="Update remarks..."
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="delivery-creation-controls">
          <button
            type="button"
            className="delivery-creation-cancel-btn"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="delivery-creation-submit-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
