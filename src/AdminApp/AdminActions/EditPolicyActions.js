import { db } from "../../dbServer";

export async function editPolicy(policyId, vehicleId, updatePartner) {

    const {dataPolicy, errorPolicy} =  await db
    .from("policy_Table")
    .update({partner_Id: updatePartner})
    .eq("id", policyId)


    const {dataVehicle,  errorVehicle} =
    await db 
    .from("vehicle_Table")
    .update({
        vehicle_Color: updateVehicleColor,
        vehicle_Name: updateVehicleName, // also update this to be as maker/manufacture and model (i.e. Toyota (Maker) Hilux (Model))
        plate_num: updatePlateNum,
        vin_num: updatePlateNum,
        vehicle_Year: updateVehicleYear
    })
    .eq("id", vehicleId)



    // changing the year of the make year of the vehicle will recalculate the policy

    await db
    .from("calculation_Table")

}

export async function activatePolicy(policyId){

    // put the start date and end date in the controller

}


export async function getPartners(partnerId) {

    // just copy and paste the one from the ClientActions.js
    
}

export async function getCalculation(calculationID) { 

    // just copy and paste the one from the PolicyActions.js
}