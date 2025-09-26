import "../moderator-styles/delivery-creation-styles-moderator.css";

export default function ModeratorDeliveryCreationForm({
  formData,
  policies,
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="delivery-creation-container-moderator">
      <form className="form-card-delivery-creation-moderator" onSubmit={onSubmit}>
        <h2>Moderator Delivery Creation</h2>
        <div className="form-grid-delivery-creation-moderator">
          
          {/* Policy ID Dropdown */}
          <div className="form-group-delivery-creation-moderator">
            <label>Policy *</label>
            <select
              name="policyId"
              value={formData.policyId}
              onChange={onChange}
              required
            >
              <option value="">-- Select Policy --</option>
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  Policy #{p.id} - {p.policy_type} ({p.policy_inception} to {p.policy_expiry})
                </option>
              ))}
            </select>
          </div>

          {/* Delivery Date (today, readonly) */}
          <div className="form-group-delivery-creation-moderator">
            <label>Delivery Date</label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              readOnly
            />
          </div>

          {/* Estimated Delivery Date */}
          <div className="form-group-delivery-creation-moderator">
            <label>Est. Delivery Date</label>
            <input
              type="date"
              name="estDeliveryDate"
              value={formData.estDeliveryDate}
              onChange={onChange}
            />
          </div>

          {/* Remarks */}
          <div className="form-group-delivery-creation-moderator">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              placeholder="Optional notes..."
            />
          </div>
        </div>

        <div className="delivery-creation-controls-moderator">
          <button
            type="button"
            className="delivery-creation-cancel-btn-moderator"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="delivery-creation-submit-btn-moderator"
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
