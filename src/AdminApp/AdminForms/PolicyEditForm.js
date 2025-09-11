import React from "react";
import "../styles/policy-update-styles.css";

export default function PolicyEditForm({
  vehicleTypes,
  selected,
  setSelected,
  vehicleDetails,
  yearInput,
  setYearInput,   
  vehicleCost,
  setVehicleCost,  
  basicPremiumValue,         
  isAoN,
  setIsAoN,
  orginalVehicleCost,
  currentVehicleValueCost,
  totalVehicleValueRate,
  totalPremiumCost,
  actOfNatureCost,
  setSelectedPartner,
  vehicleName,
  setVehicleName,
  vehicleColor,
  setVehicleColor,
  vehicleVinNumber,
  setVinNumber,
  vehiclePlateNumber,
  setPlateNumber,
  clients,
  selectedClient,
  setSelectedClient,
  partners,
  selectedPartner,
  onSaveClient,
  navigate
}) {

  // State for updated values
  const [updatedValues, setUpdatedValues] = React.useState({
    vehicleName: vehicleName,
    vehicleVinNumber: vehicleVinNumber,
    vehiclePlateNumber: vehiclePlateNumber,
    vehicleColor: vehicleColor,
    yearInput: yearInput,
    vehicleCost: vehicleCost,
    selectedPartner: selectedPartner,
    selected: selected,
    isAoN: isAoN,
  });

  const handleChange = (field, value) => {
    setUpdatedValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="new-client-policy-edit">
      <h2>Edit Policy</h2>

      <div className="form-card-policy-edit">
        <form className="form-grid-policy-edit">
          {/* Left Column */}
          <div className="form-left-column-policy-edit">

            {/* Client */}
            <div className="form-group-policy-edit">
              <label>Client (Original)</label>
              <input type="text" value={`${selectedClient?.first_Name} ${selectedClient?.middle_Name || ""} ${selectedClient?.family_Name}`} disabled />
            </div>

            <div className="form-group-policy-edit">
              <label>Client (Updated)</label>
              <select
                value={updatedValues.selectedClient?.uid || ""}
                onChange={(e) => {
                  const client = clients.find(c => c.uid === e.target.value);
                  handleChange("selectedClient", client);
                }}
              >
                <option value="">-- Select Client --</option>
                {clients.map(c => (
                  <option key={c.uid} value={c.uid}>
                    {c.first_Name} {c.middle_Name || ""} {c.family_Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Name */}
            <div className="form-group-policy-edit">
              <label>Vehicle Name (Original)</label>
              <input type="text" value={vehicleName} disabled />
            </div>
            <div className="form-group-policy-edit">
              <label>Vehicle Name (Updated)</label>
              <input type="text" value={updatedValues.vehicleName} onChange={(e) => handleChange("vehicleName", e.target.value)} />
            </div>

            {/* Vehicle VIN */}
            <div className="form-group-policy-edit">
              <label>Vehicle VIN Number (Original)</label>
              <input type="text" value={vehicleVinNumber} disabled />
            </div>
            <div className="form-group-policy-edit">
              <label>Vehicle VIN Number (Updated)</label>
              <input type="text" value={updatedValues.vehicleVinNumber} maxLength={17} onChange={(e) => handleChange("vehicleVinNumber", e.target.value)} />
            </div>

            {/* Vehicle Plate */}
            <div className="form-group-policy-edit">
              <label>Vehicle Plate Number (Original)</label>
              <input type="text" value={vehiclePlateNumber} disabled />
            </div>
            <div className="form-group-policy-edit">
              <label>Vehicle Plate Number (Updated)</label>
              <input type="text" value={updatedValues.vehiclePlateNumber} onChange={(e) => handleChange("vehiclePlateNumber", e.target.value)} />
            </div>

            {/* Vehicle Color */}
            <div className="form-group-policy-edit">
              <label>Vehicle Color (Original)</label>
              <input type="text" value={vehicleColor} disabled />
            </div>
            <div className="form-group-policy-edit">
              <label>Vehicle Color (Updated)</label>
              <input type="text" value={updatedValues.vehicleColor} onChange={(e) => handleChange("vehicleColor", e.target.value)} />
            </div>

            {/* Vehicle Year */}
            <div className="form-group-policy-edit">
              <label>Vehicle Year (Original)</label>
              <input type="text" value={yearInput} disabled />
            </div>
            <div className="form-group-policy-edit">
              <label>Vehicle Year (Updated)</label>
              <input type="text" value={updatedValues.yearInput} onChange={(e) => handleChange("yearInput", Number(e.target.value))} />
            </div>

            {/* Partner */}
            <div className="form-group-policy-edit">
              <label>Partner (Original)</label>
              <input type="text" value={selectedPartner} disabled />
            </div>
            <div className="form-group-policy-edit">
              <label>Partner (Updated)</label>
              <select value={updatedValues.selectedPartner} onChange={(e) => handleChange("selectedPartner", e.target.value)}>
                <option value="">-- Select a Partner --</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.insurance_Name}</option>)}
              </select>
            </div>

            {/* Vehicle Type */}
            <div className="form-group-policy-edit">
              <label>Vehicle Type (Original)</label>
              <input type="text" value={selected} disabled />
            </div>
            <div className="form-group-policy-edit">
              <label>Vehicle Type (Updated)</label>
              <select value={updatedValues.selected} onChange={(e) => handleChange("selected", e.target.value)}>
                <option value="">-- Select Vehicle Type --</option>
                {vehicleTypes.map(v => <option key={v.id} value={v.vehicle_type}>{v.vehicle_type}</option>)}
              </select>
            </div>

            {/* Vehicle Cost */}
            <div className="form-group-policy-edit">
              <label>Original Value of Vehicle</label>
              <input type="text" value={vehicleCost} disabled />
            </div>
            <div className="form-group-policy-edit">
              <label>Updated Value of Vehicle</label>
              <input type="text" value={updatedValues.vehicleCost} onChange={(e) => handleChange("vehicleCost", Number(e.target.value))} />
            </div>

            {/* AoN */}
            <div className="form-group-policy-edit aon-row">
              <label>AoN (Original)</label>
              <input type="checkbox" checked={isAoN} disabled />
            </div>
            <div className="form-group-policy-edit aon-row">
              <label>AoN (Updated)</label>
              <input type="checkbox" checked={updatedValues.isAoN} onChange={(e) => handleChange("isAoN", e.target.checked)} />
            </div>

            {/* Buttons */}
            <div className="button-container-policy-edit">
              <button type="button" className="confirm-btn-policy-edit" onClick={() => onSaveClient(updatedValues)}>Save</button>
              <button type="button" className="cancel-btn-policy-edit" onClick={() => navigate("/appinsurance/MainArea/Policy")}>Cancel</button>
            </div>
          </div>

          {/* Right Column - Calculation Cards */}
          <div className="form-right-column-policy-edit">
            <div className="calculation-card-policy-edit">
              <h3>Original Calculation</h3>
              <p>Original Vehicle Cost: <span>₱ {orginalVehicleCost.toLocaleString("en-PH")}</span></p>
              <p>Current Vehicle Value: <span>₱ {currentVehicleValueCost.toLocaleString("en-PH")}</span></p>
              <p>Total Vehicle Value Rate: <span>₱ {totalVehicleValueRate.toLocaleString("en-PH")}</span></p>
              <p>Basic Premium: <span>₱ {basicPremiumValue?.toLocaleString("en-PH") || "-"}</span></p>
              {isAoN && <p>AoN: <span>₱ {actOfNatureCost.toLocaleString("en-PH")}</span></p>}
              <p>Total Premium: <span>₱ {totalPremiumCost.toLocaleString("en-PH")}</span></p>
            </div>

            <div className="calculation-card-policy-edit">
              <h3>Updated Calculation</h3>
              <p>Updated Vehicle Cost: <span>₱ {updatedValues.vehicleCost?.toLocaleString("en-PH") || "-"}</span></p>
              <p>Updated Vehicle Value: <span>₱ {updatedValues.vehicleCost ? updatedValues.vehicleCost.toLocaleString("en-PH") : "-"}</span></p>
              <p>Total Vehicle Value Rate: <span>₱ {updatedValues.vehicleCost ? updatedValues.vehicleCost.toLocaleString("en-PH") : "-"}</span></p>
              <p>Basic Premium: <span>₱ {updatedValues.vehicleCost ? updatedValues.vehicleCost.toLocaleString("en-PH") : "-"}</span></p>
              {updatedValues.isAoN && <p>AoN: <span>₱ {updatedValues.vehicleCost?.toLocaleString("en-PH") || "-"}</span></p>}
              <p>Total Premium: <span>₱ {updatedValues.vehicleCost?.toLocaleString("en-PH") || "-"}</span></p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
