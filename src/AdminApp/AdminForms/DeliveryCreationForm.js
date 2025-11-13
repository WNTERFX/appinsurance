// src/AdminForms/DeliveryCreationForm.jsx
import React, { useMemo } from "react";
import Select from "react-select";
import "../styles/delivery-creation-styles.css";

export default function DeliveryCreationForm({
  formData,
  policies = [],
  clients = [],
  selectedClient = null,
  setSelectedClient,
  loading,
  onChange,
  onSubmit,
  onCancel,
  displayAddressText = "",
  addressMeta = { isDefault: false, isDelivered: false },
  onOpenAddressPicker,
}) {
  const lifoByDateOrId = (a, b) => {
    const ad = a?.created_at ? new Date(a.created_at).getTime() : 0;
    const bd = b?.created_at ? new Date(b.created_at).getTime() : 0;
    if (ad !== bd) return bd - ad;
    const num = (v) => Number(String(v ?? "").replace(/\D/g, "")) || 0;
    const ai = num(a?.internal_id);
    const bi = num(b?.internal_id);
    if (ai !== bi) return bi - ai;
    if (a?.id && b?.id && a.id !== b.id) return Number(b.id) - Number(a.id);
    return String(b?.uid ?? "").localeCompare(String(a?.uid ?? ""));
  };

  const lifoClients = useMemo(() => [...(clients || [])].sort(lifoByDateOrId), [clients]);

  const filteredPolicies = useMemo(() => {
    const base = selectedClient
      ? (policies || []).filter((p) => String(p.client_id) === String(selectedClient.uid))
      : (policies || []);
    return [...base].sort(lifoByDateOrId);
  }, [policies, selectedClient]);

  const clientOptions = useMemo(
    () =>
      lifoClients.map((c) => ({
        value: c.uid,
        label: `${c.internal_id} | ${c.first_Name || ""} ${c.middle_Name || ""} ${c.family_Name || ""}`.replace(
          /\s+/g,
          " "
        ),
        data: {
          id: c.internal_id ?? "",
          first: c.first_Name ?? "",
          middle: c.middle_Name ?? "",
          last: c.family_Name ?? "",
        },
      })),
    [lifoClients]
  );

  const clientValue = selectedClient
    ? {
        value: selectedClient.uid,
        label: `${selectedClient.internal_id} | ${selectedClient.first_Name || ""} ${selectedClient.middle_Name || ""} ${selectedClient.family_Name || ""}`.replace(
          /\s+/g,
          " "
        ),
      }
    : null;

  const handleClientChange = (option) => {
    const next =
      option && clients.find((c) => String(c.uid) === String(option.value));
    if (typeof setSelectedClient === "function") setSelectedClient(next || null);

    if (formData?.policyId) {
      const stillValid = filteredPolicies.some(
        (p) => String(p.id) === String(formData.policyId)
      );
      if (!stillValid && typeof onChange === "function") {
        onChange({ target: { name: "policyId", value: "" } });
      }
    }
  };

  const filterOption = (option, input) => {
    if (!input) return true;
    const hay = `${option.label} ${option.data?.id} ${option.data?.first} ${option.data?.middle} ${option.data?.last}`.toLowerCase();
    return hay.includes(input.toLowerCase());
  };

  const handlePolicySelect = (e) => {
    const val = e.target.value;
    const p = filteredPolicies.find((x) => String(x.id) === String(val));
    if (p?.hasDelivery) {
      alert("This policy already has a scheduled delivery. Please choose another policy.");
      return;
    }
    if (typeof onChange === "function") {
      onChange({ target: { name: "policyId", value: val } });
    }
  };

  return (
    <div className="delivery-modal-overlay">
      <div className="delivery-modal-container">
        <button
          onClick={onCancel}
          type="button"
          className="delivery-modal-close-btn"
          aria-label="Close"
        >
          ✕
        </button>

        <form onSubmit={onSubmit} className="delivery-form">
          <h2 className="delivery-form-title">Schedule Policy Delivery</h2>

          <div className="delivery-form-grid delivery-top-two">
            <div className="delivery-form-group">
              <label className="delivery-form-label">
                Client <span style={{ color: "red" }}>*</span>
              </label>
              <Select
                classNamePrefix="delivery-select"
                className="delivery-select"
                options={clientOptions}
                value={clientValue}
                onChange={handleClientChange}
                placeholder="Search for ID..."
                isClearable
                isSearchable
                filterOption={filterOption}
              />
            </div>

            <div className="delivery-form-group">
              <label className="delivery-form-label">Policy *</label>
              <select
                name="policyId"
                value={formData.policyId}
                onChange={handlePolicySelect}
                required
                className="delivery-form-select"
                disabled={!selectedClient}
                title={!selectedClient ? "Select a client first" : ""}
              >
                <option value="">-- Select Policy --</option>
                {filteredPolicies.map((p) => {
                  const disabled = !!p.hasDelivery;
                  return (
                    <option
                      key={p.id}
                      value={p.id}
                      disabled={disabled}
                      style={disabled ? { color: "#9b9b9b", fontStyle: "italic" } : {}}
                    >
                      {p.internal_id ? `#${p.internal_id}` : `Policy #${p.id}`}
                      {disabled ? " — [Already Scheduled]" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="delivery-form-grid">
            <div className="delivery-form-group">
              <label className="delivery-form-label">Delivery Date</label>
              <input
                type="date"
                name="deliveryDate"
                value={formData.deliveryDate}
                readOnly
                className="delivery-form-input"
              />
            </div>

            <div className="delivery-form-group">
              <label className="delivery-form-label">Estimated Delivery Date *</label>
              <input
                type="date"
                name="estDeliveryDate"
                value={formData.estDeliveryDate}
                onChange={onChange}
                required
                className="delivery-form-input"
              />
            </div>
          </div>

          {/* Address */}
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

          <div className="delivery-form-group">
            <label className="delivery-form-label">Special Instruction</label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={onChange}
              placeholder="Enter any special delivery instruction"
              rows="4"
              className="delivery-form-textarea"
            />
          </div>

          <div className="delivery-form-actions">
            <button type="button" onClick={onCancel} className="delivery-form-btn-cancel">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedClient}
              className="delivery-form-btn-submit"
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}