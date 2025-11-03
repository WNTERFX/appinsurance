import React, { useState } from "react";
import "../styles/policy-update-styles.css";

export default function PolicyEditForm({
  vehicleTypes,
  selected,
  setSelected,
  vehicleDetails,
  yearInput,
  setYearInput,
  vehicleOriginalValueFromDB,
  setVehicleOriginalValueFromDB,
  basicPremiumValue,
  basicPremiumWithCommission,
  isAoN,
  setIsAoN,
  setOriginalVehicleCost,
  originalVehicleCost,
  currentVehicleValueCost,
  totalVehicleValueRate,
  totalPremiumCost,
  actOfNatureCost,
  commissionRate,
  setCommissionRate,
  commissionValue,
  vehicleName,
  setVehicleName,
  vehicleMaker,
  setVehicleMaker,
  vehicleColor,
  setVehicleColor,
  vehicleVinNumber,
  setVinNumber,
  vehiclePlateNumber,
  setPlateNumber,
  vehicleEngineNumber,
  setEngineNumber,
  clients,
  selectedClient,
  setSelectedClient,
  partners,
  selectedPartner,
  setSelectedPartner,
  paymentTypes,
  selectedPaymentType,
  setSelectedPaymentType,
  onSaveClient,
  onRenewPolicy,
  isRenewalMode,
  setIsRenewalMode,
  policyExpiry,
  navigate
}) {
  const [errors, setErrors] = useState({});

  const formatPHP = (num, digits = 2) =>
    num != null
      ? num.toLocaleString("en-PH", { minimumFractionDigits: digits })
      : "0.00";

  // Calculate monthly payment
  const selectedPaymentTypeObj = paymentTypes?.find(
    (pt) => pt.id === Number(selectedPaymentType)
  );
  const months = selectedPaymentTypeObj?.months_payment || 0;
  const monthlyPayment = months > 0 ? totalPremiumCost / months : 0;

  const validateForm = () => {
    const newErrors = {};
    if (!vehicleMaker) newErrors.vehicleMaker = true;
    if (!vehicleName) newErrors.vehicleName = true;
    if (!vehicleVinNumber || vehicleVinNumber.length !== 17)
      newErrors.vehicleVinNumber = true;
    if (!vehicleEngineNumber) newErrors.vehicleEngineNumber = true;
    if (!vehiclePlateNumber) newErrors.vehiclePlateNumber = true;
    if (!vehicleColor) newErrors.vehicleColor = true;
    if (!yearInput) newErrors.yearInput = true;
    if (!selectedPartner) newErrors.selectedPartner = true;
    if (!selectedPaymentType) newErrors.selectedPaymentType = true;
    if (!selected) newErrors.selected = true;
    if (!originalVehicleCost) newErrors.originalVehicleCost = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      if (isRenewalMode) {
        onRenewPolicy();
      } else {
        onSaveClient();
      }
    }
  };

  const isNearExpiry = policyExpiry 
    ? new Date(policyExpiry) - new Date() < 30 * 24 * 60 * 60 * 1000 
    : false;

  return (
    <div className="new-client-policy-edit">
      <div className="form-card-policy-edit">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>{isRenewalMode ? 'Renew Policy' : 'Edit Policy'}</h2>
          
          {!isRenewalMode && isNearExpiry && (
            <button
              type="button"
              onClick={() => setIsRenewalMode(true)}
              className="renewal-toggle-btn"
              style={{
                padding: '10px 20px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              Switch to Renewal Mode
            </button>
          )}
          
          {isRenewalMode && (
            <button
              type="button"
              onClick={() => setIsRenewalMode(false)}
              className="renewal-toggle-btn"
              style={{
                padding: '10px 20px',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              ← Back to Edit Mode
            </button>
          )}
        </div>

        {isRenewalMode && (
          <div style={{
            background: '#dbeafe',
            border: '1px solid #3b82f6',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <strong>Renewal Mode Active:</strong> This will create a new policy period starting from the current expiry date ({new Date(policyExpiry).toLocaleDateString()}). 
            The vehicle value will be automatically recalculated based on the vehicle year.
          </div>
        )}

        <form className="form-grid-policy-edit">
          {/* LEFT COLUMN */}
          <div className="form-left-column-policy-edit">
            <div className="form-group-policy-edit">
              <label>Client</label>
              <select value={selectedClient?.uid || ""} disabled>
                <option value="">-- Select Client --</option>
                {clients.map((c) => (
                  <option key={c.uid} value={c.uid}>
                    {c.first_Name} {c.middle_Name || ""} {c.family_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className={`form-group-policy-edit ${errors.vehicleMaker ? "error" : ""}`}>
              <label>Maker <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                value={vehicleMaker}
                onChange={(e) => {
                  setVehicleMaker(e.target.value);
                  setErrors((p) => ({ ...p, vehicleMaker: false }));
                }}
                style={{ borderColor: errors.vehicleMaker ? "red" : "" }}
              />
              {errors.vehicleMaker && <small style={{ color: "red" }}>Make Model is required</small>}
            </div>

            <div className={`form-group-policy-edit ${errors.vehicleName ? "error" : ""}`}>
              <label>Model <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                value={vehicleName}
                onChange={(e) => {
                  setVehicleName(e.target.value);
                  setErrors((p) => ({ ...p, vehicleName: false }));
                }}
                style={{ borderColor: errors.vehicleName ? "red" : "" }}
              />
              {errors.vehicleName && <small style={{ color: "red" }}>Vehicle Name is required</small>}
            </div>

            <div className={`form-group-policy-edit ${errors.vehicleVinNumber ? "error" : ""}`}>
              <label>VIN Number <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                value={vehicleVinNumber || ""}
                maxLength={17}
                onChange={(e) => {
                  setVinNumber(e.target.value);
                  setErrors((p) => ({ ...p, vehicleVinNumber: false }));
                }}
                style={{
                  borderColor: errors.vehicleVinNumber ? 'red' : '',
                  textTransform: 'uppercase'
                }}
              />
              <small style={{
                color: vehicleVinNumber?.length >= 17 ? "green" : errors.vehicleVinNumber ? "red" : "gray",
              }}>
                {vehicleVinNumber?.length || 0}/17 characters {errors.vehicleVinNumber && "- Must be 17 characters"}
              </small>
            </div>

            <div className={`form-group-policy-edit ${errors.vehiclePlateNumber ? "error" : ""}`}>
              <label>Vehicle Plate Number <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                value={vehiclePlateNumber || ""}
                onChange={(e) => {
                  setPlateNumber(e.target.value);
                  setErrors((p) => ({ ...p, vehiclePlateNumber: false }));
                }}
                maxLength={8}
                style={{
                  borderColor: errors.vehiclePlateNumber ? 'red' : '',
                  textTransform: 'uppercase'
                }}
              />
              <small style={{
                color: vehiclePlateNumber?.length >= 8 ? "green" : errors.vehiclePlateNumber ? "red" : "gray",
              }}>
                {vehiclePlateNumber?.length || 0}/8 characters {errors.vehiclePlateNumber && "- Required"}
              </small>
            </div>

            <div className={`form-group-policy-edit ${errors.vehicleEngineNumber ? "error" : ""}`}>
              <label>Vehicle Engine Serial <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                value={vehicleEngineNumber || ""}
                onChange={(e) => {
                  setEngineNumber(e.target.value);
                  setErrors((p) => ({ ...p, vehicleEngineNumber: false }));
                }}
                style={{
                  borderColor: errors.vehicleEngineNumber ? 'red' : '',
                  textTransform: 'uppercase'
                }}
              />
              {errors.vehicleEngineNumber && <small style={{ color: "red" }}>Engine Serial is required</small>}
            </div>

            <div className={`form-group-policy-edit ${errors.vehicleColor ? "error" : ""}`}>
              <label>Vehicle Color <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                value={vehicleColor || ""}
                onChange={(e) => {
                  setVehicleColor(e.target.value);
                  setErrors((p) => ({ ...p, vehicleColor: false }));
                }}
                style={{
                  borderColor: errors.vehicleColor ? 'red' : '',
                  textTransform: 'uppercase'
                }}
              />
              {errors.vehicleColor && <small style={{ color: "red" }}>Vehicle Color is required</small>}
            </div>

            <div className={`form-group-policy-edit ${errors.yearInput ? "error" : ""}`}>
              <label>Vehicle Year <span style={{ color: "red" }}>*</span></label>
              <input
                type="number"
                value={yearInput || ""}
                onChange={(e) => {
                  setYearInput(Number(e.target.value));
                  setErrors((p) => ({ ...p, yearInput: false }));
                }}
                style={{ borderColor: errors.yearInput ? "red" : "" }}
              />
              {errors.yearInput && <small style={{ color: "red" }}>Vehicle Year is required</small>}
            </div>

            <div className={`form-group-policy-edit ${errors.selectedPartner ? "error" : ""}`}>
              <label>Partner <span style={{ color: "red" }}>*</span></label>
              <select
                value={selectedPartner || ""}
                onChange={(e) => {
                  setSelectedPartner(e.target.value);
                  setErrors((p) => ({ ...p, selectedPartner: false }));
                }}
                style={{ borderColor: errors.selectedPartner ? "red" : "" }}
              >
                <option value="">-- Select a Partner --</option>
                {Array.isArray(partners) &&
                  partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.insurance_Name}
                    </option>
                  ))}
              </select>
              {errors.selectedPartner && <small style={{ color: "red" }}>Partner is required</small>}
            </div>

            <div className={`form-group-policy-edit ${errors.selectedPaymentType ? "error" : ""}`}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Payment Type 
                
                <span style={{ color: "red" }}>*</span>
                 <span 
                      title="This is to set the default value of the payment type, this can be changed later in the payment generation."
                      className="tooltip-icon" 
                    >
                      ?
                </span>
                
                </label>
              <select
                value={selectedPaymentType || ""}
                onChange={(e) => {
                  setSelectedPaymentType(e.target.value);
                  setErrors((p) => ({ ...p, selectedPaymentType: false }));
                }}
                style={{ borderColor: errors.selectedPaymentType ? "red" : "" }}
              >
                <option value="">-- Select Payment Type --</option>
                {Array.isArray(paymentTypes) &&
                  paymentTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.payment_type_name} ({pt.months_payment} months)
                    </option>
                  ))}
              </select>
              {errors.selectedPaymentType && <small style={{ color: "red" }}>Payment Type is required</small>}
            </div>

            <div className={`form-group-policy-edit ${errors.selected ? "error" : ""}`}>
              <label>Vehicle Type <span style={{ color: "red" }}>*</span></label>
              <select
                value={selected || ""}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setErrors((p) => ({ ...p, selected: false }));
                }}
                style={{ borderColor: errors.selected ? "red" : "" }}
              >
                <option value="">-- Select Vehicle Type --</option>
                {vehicleTypes.map((v) => (
                  <option key={v.id} value={v.vehicle_type}>
                    {v.vehicle_type}
                  </option>
                ))}
              </select>
              {errors.selected && <small style={{ color: "red" }}>Vehicle Type is required</small>}
            </div>

            <div className={`form-group-policy-edit ${errors.originalVehicleCost ? "error" : ""}`}>
              <label>Original Value of Vehicle <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                value={originalVehicleCost}
                onChange={(e) => {
                  setOriginalVehicleCost(e.target.value === "" ? 0 : parseFloat(e.target.value));
                  setErrors((p) => ({ ...p, originalVehicleCost: false }));
                }}
                style={{ borderColor: errors.originalVehicleCost ? "red" : "" }}
              />
              {errors.originalVehicleCost && <small style={{ color: "red" }}>Vehicle Cost is required</small>}
            </div>

            <div className="form-group-policy-edit">
              <label>VAT Tax</label>
              <input
                type="text"
                value={vehicleDetails?.vat_Tax ? `${vehicleDetails.vat_Tax}%` : "0%"}
                readOnly
              />
            </div>

            <div className="form-group-policy-edit">
              <label>Documentary Stamp</label>
              <input
                type="text"
                value={vehicleDetails?.docu_Stamp ? `${vehicleDetails.docu_Stamp}%` : "0%"}
                readOnly
              />
            </div>

            <div className="form-group-policy-edit">
              <label>Local Gov Tax</label>
              <input
                type="text"
                value={vehicleDetails?.local_Gov_Tax ? `${vehicleDetails.local_Gov_Tax}%` : "0%"}
                readOnly
              />
            </div>

            <div className="form-group-policy-edit">
              <label>Rate</label>
              <input
                type="text"
                value={vehicleDetails?.vehicle_Rate ? `${vehicleDetails.vehicle_Rate}%` : "0%"}
                readOnly
              />
            </div>

            <div className="form-group-policy-edit">
              <label>Commission Fee (%)</label>
              <input
                type="text"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
            </div>

            <div className="form-group-policy-edit">
              <label>Act of Nature (AoN)</label>
              <input
                type="checkbox"
                checked={isAoN}
                onChange={(e) => setIsAoN(e.target.checked)}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="form-right-column-policy-edit">
            <div className="calculation-card-policy-edit">
              <h3>Calculation Summary</h3>
              <div className="vehicle-val">
                <p>Original Vehicle Cost: <span>₱ {formatPHP(originalVehicleCost)}</span></p>
                <p>Current Vehicle Value: <span>₱ {formatPHP(currentVehicleValueCost)}</span></p>
                <p>Total Vehicle Value Rate: <span>₱ {formatPHP(totalVehicleValueRate)}</span></p>
              </div>
              <div className="own-tax">
                <p>Bodily Injury: <span>₱ {formatPHP(vehicleDetails?.bodily_Injury)}</span></p>
                <p>Property Damage: <span>₱ {formatPHP(vehicleDetails?.property_Damage)}</span></p>
                <p>Personal Accident: <span>₱ {formatPHP(vehicleDetails?.personal_Accident)}</span></p>
              </div>
              <div className="basic-prem">
                <p>Commission Amount: <span>₱ {formatPHP(commissionValue)}</span></p>
                <p>Basic Premium (without Commission): <span>₱ {formatPHP(basicPremiumValue)}</span></p>
                <p>Basic Premium (with Commission): <span>₱ {formatPHP(basicPremiumWithCommission)}</span></p>
              </div>

              {isAoN && (
                <p>AoN (Act of Nature): <span>₱ {formatPHP(actOfNatureCost)}</span></p>
              )}

              <hr />
              <strong>
                <p>Total Premium: <span>₱ {formatPHP(totalPremiumCost)}</span></p>
                <p>Claimable Amount: <span>₱ {formatPHP(currentVehicleValueCost)}</span></p>
              </strong>

              {/* 🆕 Monthly Payment Breakdown */}
              {selectedPaymentType && months > 0 && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                    Monthly Payment Schedule ({months} months)
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '14px' }}>
                    {Array.from({ length: months }, (_, i) => (
                      <div key={i} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        padding: '6px 8px',
                        borderBottom: '1px solid #e0e0e0',
                        background: i % 2 === 0 ? 'white' : '#f8f9fa'
                      }}>
                        <span style={{ fontWeight: '500' }}>Month {i + 1}:</span>
                        <span style={{ color: '#10b981', fontWeight: '600' }}>
                          ₱{monthlyPayment.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="button-container-policy-edit">
              <button
                className="cancel-btn-policy-edit"
                type="button"
                onClick={() => navigate("/appinsurance/main-app/policy")}
              >
                Cancel
              </button>

              {!isRenewalMode && (
                <button
                  className="confirm-btn-policy-edit"
                  type="button"
                  onClick={() => {
                    setIsRenewalMode(false);
                    handleConfirm();
                  }}
                >
                  Confirm Update
                </button>
              )}

              {isRenewalMode && (
                <button
                  className="renew-btn-policy-edit"
                  type="button"
                  onClick={() => handleConfirm()}
                  style={{
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 20px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '14px',
                  }}
                >
                  Renew Policy
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}