// PolicyEditForm.jsx
import React from "react";
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
  navigate
}) {
  const formatPHP = (num, digits = 2) =>
    num != null ? num.toLocaleString("en-PH", { minimumFractionDigits: digits }) : "0.00";

  // Calculate monthly payment based on selected payment type
  const selectedPaymentTypeObj = paymentTypes?.find(pt => pt.id === Number(selectedPaymentType));
  const months = selectedPaymentTypeObj?.months_payment || 0;
  const monthlyPayment = months > 0 ? (totalPremiumCost / months) : 0;

  return (
    <div className="new-client-policy-edit">
      <div className="form-card-policy-edit">
        <h2>Edit Policy</h2>
        <form className="form-grid-policy-edit">
          {/* LEFT COLUMN */}
          <div className="form-left-column-policy-edit">
            <div className="form-group-policy-edit">
              <label>Client</label>
              <select value={selectedClient?.uid || ""} disabled>
                <option value="">-- Select Client --</option>
                {clients.map(c => (
                  <option key={c.uid} value={c.uid}>
                    {c.first_Name} {c.middle_Name || ""} {c.family_Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-policy-edit">
              <label>Vehicle Maker</label>
              <input type="text" value={vehicleMaker} onChange={(e) => setVehicleMaker(e.target.value)} />
            </div>

            <div className="form-group-policy-edit">
              <label>Vehicle Name</label>
              <input type="text" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} />
            </div>

            <div className="form-group-policy-edit">
              <label>VIN Number</label>
              <input type="text" value={vehicleVinNumber || ""} maxLength={17} onChange={(e) => setVinNumber(e.target.value)} />
              <small style={{ color: vehicleVinNumber?.length >= 17 ? "red" : "gray" }}>
                {vehicleVinNumber?.length || 0}/17 characters
              </small>
            </div>

            <div className="form-group-policy-edit">
              <label>Plate Number</label>
              <input type="text" value={vehiclePlateNumber || ""} onChange={(e) => setPlateNumber(e.target.value)} />
            </div>

            <div className="form-group-policy-edit">
              <label>Engine Serial</label>
              <input type="text" value={vehicleEngineNumber || ""} onChange={(e) => setEngineNumber(e.target.value)} />
            </div>

            <div className="form-group-policy-edit">
              <label>Vehicle Color</label>
              <input type="text" value={vehicleColor || ""} onChange={(e) => setVehicleColor(e.target.value)} />
            </div>

            <div className="form-group-policy-edit">
              <label>Vehicle Year</label>
              <input type="number" value={yearInput || ""} onChange={(e) => setYearInput(Number(e.target.value))} />
            </div>

            <div className="form-group-policy-edit">
              <label>Partner</label>
              <select value={selectedPartner || ""} onChange={(e) => setSelectedPartner(e.target.value)}>
                <option value="">-- Select a Partner --</option>
                {Array.isArray(partners) && partners.map(p => (
                  <option key={p.id} value={p.id}>{p.insurance_Name}</option>
                ))}
              </select>
            </div>

            <div className="form-group-policy-edit">
              <label>Payment Type</label>
              <select
                value={selectedPaymentType || ""}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
              >
                <option value="">-- Select Payment Type --</option>
                {Array.isArray(paymentTypes) &&
                  paymentTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.payment_type_name} ({pt.months_payment} months)
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group-policy-edit">
              <label>Vehicle Type</label>
              <select value={selected || ""} onChange={(e) => setSelected(e.target.value)}>
                <option value="">-- Select Vehicle Type --</option>
                {vehicleTypes.map(v => (
                  <option key={v.id} value={v.vehicle_type}>{v.vehicle_type}</option>
                ))}
              </select>
            </div>

            <div className="form-group-policy-edit">
              <label>Original Value of Vehicle</label>
              <input
                type="text"
                value={originalVehicleCost}
                onChange={(e) => setOriginalVehicleCost(e.target.value === "" ? 0 : parseFloat(e.target.value))}
              />
            </div>

           {/* Taxes & Rates */}
            <div className="form-group-policy-edit">
              <label>VAT Tax</label>
              <input type="text" value={vehicleDetails?.vat_Tax ? `${vehicleDetails.vat_Tax}%` : "0%"} readOnly />
            </div>

            <div className="form-group-policy-edit">
              <label>Documentary Stamp</label>
              <input type="text" value={vehicleDetails?.docu_Stamp ? `${vehicleDetails.docu_Stamp}%` : "0%"} readOnly />
            </div>

            <div className="form-group-policy-edit">
              <label>Local Gov Tax</label>
              <input type="text" value={vehicleDetails?.local_Gov_Tax ? `${vehicleDetails.local_Gov_Tax}%` : "0%"} readOnly />
            </div>

            <div className="form-group-policy-edit">
              <label>Rate</label>
              <input type="text" value={vehicleDetails?.vehicle_Rate ? `${vehicleDetails.vehicle_Rate}%` : "0%"} readOnly />
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
              <input type="checkbox" checked={isAoN} onChange={(e) => setIsAoN(e.target.checked)} />
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
              <div className="local-tax">
              <p>Local Government Tax: <span>{vehicleDetails?.local_Gov_Tax ? `${vehicleDetails.local_Gov_Tax}%` : "—"}</span></p>
              <p>VAT: <span>{vehicleDetails?.vat_Tax ? `${vehicleDetails.vat_Tax}%` : "—"}</span></p>
              <p>Documentary Stamp: <span>{vehicleDetails?.docu_Stamp ? `${vehicleDetails.docu_Stamp}%` : "—"}</span></p>
              {isAoN && <p>AoN (Act of Nature): <span>₱ {formatPHP(actOfNatureCost)}</span></p>}
             
             
              </div>
               <hr />

               <strong>
                <p>Total Premium: <span>₱ {formatPHP(totalPremiumCost)}</span></p>
                <p>Claimable Amount: <span>₱ {formatPHP(currentVehicleValueCost)}</span></p>
              </strong>


              
              {/* Monthly Payment Display */}
              {selectedPaymentType && months > 0 && (
                <div className="monthly-payment-section-policy-edit">
                  <hr />
                  <p className="monthly-payment-label-policy-edit">
                    Estimated Monthly Payment ({months} months):
                  </p>
                  <p className="monthly-payment-amount-policy-edit">
                    ₱ {monthlyPayment.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
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
              <button
                className="confirm-btn-policy-edit"
                type="button"
                onClick={onSaveClient}
              > 
                Confirm
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}