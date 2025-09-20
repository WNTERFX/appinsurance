import React from "react";
import '../styles/policy-update-styles.css';

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
  isAoN,
  setIsAoN,
  setOriginalVehicleCost,
  originalVehicleCost,
  currentVehicleValueCost,
  totalVehicleValueRate,
  totalPremiumCost,
  actOfNatureCost,
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

  const formatPHP = (num, digits = 2) => {
    return num != null ? num.toLocaleString("en-PH", { minimumFractionDigits: digits }) : "0.00";
  }

  return (
    <div className="new-client-policy-edit">
      <h2>Edit Policy</h2>

      <div className="form-card-policy-edit">
        <form className="form-grid-policy-edit">

          {/* LEFT COLUMN */}
          <div className="form-left-column-policy-edit">

            {/* Client */}
            <div className="form-group-policy-edit">
              <label>Client</label>
              <select
                value={selectedClient?.uid || ""}
                onChange={(e) => {
                  const client = clients.find(c => c.uid === e.target.value);
                  setSelectedClient(client);
                }}
                disabled
              >
                <option value="">-- Select Client --</option>
                {clients.map(c => (
                  <option key={c.uid} value={c.uid}>
                    {c.first_Name} {c.middle_Name || ""} {c.family_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Maker */}
            <div className="form-group-policy-edit">
              <label>Vehicle Maker</label>
              <input type="text" value={vehicleMaker} disabled />
              <input type="text" value={vehicleMaker} onChange={(e) => setVehicleMaker(e.target.value)} />
            </div>

            {/* Vehicle Name */}
            <div className="form-group-policy-edit">
              <label>Previous Vehicle Name</label>
              <input type="text" value={vehicleName} disabled />
              <input type="text" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} />
            </div>

            {/* Vehicle VIN */}
            <div className="form-group-policy-edit">
              <label>Vehicle VIN Number</label>
              <input type="text" value={vehicleVinNumber || ""} maxLength={17} disabled />
              <input type="text" value={vehicleVinNumber || ""} maxLength={17} onChange={(e) => setVinNumber(e.target.value)} />
              <small style={{ color: vehicleVinNumber?.length >= 17 ? "red" : "gray" }}>
                {vehicleVinNumber?.length || 0}/17 characters
              </small>
            </div>

            {/* Vehicle Plate */}
            <div className="form-group-policy-edit">
              <label>Vehicle Plate Number</label>
              <input type="text" value={vehiclePlateNumber || ""} disabled />
              <input type="text" value={vehiclePlateNumber || ""} onChange={(e) => setPlateNumber(e.target.value)} />
            </div>

            {/* Vehicle Engine Number */}
            <div className="form-group-policy-edit">
              <label>Vehicle Engine Serial</label>
              <input type="text" value={vehicleEngineNumber || ""} disabled />
              <input type="text" value={vehicleEngineNumber || ""} onChange={(e) => setEngineNumber(e.target.value)} />
            </div>

            {/* Vehicle Color */}
            <div className="form-group-policy-edit">
              <label>Vehicle Color</label>
              <input type="text" value={vehicleColor || ""} disabled />
              <input type="text" value={vehicleColor || ""} onChange={(e) => setVehicleColor(e.target.value)} />
            </div>

            {/* Vehicle Year */}
            <div className="form-group-policy-edit">
              <label>Vehicle Year</label>
              <input type="text" value={yearInput || ""} disabled />
              <input type="number" value={yearInput || ""} onChange={(e) => setYearInput(Number(e.target.value))} />
            </div>

            {/* Partner */}
            <div className="form-group-policy-edit">
              <label>Partner</label>
              <select value={selectedPartner || ""} onChange={(e) => setSelectedPartner(e.target.value)}>
                <option value="">-- Select a Partner --</option>
                {Array.isArray(partners) && partners.map(p => (
                  <option key={p.id} value={p.id}>{p.insurance_Name}</option>
                ))}
              </select>
            </div>

            {/* Vehicle Type */}
            <div className="form-group-policy-edit">
              <label>Vehicle Type</label>
              <select value={selected || ""} onChange={(e) => setSelected(e.target.value)}>
                <option value="">-- Select Vehicle Type --</option>
                {vehicleTypes.map(v => (
                  <option key={v.id} value={v.vehicle_type}>{v.vehicle_type}</option>
                ))}
              </select>
            </div>

            {/* Vehicle Original Cost */}
            <div className="form-group-policy-edit">
              <label>Original Value of Vehicle</label>
              <input type="text" value={vehicleOriginalValueFromDB} disabled />
              <input
                type="number"
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

            {/* AoN */}
            <div className="form-group-policy-edit">
              <label>AoN (Act of Nature)</label>
              <input type="checkbox" checked={isAoN} onChange={(e) => setIsAoN(e.target.checked)} />
            </div>

            <div className="form-group-policy-edit">
              <label>Rate</label>
              <input type="text" value={vehicleDetails?.vehicle_Rate ? `${vehicleDetails.vehicle_Rate}%` : "0%"} readOnly />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="form-right-column-policy-edit">
            <div className="calculation-card-policy-edit">
              <h3>Calculation Summary</h3>

              <p>Original Vehicle Cost: <span>₱ {formatPHP(originalVehicleCost)}</span></p>
              <p>Current Vehicle Value: <span>₱ {formatPHP(currentVehicleValueCost)}</span></p>
              <p>Total Vehicle Value Rate: <span>₱ {formatPHP(totalVehicleValueRate)}</span></p>
              <p>Bodily Injury: <span>₱ {formatPHP(vehicleDetails?.bodily_Injury)}</span></p>
              <p>Property Damage: <span>₱ {formatPHP(vehicleDetails?.property_Damage)}</span></p>
              <p>Personal Accident: <span>₱ {formatPHP(vehicleDetails?.personal_Accident)}</span></p>
              <p>Basic Premium: <span>₱ {formatPHP(basicPremiumValue)}</span></p>
              <p>Local Government Tax: <span>{vehicleDetails?.local_Gov_Tax ? `${vehicleDetails.local_Gov_Tax}%` : "—"}</span></p>
              <p>VAT: <span>{vehicleDetails?.vat_Tax ? `${vehicleDetails.vat_Tax}%` : "—"}</span></p>
              <p>Documentary Stamp: <span>{vehicleDetails?.docu_Stamp ? `${vehicleDetails.docu_Stamp}%` : "—"}</span></p>
              {isAoN && <p>AoN (Act of Nature): <span>₱ {formatPHP(actOfNatureCost)}</span></p>}
              <hr />
              <strong>
                <p>Total Premium: <span>₱ {formatPHP(totalPremiumCost)}</span></p>
              </strong>
            </div>
          </div>

        </form>
      </div>

      {/* Buttons */}
      <div className="button-container-policy-edit">
        <button
          className="cancel-btn-policy-edit"
          onClick={() => navigate("/appinsurance/MainArea/Policy")}
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
  );
}
