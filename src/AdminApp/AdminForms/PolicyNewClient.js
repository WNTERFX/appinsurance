import { useState, useMemo } from 'react';
import Select from 'react-select';
import '../styles/Policy-new-client.css';
import ScrollToTopButton from '../../ReusableComponents/ScrollToTop';

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

  // VehicleValue
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
}) {
  const [errors, setErrors] = useState({});
  const [showScrollToTop, setShowScrollToTop] = useState(false); // State to control scroll button

  const startYear = new Date().getFullYear();
  const years = useMemo(() => Array.from({ length: 50 }, (_, i) => startYear - i), [startYear]);

  // Maker options (Select list)
  const makerOptions = [
    'Toyota','Mitsubishi','Honda','Ford','Nissan','Hyundai','Isuzu','Suzuki','Subaru','Geely',
    'Yamaha','Kawasaki','KTM','DUCATI','CFMOTO'
  ];

  // Calculate monthly payment based on selected payment type
  const selectedPaymentTypeObj = paymentTypes?.find(pt => pt.id === Number(selectedPaymentType));
  const months = selectedPaymentTypeObj?.months_payment || 0;
  const monthlyPayment = months > 0 ? (Number(totalPremiumCost || 0) / months) : 0;

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
    } else {
      // Trigger scroll to top when validation fails
      setShowScrollToTop(true);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      // Hide the button after scrolling
      setTimeout(() => setShowScrollToTop(false), 1000);
    }
  };

  const startDate = new Date();

  return (
    <>
      {/* Show ScrollToTopButton when there are validation errors */}
      {showScrollToTop && <ScrollToTopButton />}

      <div className="new-client-container">
        <div className="form-card">
          <h2>Policy Creation Form</h2>

          <form className="form-grid">
            {/* LEFT */}
            <div className="form-left-column">

              {/* Client */}
              <div className={`form-group ${errors.selectedClient ? 'error' : ''}`}>
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

              {/* Maker (changed to select) */}
              <div className={`form-group ${errors.vehicleMaker ? 'error' : ''}`}>
                <label>Make</label>
                <select
                  value={vehicleMaker || ''}
                  onChange={(e) => {
                    setVehicleMaker(e.target.value);
                    setErrors(prev => ({ ...prev, vehicleMaker: false }));
                  }}
                  style={{ borderColor: errors.vehicleMaker ? 'red' : '' }}
                >
                  <option value="">-- Select Maker --</option>
                  {makerOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                {errors.vehicleMaker && <small style={{ color: 'red' }}>Maker is required</small>}
              </div>

              {/* Model */}
              <div className={`form-group ${errors.vehicleName ? 'error' : ''}`}>
                <label>Model</label>
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

              {/* VIN */}
              <div className={`form-group ${errors.vehicleVinNumber ? 'error' : ''}`}>
                <label>Vehicle VIN Number</label>
                <input
                  type="text"
                  value={vehicleVinNumber || ""}
                  maxLength={17}
                  onChange={(e) => {
                    const upperValue = e.target.value.toUpperCase().trim();
                    const invalidCharsRegex = /[^0-9A-HJKNPR-Z]/g;
                    const cleanedValue = upperValue.replace(invalidCharsRegex, '');
                    setVinNumber(cleanedValue);
                    setErrors(prev => ({ ...prev, vehicleVinNumber: false }));
                  }}
                  style={{
                    borderColor: errors.vehicleVinNumber ? 'red' : '',
                    textTransform: 'uppercase'
                  }}
                  required
                />
                <small style={{ color: vehicleVinNumber?.length >= 17 ? "green" : errors.vehicleVinNumber ? "red" : "gray" }}>
                  {vehicleVinNumber?.length || 0}/17 characters {errors.vehicleVinNumber && '- Must be exactly 17 valid characters'}
                </small>
              </div>

              {/* Engine Serial */}
              <div className={`form-group ${errors.vehicleEngineNumber ? 'error' : ''}`}>
                <label>Vehicle Engine Serial</label>
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

             {/* Plate */}
              <div className={`form-group ${errors.vehiclePlateNumber ? 'error' : ''}`}>
                <label>Vehicle Plate Number</label>
                <input
                  type="text"
                  value={vehiclePlateNumber || ""}
                  onChange={(e) => {
                    // 1. Convert to uppercase and trim whitespace from start/end
                    const upperValue = e.target.value.toUpperCase();
                    // 2. Allow letters (A-Z), numbers (0-9), AND SPACE (' ')
                    const invalidCharsRegex = /[^A-Z0-9 ]/g; 
                    const cleanedValue = upperValue.replace(invalidCharsRegex, '');
                    
                    setPlateNumber(cleanedValue);
                    setErrors(prev => ({ ...prev, vehiclePlateNumber: false }));
                  }}
                  maxLength={8} // Max Length is 8 including the space
                  style={{
                    borderColor: errors.vehiclePlateNumber ? 'red' : '',
                    textTransform: 'uppercase'
                  }}
                />
                <small style={{ color: vehiclePlateNumber?.length === 8 ? "green" : errors.vehiclePlateNumber ? "red" : "gray" }}>
                  {vehiclePlateNumber?.length || 0}/8 characters {errors.vehiclePlateNumber && '- Required'}
                </small>
              </div>

              {/* Color */}
              <div className={`form-group ${errors.vehicleColor ? 'error' : ''}`}>
                <label>Vehicle Color</label>
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

              {/* Year */}
              <div className={`form-group ${errors.yearInput ? 'error' : ''}`}>
                <label>Vehicle Year</label>
                <select
                  value={yearInput || ''}
                  onChange={(e) => {
                    setYearInput(Number(e.target.value));
                    setErrors((prev) => ({ ...prev, yearInput: false }));
                  }}
                  style={{ borderColor: errors.yearInput ? 'red' : '' }}
                >
                  <option value="">-- Select Vehicle Year --</option>
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.yearInput && <small style={{ color: 'red' }}>Vehicle Year is required</small>}
              </div>

              {/* Partner */}
              <div className={`form-group ${errors.selectedPartner ? 'error' : ''}`}>
                <label>Insurer</label>
                <select
                  id="company-select"
                  value={selectedPartner || ''}
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

              {/* Payment Type */}
              <div className={`form-group ${errors.selectedPaymentType ? 'error' : ''}`}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Payment Type
                  <span
                    title="This is to set the default value of the payment type, this can be changed later in the payment generation."
                    className="tooltip-icon"
                  >
                    ?
                  </span>
                </label>
                <select
                  value={selectedPaymentType || ''}
                  onChange={(e) => {
                    setSelectedPaymentType(e.target.value);
                    setErrors(prev => ({ ...prev, selectedPaymentType: false }));
                  }}
                  style={{ borderColor: errors.selectedPaymentType ? 'red' : '' }}
                >
                  <option value="">-- Select Payment Type --</option>
                   {Array.isArray(paymentTypes) &&
                    paymentTypes.map((pt) => {

                      const monthText = pt.months_payment === 1 ? 'month' : 'months';

                      return (
                        <option key={pt.id} value={pt.id}>
                          {pt.payment_type_name} ({pt.months_payment} {monthText})
                        </option>
                      );
                    })}
                </select>
                {errors.selectedPaymentType && <small style={{ color: 'red' }}>Payment Type is required</small>}
              </div>

              {/* Vehicle Type */}
              <div className={`form-group ${errors.selected ? 'error' : ''}`}>
                <label>Vehicle Type</label>
                <select
                  id="vehicle-type-select"
                  value={selected || ''}
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

              {/* Original Value */}
              <div className={`form-group ${errors.vehicleCost ? 'error' : ''}`}>
                <label>Original Value of Vehicle</label>
                <input
                  type="number"
                  value={vehicleCost || ""}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setVehicleCost(val);
                    setErrors(prev => ({ ...prev, vehicleCost: false }));
                  }}
                  style={{ borderColor: errors.vehicleCost ? 'red' : '' }}
                />
                {errors.vehicleCost && <small style={{ color: 'red' }}>Vehicle Cost is required</small>}
              </div>

              {/* Static rates */}
              <div className="form-group">
                <label>VAT Tax</label>
                <input type="text" value={vehicleDetails?.vat_Tax ? `${vehicleDetails.vat_Tax}%` : "0%"} readOnly />
              </div>
              <div className="form-group">
                <label>Documentary Stamp</label>
                <input type="text" value={vehicleDetails?.docu_Stamp ? `${vehicleDetails.docu_Stamp}%` : "0%"} readOnly />
              </div>
              <div className="form-group">
                <label>Local Gov Tax</label>
                <input type="text" value={vehicleDetails?.local_Gov_Tax ? `${vehicleDetails.local_Gov_Tax}%` : "0%"} readOnly />
              </div>
              <div className="form-group">
                <label>Rate</label>
                <input type="text" value={vehicleDetails?.vehicle_Rate ? `${vehicleDetails.vehicle_Rate}%` : "0%"} readOnly />
              </div>

              <div className="form-group">
                <label>Commission Fee (%)</label>
                <input
                  type="number"
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

            {/* RIGHT */}
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
                    <span>₱ {vehicleDetails?.bodily_Injury ? vehicleDetails.bodily_Injury.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}</span>
                  </p>
                  <p>Property Damage:
                    <span>₱ {vehicleDetails?.property_Damage ? vehicleDetails.property_Damage.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}</span>
                  </p>
                  <p>Personal Accident:
                    <span>₱ {vehicleDetails?.personal_Accident ? vehicleDetails.personal_Accident.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}</span>
                  </p>
                </div>

                <div className="basic-prem">
                  <p>Basic Premium:
                    <span>₱ {basicPremiumValue ? basicPremiumValue.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}</span>
                  </p>
                  <p>Basic Premium (with Commission):
                    <span>₱ {basicPremiumWithCommissionValue ? basicPremiumWithCommissionValue.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}</span>
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
                    <span>₱ {commissionValue ? commissionValue.toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "—"}</span>
                  </p>
                </div>

                {isAoN && (
                  <p>AoN (Act of Nature):
                    <span>₱ {actOfNatureCost.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                  </p>
                )}
                <hr />
                <strong>
                  <p>Claimable Amount:
                    <span>₱ {claimableAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
                  </p>
                  <p>Total Premium:
                    <span>₱ {totalPremiumCost.toLocaleString("en-PH")}</span>
                  </p>
                </strong>

                {selectedPaymentType && months > 0 && (
                  <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '16px', color: '#333' }}>
                      Monthly Payment Schedule ({months} months)
                    </h4>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '14px' }}>
                      {/* MODIFIED LOOP BELOW */}
                      {Array.from({ length: months }, (_, i) => {
                        // Create a new date based on the start date
                        const paymentDate = new Date(startDate);
                        // Add 'i' months to it (for Month 1, i=0, so it's today)
                        paymentDate.setMonth(paymentDate.getMonth() + i);
                        
                        // Format it to MM/DD/YYYY
                        const formattedDate = paymentDate.toLocaleDateString('en-US', {
                          month: 'short',  // This makes it "Nov", "Dec", etc.
                          day: 'numeric',  // This keeps the day number
                          year: 'numeric'  // This keeps the year
                        });

                        return (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              borderBottom: '1px solid #e0e0e0',
                              background: i % 2 === 0 ? 'white' : '#f8f9fa'
                            }}
                          >
                            {/* Use the formatted date here */}
                            <span style={{ fontWeight: '500' }}>{formattedDate}:</span>
                            <span style={{ color: '#10b981', fontWeight: '600' }}>
                              ₱{monthlyPayment.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        );
                      })}
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
    </>
  );
}