import { useState } from 'react';
import Select from 'react-select';
import '../styles/Policy-new-client.css';

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

  paymentTypes,             
  selectedPaymentType,     
  setSelectedPaymentType,   
  

  clients,
  selectedClient,
  setSelectedClient,
      
  partners,
  selectedPartner,
  onSaveClient,
  navigate
})  {
  console.log("Selected Partner:", selectedPartner);
  
  const [errors, setErrors] = useState({});

  const startYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => startYear - i)

  // Calculate monthly payment based on selected payment type
  const selectedPaymentTypeObj = paymentTypes?.find(pt => pt.id === Number(selectedPaymentType));
  const months = selectedPaymentTypeObj?.months_payment || 0;
  const monthlyPayment = months > 0 ? (totalPremiumCost / months) : 0;

  const validateForm = () => {
    const newErrors = {};
    if (!selectedClient) newErrors.selectedClient = true;
    if (!vehicleMaker) newErrors.vehicleMaker = true;
    if (!vehicleName) newErrors.vehicleName = true;
    if (!vehicleVinNumber || vehicleVinNumber.length !== 17) newErrors.vehicleVinNumber = true;
    if (!vehicleEngineNumber) newErrors.vehicleEngineNumber = true;
    if (!vehiclePlateNumber) newErrors.vehiclePlateNumber = true;
    if (!vehicleColor) newErrors.vehicleColor = true;
    if (!yearInput) newErrors.yearInput = true;
    if (!selectedPartner) newErrors.selectedPartner = true;
    if (!selectedPaymentType) newErrors.selectedPaymentType = true;
    if (!selected) newErrors.selected = true;
    if (!vehicleCost) newErrors.vehicleCost = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onSaveClient();
    }
  };

  return (
    <div className="new-client-container">
      <div className="form-card">
        <h2>Policy Creation Form</h2>
        <form className="form-grid">
          
          <div className="form-left-column">

            <div className={`form-group ${errors.selectedClient ? 'error' : ''}`}>
              <label>Client <span style={{ color: 'red' }}>*</span></label>
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
                  setErrors(prev => ({ ...prev, selectedClient: false }));
                }}
                placeholder="Search for ID..."
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: errors.selectedClient ? 'red' : base.borderColor,
                  })
                }}
              />
              {errors.selectedClient && <small style={{ color: 'red' }}>Client is required</small>}
            </div>

            <div className={`form-group ${errors.vehicleMaker ? 'error' : ''}`}>
              <label>Maker <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                value={vehicleMaker}
                onChange={(e) => {
                  setVehicleMaker(e.target.value);
                  setErrors(prev => ({ ...prev, vehicleMaker: false }));
                }}
                style={{ borderColor: errors.vehicleMaker ? 'red' : '' }}
              />
              {errors.vehicleMaker && <small style={{ color: 'red' }}>Make Model is required</small>}
            </div>

            <div className={`form-group ${errors.vehicleName ? 'error' : ''}`}>
              <label>Model <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                value={vehicleName}
                onChange={(e) => {
                  setVehicleName(e.target.value);
                  setErrors(prev => ({ ...prev, vehicleName: false }));
                }}
                style={{ borderColor: errors.vehicleName ? 'red' : '' }}
              />
              {errors.vehicleName && <small style={{ color: 'red' }}>Vehicle Name is required</small>}
            </div>

            <div className={`form-group ${errors.vehicleVinNumber ? 'error' : ''}`}>
              <label>Vehicle VIN Number <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text"
                  value={vehicleVinNumber || ""}
                  maxLength={17} 
                  onChange={(e) => {
                    // 1. Get value, force to uppercase, and trim whitespace
                    const upperValue = e.target.value.toUpperCase().trim();
                    
                    // 2. Define regex for invalid VIN characters (anything NOT A-H, J-N, P, R-Z, or 0-9)
                    const invalidCharsRegex = /[^0-9A-HJKNPR-Z]/g;
                    
                    // 3. Clean the value by replacing invalid chars with an empty string
                    const cleanedValue = upperValue.replace(invalidCharsRegex, '');

                    // 4. Set the cleaned value into state
                    setVinNumber(cleanedValue);
                    
                    // 5. Clear the error as the user is fixing it
                    setErrors(prev => ({ ...prev, vehicleVinNumber: false }));
                  }}
                  style={{ 
                    borderColor: errors.vehicleVinNumber ? 'red' : '',
                    textTransform: 'uppercase' // This is still good for visual feedback
                  }}
                  required
                />
              <small style={{ color: vehicleVinNumber?.length >= 17 ? "green" : errors.vehicleVinNumber ? "red" : "gray" }}>
                {vehicleVinNumber?.length || 0}/17 characters {errors.vehicleVinNumber && '- Must be exactly 17 valid characters'}
              </small>
            </div>

            <div className={`form-group ${errors.vehicleEngineNumber ? 'error' : ''}`}>
              <label>Vehicle Engine Serial <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text"
                value={vehicleEngineNumber || ""}
                onChange={(e) => {
                  setEngineNumber(e.target.value);
                  setErrors(prev => ({ ...prev, vehicleEngineNumber: false }));
                }}
                style={{ 
                  borderColor: errors.vehicleEngineNumber ? 'red' : '',
                  textTransform: 'uppercase'
                }}
              />
              {errors.vehicleEngineNumber && <small style={{ color: 'red' }}>Engine Serial is required</small>}
            </div>

            <div className={`form-group ${errors.vehiclePlateNumber ? 'error' : ''}`}>
              <label>Vehicle Plate Number <span style={{ color: 'red' }}>*</span></label>
                <input 
                  type="text"
                  value={vehiclePlateNumber || ""}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase().trim();
                    const invalidCharsRegex = /[^A-Z0-9]/g;
                    const cleanedValue = upperValue.replace(invalidCharsRegex, '');
                    setPlateNumber(cleanedValue);
                    setErrors(prev => ({ ...prev, vehiclePlateNumber: false }));
                  }}
                  maxLength={8}
                  style={{ 
                    borderColor: errors.vehiclePlateNumber ? 'red' : '',
                    textTransform: 'uppercase'
                  }}
                />
                <small style={{ color: vehiclePlateNumber?.length >= 8 ? "green" : errors.vehiclePlateNumber ? "red" : "gray" }}>
                  {vehiclePlateNumber?.length || 0}/8 characters {errors.vehiclePlateNumber && '- Required'}
                </small>
            </div>

            <div className={`form-group ${errors.vehicleColor ? 'error' : ''}`}>
              <label>Vehicle Color <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text"
                value={vehicleColor || ""}
                onChange={(e) => {
                  setVehicleColor(e.target.value);
                  setErrors(prev => ({ ...prev, vehicleColor: false }));
                }}
                style={{
                  borderColor: errors.vehicleColor ? 'red' : '',
                  textTransform: 'uppercase'
                 }}
              />
              {errors.vehicleColor && <small style={{ color: 'red' }}>Vehicle Color is required</small>}
            </div>          

            <div className={`form-group ${errors.yearInput ? 'error' : ''}`}>
              <label>
                Vehicle Year <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={yearInput || ''} // yearInput will be 0 if not set, so this becomes ""
                onChange={(e) => {
                  setYearInput(Number(e.target.value)); // Number("") is 0
                  setErrors((prev) => ({ ...prev, yearInput: false }));
                }}
                style={{ borderColor: errors.yearInput ? 'red' : '' }}
              >
                <option value="">-- Select Vehicle Year --</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.yearInput && (
                <small style={{ color: 'red' }}>Vehicle Year is required</small>
              )}
            </div>

            <div className={`form-group ${errors.selectedPartner ? 'error' : ''}`}>
              <label>Partners <span style={{ color: 'red' }}>*</span></label>
              <select
                id="company-select"
                value={selectedPartner}
                onChange={(e) => {
                  setSelectedPartner(e.target.value);
                  setErrors(prev => ({ ...prev, selectedPartner: false }));
                }}
                style={{ borderColor: errors.selectedPartner ? 'red' : '' }}
              >
                <option value="">-- Select a Partner --</option>
                {Array.isArray(partners) &&
                  partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.insurance_Name}
                    </option>
                  ))}
              </select>
              {errors.selectedPartner && <small style={{ color: 'red' }}>Partner is required</small>}
            </div>

            <div className={`form-group ${errors.selectedPaymentType ? 'error' : ''}`}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                Payment Type 
                <span style={{ color: 'red' }}>*</span>
                 <span 
                      title="This is to set the default value of the payment type, this can be changed later in the payment generation."
                      className="tooltip-icon" 
                    >
                      ?
                </span>
                </label>
                  
               
              <select
                value={selectedPaymentType}
                onChange={(e) => {
                  setSelectedPaymentType(e.target.value);
                  setErrors(prev => ({ ...prev, selectedPaymentType: false }));
                }}
                style={{ borderColor: errors.selectedPaymentType ? 'red' : '' }}
              >
                <option value="">-- Select Payment Type --</option>
                {Array.isArray(paymentTypes) &&
                  paymentTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.payment_type_name} ({pt.months_payment} months)
                    </option>
                  ))}
              </select>
              {errors.selectedPaymentType && <small style={{ color: 'red' }}>Payment Type is required</small>}
            </div>

            <div className={`form-group ${errors.selected ? 'error' : ''}`}>
              <label>Vehicle Type <span style={{ color: 'red' }}>*</span></label>
              <select
                id="vehicle-type-select"
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setErrors(prev => ({ ...prev, selected: false }));
                }}
                style={{ borderColor: errors.selected ? 'red' : '' }}
              >
                <option value="">-- Select Vehicle Type --</option>
                {(vehicleTypes || []).map((v) => (
                  <option key={v.id} value={v.vehicle_type}>
                    {v.vehicle_type}
                  </option>
                ))}
              </select>
              {errors.selected && <small style={{ color: 'red' }}>Vehicle Type is required</small>}
            </div>

            <div className={`form-group ${errors.vehicleCost ? 'error' : ''}`}>
              <label>Original Value of Vehicle <span style={{ color: 'red' }}>*</span></label>
              <input 
                type="text" 
                value={vehicleCost || ""}
                onChange={(e) => {
                  setVehicleCost(Number(e.target.value));
                  setErrors(prev => ({ ...prev, vehicleCost: false }));
                }}
                style={{ borderColor: errors.vehicleCost ? 'red' : '' }}
              />
              {errors.vehicleCost && <small style={{ color: 'red' }}>Vehicle Cost is required</small>}
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
              <input 
                type="text" 
                value={vehicleDetails?.vehicle_Rate ? `${vehicleDetails.vehicle_Rate}%` : "0%"} 
                readOnly 
              />
            </div>

            <div className="form-group">
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

              <div className="vehicle-val">
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
              </div>

              <div className="own-tax">
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
              </div>

              <div className="basic-prem">
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
              </div>

              <div className="local-tax">
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
              </div>

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
                <p>Claimable Amount: 
                  <span>
                    ₱ {currentVehicleValueCost.toLocaleString("en-PH", { minimumFractionDigits: 3, maximumFractionDigits: 4 })}
                  </span>
                </p>
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

            <div className="button-container-new-policy">
              <button
                className="cancel-btn-new-policy"
                type="button"
                onClick={() => navigate("/appinsurance/main-app/policy")}
              >
                Cancel
              </button>
              <button
                className="confirm-btn-new-policy"
                type="button"
                onClick={handleConfirm}
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