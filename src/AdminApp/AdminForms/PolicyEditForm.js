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
  basicPremiumValue, // without commission
  basicPremiumWithCommission, // with commission applied to basic premium
  isAoN,
  setIsAoN,
  setOriginalVehicleCost,
  originalVehicleCost,
  currentVehicleValueCost,
  totalVehicleValueRate,
  totalPremiumCost, // final total (includes commission amount we saved)
  actOfNatureCost,
  commissionRate,
  setCommissionRate,
  commissionValue, // commission in ₱ calculated in controller
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
  onSaveClient,
  navigate
}) {
  const formatPHP = (num, digits = 2) =>
    num != null ? num.toLocaleString("en-PH", { minimumFractionDigits: digits }) : "0.00";

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

            <div className="form-group-policy-edit">
              <label>Commission Fee (%)</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
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

              <p>Original Vehicle Cost: <span>₱ {formatPHP(originalVehicleCost)}</span></p>
              <p>Current Vehicle Value: <span>₱ {formatPHP(currentVehicleValueCost)}</span></p>
              <p>Total Vehicle Value Rate: <span>₱ {formatPHP(totalVehicleValueRate)}</span></p>

              <p>Basic Premium (without Commission): <span>₱ {formatPHP(basicPremiumValue)}</span></p>
              <p>Basic Premium (with Commission): <span>₱ {formatPHP(basicPremiumWithCommission)}</span></p>

              <p>Commission Amount: <span>₱ {formatPHP(commissionValue)}</span></p>

              {isAoN && <p>AoN (Act of Nature): <span>₱ {formatPHP(actOfNatureCost)}</span></p>}
              <hr />
              <strong>
                <p>Total Premium (final): <span>₱ {formatPHP(totalPremiumCost)}</span></p>
              </strong>
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