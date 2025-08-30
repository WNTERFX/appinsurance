export function ComputationActionsVehicleValue(vehicleCost, yearInput) {

    const currentYear = new Date().getFullYear();
    const vehicleAge = Math.max(currentYear - parseInt(yearInput, 10), 0);
    
    const depreciationRate = 0.1;
    const vehicleTotalValue = vehicleCost * Math.pow((1 - depreciationRate), vehicleAge);

      
    return vehicleTotalValue;
}
export function ComputatationRate(rateInput, currentVehicleValue) {

    const vehicleValueRate = currentVehicleValue * (rateInput / 100);
    const finalValue = Math.max(vehicleValueRate  , 0); 

    
    return finalValue;
}

export function ComputationActionsBasicPre(bodilyInjuryInput, propertyDamageInput, personalAccidentInput) {

    const BasicPremium = bodilyInjuryInput + propertyDamageInput + personalAccidentInput;

    return BasicPremium;
}

export function ComputationActionsTax(BasicPremium, vatTaxRate, documentaryStampRate, LocalGovTax) {

    const EVAT = BasicPremium * (vatTaxRate/100);
    const documentaryStamp = BasicPremium * (documentaryStampRate/100);
    const localGovTax = BasicPremium * (LocalGovTax/100);
    const TotalTax = EVAT + documentaryStamp + localGovTax + BasicPremium;

    return TotalTax;
}

export function ComputationActionsAoN(vehicleValueYear, AoNRate, vehicleTypeRate ) {

    const AoN = (vehicleValueYear * AoNRate) * vehicleTypeRate;

    return AoN;
}
