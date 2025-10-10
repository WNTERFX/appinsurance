// Helper function to round to 2 decimal places
function round2(value) {
  return Math.round(value * 100) / 100;
}

// ---------------------------
// Vehicle Value
// ---------------------------
export function ComputationActionsVehicleValue(vehicleCost, yearInput) {
  const currentYear = new Date().getFullYear();
  const vehicleAge = Math.max(currentYear - parseInt(yearInput, 10), 0);

  const depreciationRate = 0.1;
  const vehicleTotalValue = vehicleCost * Math.pow(1 - depreciationRate, vehicleAge);

  return round2(vehicleTotalValue);
}

// ---------------------------
// Vehicle Rate
// ---------------------------
export function ComputatationRate(rateInput, currentVehicleValue) {
  const vehicleValueRate = currentVehicleValue * (rateInput / 100);
  return round2(Math.max(vehicleValueRate, 0));
}

// ---------------------------
// Basic Premium
// ---------------------------
export function ComputationActionsBasicPre(bodilyInjuryInput, propertyDamageInput, personalAccidentInput) {
  const BasicPremium = bodilyInjuryInput + propertyDamageInput + personalAccidentInput;
  return round2(BasicPremium);
}

// ---------------------------
// Tax Calculation
// ---------------------------
export function ComputationActionsTax(BasicPremium, vatTaxRate, documentaryStampRate, LocalGovTax) {
  const EVAT = BasicPremium * (vatTaxRate / 100);
  const documentaryStamp = BasicPremium * (documentaryStampRate / 100);
  const localGovTax = BasicPremium * (LocalGovTax / 100);
  const TotalTax = BasicPremium + EVAT + documentaryStamp + localGovTax;

  return round2(TotalTax);
}

// ---------------------------
// AoN
// ---------------------------
export function ComputationActionsAoN(vehicleTotalValue, AoNRate) {
  const vehicleValueWithAoN = vehicleTotalValue * (AoNRate / 100);
  return round2(vehicleValueWithAoN);
}

// ---------------------------
// Commission
// ---------------------------
export function ComputationActionsCommission(totalAmount, commissionRate) {
  const commission = totalAmount * (commissionRate / 100);
  const totalWithCommission = totalAmount + commission;
  return round2(totalWithCommission);
}
