import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { 
  getComputationValue, 
  fetchVehicleDetails 
} from "../../AdminApp/AdminActions/VehicleTypeActions"; 

import {
  ComputationActionsVehicleValue,
  ComputatationRate,
  ComputationActionsBasicPre,
  ComputationActionsTax,
  ComputationActionsAoN,
  ComputationActionsCommission //  IMPORT COMMISSION ACTION
} from "../../AdminApp/AdminActions/ComputationActions"; 

import {
  fetchPartners,
  NewPolicyCreation,
  NewVehicleCreation,
  NewComputationCreation
} from "../../AdminApp/AdminActions/NewPolicyActions"; 

import { fetchModeratorClients } from "../ModeratorActions/ModeratorClientActions"; 
import { db } from "../../dbServer"; 
import ModeratorPolicyNewClientForm from "../ModeratorForms/ModeratorPolicyNewClientForm";

export default function ModeratorNewPolicyController() {
  const navigate = useNavigate();

  // --- State ---
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [vehicleDetails, setVehicleDetails] = useState(null);

  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const [vehicleName, setVehicleName] = useState("");
  const [vehicleMaker, setVehicleMaker] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleVinNumber, setVinNumber] = useState("");
  const [vehicleEngineNumber, setEngineNumber] = useState("");
  const [vehiclePlateNumber, setPlateNumber] = useState("");
  const [vehicleYear, setVehicleYear] = useState(0);
  const [vehicleCost, setVehicleCost] = useState(0);
  const [yearInput, setYearInput] = useState(0);
  const [isAoN, setIsAoN] = useState(false);

  // ✨ NEW STATE FOR COMMISSION
  const [commissionFee, setCommissionFee] = useState("0"); // Store as string for input
  const [commissionValue, setCommissionValue] = useState(0);

  // --- Load Data ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        const moderatorClients = await fetchModeratorClients(user.id);
        setClients(moderatorClients);

        const partnersData = await fetchPartners();
        setPartners(partnersData);

        const vehicleTypeData = await getComputationValue();
        setVehicleTypes(vehicleTypeData);
      } catch (err) {
        console.error("Error loading moderator policy data:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedType) {
      fetchVehicleDetails(selectedType).then(setVehicleDetails);
    }
  }, [selectedType]);

  // --- Helpers ---
  const safeNumber = (v) => {
    const num = Number(v);
    return isNaN(num) ? 0 : num;
  };

  // --- Computations ---
  // Ensure all computation inputs are treated as numbers
  const numVehicleCost = safeNumber(vehicleCost);
  const numYearInput = safeNumber(yearInput);
  const numVehicleRate = safeNumber(vehicleDetails?.vehicle_Rate);
  const numBodilyInjury = safeNumber(vehicleDetails?.bodily_Injury);
  const numPropertyDamage = safeNumber(vehicleDetails?.property_Damage);
  const numPersonalAccident = safeNumber(vehicleDetails?.personal_Accident);
  const numVatTax = safeNumber(vehicleDetails?.vat_Tax);
  const numDocuStamp = safeNumber(vehicleDetails?.docu_Stamp);
  const numLocalGovTax = safeNumber(vehicleDetails?.local_Gov_Tax);
  const numAoNRate = safeNumber(vehicleDetails?.aon);
  const numCommissionFee = parseFloat(commissionFee) || 0; // Convert commission input to number

  const vehicleValue = ComputationActionsVehicleValue(
    numVehicleCost,
    numYearInput,
    numVehicleRate // This parameter was missing in your original moderator code
  );
  
  const vehicleValueRate = ComputatationRate(
    numVehicleRate,
    vehicleValue
  );
  
  // Basic Premium (without commission)
  const basicPremiumBeforeCommission =
    ComputationActionsBasicPre(
      numBodilyInjury,
      numPropertyDamage,
      numPersonalAccident
    ) + vehicleValueRate;

  // Total premium before commission (with taxes)
  const totalPremiumBeforeCommissionAndAoN = ComputationActionsTax(
    basicPremiumBeforeCommission,
    numVatTax,
    numDocuStamp,
    numLocalGovTax
  );

  const actOfNatureCost = isAoN
    ? ComputationActionsAoN(vehicleValue, numAoNRate)
    : 0;

  // Premium before commission, but after AoN
  const totalPremiumPreCommission = totalPremiumBeforeCommissionAndAoN + actOfNatureCost;

  //  COMMISSION CALCULATION
  const computedCommissionValue = numCommissionFee > 0
    ? ComputationActionsCommission(totalPremiumPreCommission, numCommissionFee)
    : 0;

  //  FINAL TOTAL PREMIUM (including commission)
  const finalTotalPremium = totalPremiumPreCommission + computedCommissionValue;

  //  BASIC PREMIUM WITH COMMISSION
  const basicPremiumWithCommission = basicPremiumBeforeCommission + computedCommissionValue;


  // Update derived display states
  useEffect(() => {
    setCommissionValue(computedCommissionValue);
  }, [computedCommissionValue]);


  // --- Save ---
  const handleSave = async () => {
    if (!selectedClient || !selectedPartner)
      return alert("Select client & partner");

    try {
      // Save policy
      const { success: policySuccess, data: policyData, error: policyError } =
        await NewPolicyCreation({
          policy_type: "Comprehensive",
          policy_is_active: false,
          client_id: selectedClient.uid,
          partner_id: selectedPartner
        });

      if (!policySuccess) {
        return alert("Error saving policy: " + policyError);
      }

      const policyId = policyData[0].id;

      // Save vehicle
      const selectedVehicleType = vehicleTypes.find(
        (v) => v.vehicle_type === selectedType
      );

      const newVehicleDataResult = await NewVehicleCreation({
        vehicle_name: vehicleName,
        vehicle_maker: vehicleMaker,
        vehicle_color: vehicleColor,
        plate_num: vehiclePlateNumber,
        engine_serial_no: vehicleEngineNumber,
        vehicle_year: numYearInput, // Ensure saving numeric value
        vin_num: vehicleVinNumber,
        policy_id: policyId,
        vehicle_type_id: selectedVehicleType?.id
      });

      if (!newVehicleDataResult.success) {
        return console.error(
          "Error Saving Vehicle Details " + newVehicleDataResult.error
        );
      }

      // Save computation
      const clientComputationData = {
        policy_id: policyId,
        original_Value: numVehicleCost, // Use numeric value
        current_Value: vehicleValue,
        total_Premium: finalTotalPremium, //  Use final total with commission
        vehicle_Rate_Value: vehicleValueRate,
        aon_Cost: actOfNatureCost,
        commission_fee: numCommissionFee //  SAVE COMMISSION FEE
      };

      const newComputationResult = await NewComputationCreation(clientComputationData);

      if (newComputationResult.success) {
        alert("Client and computation saved successfully!");
        navigate("/appinsurance/MainAreaModerator/PolicyModerator");
      } else {
        alert("Error saving computation: " + newComputationResult.error);
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Unexpected error occurred while saving.");
    }
  };

  return (
    <ModeratorPolicyNewClientForm
      clients={clients}
      selectedClient={selectedClient}
      setSelectedClient={setSelectedClient}
      partners={partners}
      selectedPartner={selectedPartner}
      setSelectedPartner={setSelectedPartner}
      vehicleTypes={vehicleTypes}
      selected={selectedType}
      setSelected={setSelectedType}
      vehicleDetails={vehicleDetails}
      vehicleName={vehicleName} setVehicleName={setVehicleName}
      vehicleMaker={vehicleMaker} setVehicleMaker={setVehicleMaker}
      vehicleColor={vehicleColor} setVehicleColor={setVehicleColor}
      vehicleVinNumber={vehicleVinNumber} setVinNumber={setVinNumber}
      vehicleEngineNumber={vehicleEngineNumber} setEngineNumber={setEngineNumber}
      vehiclePlateNumber={vehiclePlateNumber} setPlateNumber={setPlateNumber}
      vehicleYear={vehicleYear} setVehicleYear={setVehicleYear}
      vehicleCost={vehicleCost} setVehicleCost={(v) => setVehicleCost(v === "" ? 0 : safeNumber(v))}
      yearInput={yearInput} setYearInput={(v) => setYearInput(v === "" ? 0 : safeNumber(v))}
      isAoN={isAoN} setIsAoN={setIsAoN}
      basicPremiumValue={basicPremiumBeforeCommission} // Original basic premium
      orginalVehicleCost={numVehicleCost} // Use numeric
      currentVehicleValueCost={vehicleValue}
      totalVehicleValueRate={vehicleValueRate}
      totalPremiumCost={finalTotalPremium} // Pass final total premium
      actOfNatureCost={actOfNatureCost}
      //  NEW COMMISSION PROPS
      commissionFee={commissionFee}
      setCommissionFee={setCommissionFee}
      commissionValue={computedCommissionValue} // Pass computed value
      basicPremiumWithCommissionValue={basicPremiumWithCommission} // Pass basic with commission
      totalPremiumWithCommission={finalTotalPremium} // You can use this if the form needs to display it separately
      onSaveClient={handleSave}
      navigate={navigate}
    />
  );
}