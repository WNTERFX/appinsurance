import '../styles/Policy-new-client.css';
import Select from 'react-select';

export default function PolicyNewClient({
  vehicleTypes,
  selected,
  setSelected,
  vehicleDetails,
  yearInput,
  setYearInput,   
  vehicleCost,
  setVehicleCost,  
  basicPremiumValue, 
  basicPremiumWithCommissionValue,        
 
  isAoN,
  setIsAoN,

  //VehicleValue
  orginalVehicleCost,
  currentVehicleValueCost,
  claimableAmount,
  totalVehicleValueRate,
  totalPremiumCost,
  actOfNatureCost,
  commissionFee,
  setCommissionFee,
  commissionValue, 

  
  setSelectedPartner,
  vehicleMaker,
  setVehicleMaker,
  vehicleName,
  setVehicleName,
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
      onSaveClient,
      navigate
})  {
 console.log("Selected Partner:", selectedPartner);
 
 // Calculate monthly payment based on selected payment type
 const selectedPaymentTypeObj = paymentTypes?.find(pt => pt.id === Number(selectedPaymentType));
 const months = selectedPaymentTypeObj?.months_payment || 0;
 const monthlyPayment = months > 0 ? (totalPremiumCost / months) : 0;

  return (
    <div className="new-client-container">

      <div className="form-card">
      <h2>Policy Creation Form</h2>
        <form className="form-grid">
          
          <div className="form-left-column">

            <div className="form-group">
              <label>Client</label>
             <Select
                  className="client-select"
                  classNamePrefix="client-select"
                  options={clients.map(c => ({
                    value: c.uid,
                    label: `${c.internal_id} | ${c.first_Name || ""} ${c.middle_Name || ""} ${c.family_Name || ""}`,
                  }))}
                  value={
                    selectedClient
                      ? {
                          value: selectedClient.uid,
                          label: `${selectedClient.internal_id} | ${selectedClient.first_Name || ""} ${selectedClient.middle_Name || ""} ${selectedClient.family_Name || ""}`,
                        }
                      : null
                  }
                  onChange={(option) => {
                    if (option) {
                      const client = clients.find(c => c.uid === option.value);
                      setSelectedClient(client);
                    } else {
                      setSelectedClient(null);
                    }
                  }}
                  placeholder="Search for ID..."
                  isClearable
                />

            </div>

                    

             <div className="form-group">
              <label>Vehicle Maker</label>
              <input 
                type="text" 
                value={vehicleMaker}
                onChange={(e) => setVehicleMaker(e.target.value)} 
              />
            </div>

             <div className="form-group">
              <label>Vehicle Name</label>
              <input 
                type="text" 
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Vehicle VIN Number</label>
              <input 
                type="text"
                value={vehicleVinNumber || ""}
                maxLength={17} 
                onChange={(e) => setVinNumber(e.target.value)}
              />
              <small style={{ color: vehicleVinNumber?.length >= 17 ? "red" : "gray" }}>
                {vehicleVinNumber?.length || 0}/17 characters
              </small>
            </div>

            <div className="form-group">
              <label>Vehicle Engine Serial</label>
              <input 
                type="text"
                value={vehicleEngineNumber || ""}
                onChange={(e) => setEngineNumber(e.target.value)}
              />
            </div>


            <div className="form-group">
              <label>Vehicle Plate Number</label>
              <input 
                type="text"
                value={vehiclePlateNumber || ""}
                onChange={(e) => setPlateNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Vehicle Color</label>
              <input 
                type="text"
                value={vehicleColor || ""}
                onChange={(e) => setVehicleColor(e.target.value)}
              />
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
              <label>Payment Type</label>
              <select
                value={selectedPaymentType}
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

            <div className="form-group">
              <label>Vehicle Type</label>
             <select
                  id="vehicle-type-select"
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  <option value="">-- Select Vehicle Type --</option>
                  {(vehicleTypes || []).map((v) => (
                    <option key={v.id} value={v.vehicle_type}>
                      {v.vehicle_type}
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
              <label>Rate</label>
              <input type="text" 
              value={vehicleDetails?.vehicle_Rate ?`${vehicleDetails.vehicle_Rate}%` : "0%" } 
              readOnly />
            </div>

            <div className="form-group">
              {/* Commission Fee */}
            <label>Commission Fee (%)</label>
            <input
              type="text"
              value={commissionFee}
              onChange={(e) => setCommissionFee(e.target.value)}
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

                   <p>Basic Premium (with Commission): 
                    <span>
                      ₱ {basicPremiumWithCommissionValue ? basicPremiumWithCommissionValue.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}
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

                      <p>Commission Amount: 
                      <span>
                        ₱ {commissionValue ? commissionValue.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}
                      </span>
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
        <div className="button-container-new-policy">
        <button
          className="cancel-btn-new-policy"
          onClick={() => navigate("/appinsurance/main-app/policy")}
        >
          Cancel
        </button>
       <button
            className="confirm-btn-new-policy"
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