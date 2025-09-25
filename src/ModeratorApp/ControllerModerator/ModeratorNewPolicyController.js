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
  ComputationActionsAoN
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

  // --- Calculations ---
  const vehicleValue = ComputationActionsVehicleValue(
    safeNumber(vehicleCost),
    safeNumber(yearInput),
    safeNumber(vehicleDetails?.vehicle_Rate)
  );
  const vehicleValueRate = ComputatationRate(
    safeNumber(vehicleDetails?.vehicle_Rate),
    vehicleValue
  );
  const basicPremiumValue =
    ComputationActionsBasicPre(
      safeNumber(vehicleDetails?.bodily_Injury),
      safeNumber(vehicleDetails?.property_Damage),
      safeNumber(vehicleDetails?.personal_Accident)
    ) + vehicleValueRate;

  const totalPremium = ComputationActionsTax(
    basicPremiumValue,
    safeNumber(vehicleDetails?.vat_Tax),
    safeNumber(vehicleDetails?.docu_Stamp),
    safeNumber(vehicleDetails?.local_Gov_Tax)
  );

  const actOfNatureCost = isAoN
    ? ComputationActionsAoN(vehicleValue, safeNumber(vehicleDetails?.aon))
    : 0;

  const totalPremiumCost = totalPremium + actOfNatureCost;

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
        vehicle_year: yearInput,
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
        original_Value: safeNumber(vehicleCost),
        current_Value: vehicleValue,
        total_Premium: totalPremiumCost,
        vehicle_Rate_Value: vehicleValueRate,
        aon_Cost: actOfNatureCost
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
      basicPremiumValue={basicPremiumValue}
      orginalVehicleCost={vehicleCost}
      currentVehicleValueCost={vehicleValue}
      totalVehicleValueRate={vehicleValueRate}
      totalPremiumCost={totalPremiumCost}
      actOfNatureCost={actOfNatureCost}
      onSaveClient={handleSave}
      navigate={navigate}
    />
  );
}

