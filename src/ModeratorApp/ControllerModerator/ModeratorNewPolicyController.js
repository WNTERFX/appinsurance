import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { 
  getComputationValue, 
  fetchVehicleDetails } 
from "../../AdminApp/AdminActions/VehicleTypeActions"; //reuse 

import {
  ComputationActionsVehicleValue,
  ComputatationRate,
  ComputationActionsBasicPre,
  ComputationActionsTax,
  ComputationActionsAoN
} from "../../AdminApp/AdminActions/ComputationActions"; // reuse

import {
  fetchPartners,
  NewPolicyCreation,
  NewVehicleCreation,
  NewComputationCreation
} from "../../AdminApp/AdminActions/NewPolicyActions"; // reuse admin partner/policy actions

import { fetchModeratorClients } from "../ModeratorActions/ModeratorClientActions"; //  new filtered client fetch
import { db } from "../../dbServer"; //  to get logged-in moderator
import ModeratorPolicyNewClientForm from "../ModeratorForms/ModeratorPolicyNewClientForm";

export default function ModeratorNewPolicyController() {
  const navigate = useNavigate();

  // --- State for client/partners/vehicle ---
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

  // --- Fetch reference data (FILTERED by moderator) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await db.auth.getUser();
        if (!user) return;

        //  Only clients created by this moderator
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

  // --- Fetch vehicle details when a type is selected ---
  useEffect(() => {
    if (selectedType) {
      fetchVehicleDetails(selectedType).then(setVehicleDetails);
    }
  }, [selectedType]);

  // --- Calculations ---
  const safe = (v) => Number(v) || 0;
  const vehicleValue = ComputationActionsVehicleValue(
    safe(vehicleCost),
    safe(yearInput),
    safe(vehicleDetails?.vehicle_Rate)
  );
  const vehicleValueRate = ComputatationRate(
    safe(vehicleDetails?.vehicle_Rate),
    vehicleValue
  );
  const basicPremiumValue =
    ComputationActionsBasicPre(
      safe(vehicleDetails?.bodily_Injury),
      safe(vehicleDetails?.property_Damage),
      safe(vehicleDetails?.personal_Accident)
    ) + vehicleValueRate;
  const totalPremium = ComputationActionsTax(
    basicPremiumValue,
    safe(vehicleDetails?.vat_Tax),
    safe(vehicleDetails?.docu_Stamp),
    safe(vehicleDetails?.local_Gov_Tax)
  );
  const actOfNatureCost = isAoN
    ? ComputationActionsAoN(vehicleValue, safe(vehicleDetails?.aon))
    : 0;
  const totalPremiumCost = totalPremium + actOfNatureCost;

  // --- Save Handler ---
  const handleSave = async () => {
    if (!selectedClient || !selectedPartner)
      return alert("Select client & partner");

    const { data: policyData } = await NewPolicyCreation({
      policy_type: "Comprehensive",
      policy_is_active: false,
      client_id: selectedClient.uid, //  policy links to this client
      partner_id: selectedPartner
    });

    const policyId = policyData[0].id;

    await NewVehicleCreation({
      vehicle_name: vehicleName,
      vehicle_maker: vehicleMaker,
      vehicle_color: vehicleColor,
      plate_num: vehiclePlateNumber,
      engine_serial_no: vehicleEngineNumber,
      vehicle_year: yearInput,
      vin_num: vehicleVinNumber,
      policy_id: policyId
    });

    await NewComputationCreation({
      policy_id: policyId,
      original_Value: safe(vehicleCost),
      current_Value: vehicleValue,
      total_Premium: totalPremiumCost,
      vehicle_Rate_Value: vehicleValueRate,
      aon_Cost: actOfNatureCost
    });

    alert("Policy created successfully");
    navigate("/appinsurance/MainAreaModerator/PolicyModerator");
  };

  return (
    <ModeratorPolicyNewClientForm
      clients={clients}                           // filtered clients only
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
      vehicleEngineNumber={vehicleEngineNumber}setEngineNumber={setEngineNumber}
      vehiclePlateNumber={vehiclePlateNumber} setPlateNumber={setPlateNumber}
      vehicleYear={vehicleYear} setVehicleYear={setVehicleYear}
      vehicleCost={vehicleCost} setVehicleCost={setVehicleCost}
      yearInput={yearInput} setYearInput={setYearInput}
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
