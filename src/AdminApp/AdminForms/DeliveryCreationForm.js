import "../styles/delivery-creation-styles.css";

export default function DeliveryCreationForm({
  formData,
  policies = [],
  loading,
  onChange,
  onSubmit,
  onCancel,
}) {
  const handlePolicySelect = (e) => {
    const val = e.target.value;
    const p = policies.find((x) => String(x.id) === String(val));
    if (p?.hasDelivery) {
      alert("This policy already has a scheduled delivery. Please choose another one.");
      return;
    }
    onChange({ target: { name: "policyId", value: val } });
  };

  const selectedPolicy = policies.find((p) => String(p.id) === String(formData.policyId));
  const selectedHasDelivery = !!selectedPolicy?.hasDelivery;

  return (
    <div className="delivery-creation-container">
      <form className="form-card-delivery-creation" onSubmit={onSubmit}>
        <h2>Delivery Creation Form</h2>

        <div className="form-grid-delivery-creation">
          {/* Policy Selection */}
          <div className="form-group-delivery-creation">
            <label>Policy *</label>
            <select
              name="policyId"
              value={formData.policyId}
              onChange={handlePolicySelect}
              required
            >
              <option value="">-- Select Policy --</option>
              {policies.map((p) => {
                const disabled = !!p.hasDelivery;
                const optionStyle = disabled
                  ? { color: "#9b9b9b", fontStyle: "italic" }
                  : {};
                return (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={disabled}
                    title={disabled ? "Already has a scheduled delivery" : ""}
                    style={optionStyle}
                  >
                    {`Policy ${p.internal_id ? `#${p.internal_id}` : `#${p.id}`} — ${
                      p.policy_type
                    } (${p.policy_inception} to ${p.policy_expiry}) ${
                      disabled ? "— [Already Scheduled]" : ""
                    }`}
                  </option>
                );
              })}
            </select>

            <div className="disabled-note">
              {policies.some((p) => p.hasDelivery)
                ? `Note: ${policies.filter((p) => p.hasDelivery).length} policy(ies) already scheduled.`
                : "No policies are scheduled yet."}
            </div>
          </div>

          {/* Delivery Date */}
          <div className="form-group-delivery-creation">
            <label>Delivery Date</label>
            <input type="date" name="deliveryDate" value={formData.deliveryDate} readOnly />
          </div>

          {/* Est. Delivery Date */}
          <div className="form-group-delivery-creation">
            <label>Est. Delivery Date</label>
            <input
              type="date"
              name="estDeliveryDate"
              value={formData.estDeliveryDate}
              onChange={onChange}
            />
          </div>

          {/* Remarks */}
          <div className="form-group-delivery-creation">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              placeholder="Optional notes..."
            />
          </div>
        </div>

        {/* Form Buttons */}
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
            disabled={loading || selectedHasDelivery}
            title={selectedHasDelivery ? "Selected policy already has a delivery" : ""}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
