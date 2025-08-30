import './styles/Policy-new-client.css';

export default function PolicyNewClient({
  vehicleTypes,
  selected,
  setSelected,
  vehicleDetails,
  yearInput,
  setYearInput,  
  vehicleCost,
  setVehicleCost,
  vehicleValue,
  vehicleValueRate,
  basicPremiumValue,
  totalPremiumValue,
  fullName,
  setFullName,
  phoneNumber,
  setPhoneNumber,
  address,
  setAddress,
  email,
  setEmail,
  insurancePartner,
  setInsurancePartner,
  onSaveClient,
  navigate,
})  {
 
  return (
    <div className="new-client-container">
      <h2>New Client Form</h2>

      <div className="form-card">
        <form className="form-grid">
          
          <div className="form-left-column">
            <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Home Address</label>
            <input 
              type="text" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label>Insurance Partner</label>
            <input 
              type="text" 
              value={insurancePartner} 
              onChange={(e) => setInsurancePartner(e.target.value)} 
            />
          </div>

            <div className="form-group">
              <label>Vehicle Year</label>
              <input type="text" 
              value= {yearInput || ""}
              onChange={(e) => setYearInput(Number(e.target.value))} />
              
            </div>

            <div className="form-group">
              <label>Vehicle Type</label>
             <select
                  id="vehicle-type-select"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">-- Select Vehicle Type --</option>
                  {(vehicleTypes || []).map((v) => (
                    <option key={v.id} value={v.vehicle_Type}>
                      {v.vehicle_Type}
                    </option>
                  ))}
                </select>
            </div>

            <div className="form-group">
              <label>Original Value of Vehicle</label>
              <input type="text" 
              value={vehicleCost || ""}
              onChange={(e) => setVehicleCost(Number(e.target.value))}/>
            </div>

            <div className="form-group">
                <label>VAT Tax</label>
                <input 
                  type="text" 
                  value={vehicleDetails?.vat_Tax ? `${vehicleDetails.vat_Tax}%` : "0%"} 
                  readOnly 
                />
            </div>

              <div className="form-group">
                <label>Documentary Stamp</label>
                <input 
                  type="text" 
                  value={vehicleDetails?.docu_Stamp ? `${vehicleDetails.docu_Stamp}%` : "0%"} 
                  readOnly 
                />
              </div>

              <div className="form-group">
                <label>Local Gov Tax</label>
                <input 
                  type="text" 
                  value={vehicleDetails?.local_Gov_Tax ? `${vehicleDetails.local_Gov_Tax}%` : "0%"} 
                  readOnly 
                />
              </div>


            <div className="form-group">
              <label>AoN (Act of Nature)</label>
              <input type="checkbox"></input>
            </div>

            <div className="form-group">
              <label>Rate</label>
              <input type="text" 
              value={vehicleDetails?.vehicle_Rate ?`${vehicleDetails.vehicle_Rate}%` : "0%" } 
              readOnly />
            </div>

            <div className="form-group">
              <label>Current Vehicle Value</label>
              <input type="text" value={vehicleValue|| ""} 
              readOnly />
            </div>
          </div>

        
          <div className="form-right-column">
            <div className="calculation-card">
              <h3>Calculation Summary</h3>
                <p>Original Vehicle Cost: <span>₱ {vehicleCost || "—"}</span></p>
                <p>Current Vehicle Value: <span>₱ {vehicleValue || "—"}</span></p>
                <p>Total Vehicle Value Rate: <span>₱ {vehicleValueRate || "—"}</span></p>
                <p>Bodily Injury <span>₱ {vehicleDetails?.bodily_Injury || "—"}</span></p>
                <p>Property Damage: <span>₱ {vehicleDetails?.property_Damage || "—"}</span></p>
                <p>Personal Accident: <span>₱ {vehicleDetails?.personal_Accident || "—"}</span></p>
                <p>Basic Premium: <span>₱ {basicPremiumValue || "—"}</span></p>
                <p>Local Government Tax: <span>{vehicleDetails?.local_Gov_Tax ? `${vehicleDetails.local_Gov_Tax}%` : "—"}</span></p>
                <p>VAT: <span>{vehicleDetails?.vat_Tax ? `${vehicleDetails.vat_Tax}%` : "—"}</span></p>
                <p>Documentary Stamp: <span>{vehicleDetails?.docu_Stamp ? `${vehicleDetails.docu_Stamp}%` : "—"}</span></p>

                <hr />
                <strong>
                  <p>Total: <span>₱ {vehicleDetails ? totalPremiumValue.toFixed(2) : "—"}</span></p>
                </strong>
              </div>

          </div>
        </form>
      </div>

      <div className="button-container">
        <button
          className="cancel-btn"
          onClick={() => navigate("/appinsurance/MainArea/Policy")}
        >
          Cancel
        </button>
       <button
            className="confirm-btn"
            type="button"
            onClick={onSaveClient}
            >
            Confirm
      </button>
      </div>
    </div>
  );
}

