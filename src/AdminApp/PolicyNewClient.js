import './styles/Policy-new-client.css';

export default function PolicyNewClient({
  // Total Premium Calculation
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

      //VehicleValue
      orginalVehicleCost,
      currentVehicleValueCost,
      totalVehicleValueRate,
      totalPremiumCost,
      actOfNatureCost,
      
      
      // Client Name
      prefixName,
      setPrefix,
      firstName,
      setFirstName,
      middleName,
      setMiddleName,
      familyName,
      setFamilyName,
      suffixName,
      setSuffixName,
     
      phoneNumber,
      setPhoneNumber,
      address,
      setAddress,
      email,
      setEmail,
      partners,
      selectedPartner,
      setSelectedPartner,
      vehicleName,
      setVehicleName,
      
      
      onSaveClient,
      navigate
})  {
 console.log("Selected Partner:", selectedPartner);
 


  return (
    <div className="new-client-container">
      <h2>New Client Form</h2>

      <div className="form-card">
        <form className="form-grid">
          
          <div className="form-left-column">
          
          <div className="name-row">
            
            <div className="form-group prefix">
              <label>Prefix</label>
         
              <input
                type="text"
                value={prefixName}
                onChange={(e) => setPrefix(e.target.value)}
              />
              
            </div>

            
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>

            
            <div className="form-group">
              <label>Middle Name</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
            </div>

            
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
              />
            </div>

            
            <div className="form-group suffix">

              <label>Suffix</label>
              <input
                type="text"
                value={suffixName}
                onChange={(e) => setSuffixName(e.target.value)}
              />
             
            </div>
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
              <label>Vehicle Name</label>
              <input type="text" 
              value= {vehicleName}
              onChange={(e) => setVehicleName(e.target.value)} />
              
            </div>
          

            <div className="form-group">
              <label>Vehicle Year</label>
              <input type="text" 
              value= {yearInput || ""}
              onChange={(e) => setYearInput(Number(e.target.value))} />
              
            </div>

              <div className="form-group">
             <label>Partners</label>
              <select
                id="company-select"
                value={selectedPartner}
                onChange={(e) => setSelectedPartner(e.target.value)} 
              >
                <option value="">-- Select a Partner --</option>
                {Array.isArray(partners) &&
                  partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.insurance_Name}
                    </option>
                  ))}
              </select>
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


           <div className="form-group aon-row">
              <label>AoN (Act of Nature)</label>
              <input 
                type="checkbox" 
                checked={isAoN}
                onChange={(e) => setIsAoN(e.target.checked)}
                
              />
            </div>

            <div className="form-group">
              <label>Rate</label>
              <input type="text" 
              value={vehicleDetails?.vehicle_Rate ?`${vehicleDetails.vehicle_Rate}%` : "0%" } 
              readOnly />
            </div>

          </div>

        
          <div className="form-right-column">
                  <div className="calculation-card">
                    <h3>Calculation Summary</h3>
                    <p>Original Vehicle Cost: 
                      <span>
                         ₱ {orginalVehicleCost.toLocaleString("en-PH", { minimumFractionDigits: 3, maximumFractionDigits: 4 })}
                      </span>
                    </p>

                    <p>Current Vehicle Value: 
                      <span>
                        ₱ {currentVehicleValueCost.toLocaleString("en-PH", { minimumFractionDigits: 3, maximumFractionDigits: 4 })}
                      </span>
                    </p>

                    <p>Total Vehicle Value Rate: 
                      <span>
                        ₱ {totalVehicleValueRate.toLocaleString("en-PH", { minimumFractionDigits: 3, maximumFractionDigits: 4 })}
                      </span>
                    </p>

                    <p>Bodily Injury 
                      <span>
                        ₱ {vehicleDetails?.bodily_Injury ? vehicleDetails.bodily_Injury.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}
                      </span>
                    </p>

                    <p>Property Damage: 
                      <span>
                        ₱ {vehicleDetails?.property_Damage ? vehicleDetails.property_Damage.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}
                      </span>
                    </p>

                    <p>Personal Accident: 
                      <span>
                        ₱ {vehicleDetails?.personal_Accident ? vehicleDetails.personal_Accident.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}
                      </span>
                    </p>

                    <p>Basic Premium: 
                      <span>
                        ₱ {basicPremiumValue ? basicPremiumValue.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}
                      </span>
                    </p>

                     <p>Local Government Tax: 
                        <span>{vehicleDetails?.local_Gov_Tax ? `${vehicleDetails.local_Gov_Tax}%` : "—"}</span>
                      </p>

                      <p>VAT: 
                        <span>{vehicleDetails?.vat_Tax ? `${vehicleDetails.vat_Tax}%` : "—"}</span>
                      </p>

                      <p>Documentary Stamp: 
                        <span>{vehicleDetails?.docu_Stamp ? `${vehicleDetails.docu_Stamp}%` : "—"}</span>
                      </p>

                     {isAoN && (
                        <p>AoN (Act of Nature): 
                          <span>₱ {actOfNatureCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                        </p>
                      )}
                    <hr />
                    <strong>
                      <p>Total Premium: 
                        <span>₱ {totalPremiumCost.toLocaleString("en-PH")}</span>
                      </p>
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

