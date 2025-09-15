import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { 
  getComputationValue, 
  fetchVehicleDetails 
} from "../AdminActions/VehicleTypeActions";

import { 
  ComputationActionsVehicleValue,
  ComputatationRate,
  ComputationActionsBasicPre,  
  ComputationActionsTax, 
  ComputationActionsAoN  
} from "../AdminActions/ComputationActions";

import { 
  NewComputationCreation, 
  NewVehicleCreation,
  NewPolicyCreation,
  fetchClients,
  fetchPartners
} from "../AdminActions/NewPolicyActions";

import PolicyNewClient from "../AdminForms/PolicyNewClient"; 

export default function NewPolicyController() {
  const navigate = useNavigate();

  // -----------------------------
  // Vehicle Calculation Reference Sheet
  // -----------------------------
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [selected, setSelected] = useState(""); 
  const [vehicleDetails, setVehicleDetails] = useState(null);

  useEffect(() => {
    async function loadVehicleTypes() {
      const types = await getComputationValue();
      console.log("Fetched Vehicle Types:", types);
      setVehicleTypes(types);
    }
    loadVehicleTypes();
  }, []);

  useEffect(() => {
    if (!selected) return;
    async function loadDetails() {
      const details = await fetchVehicleDetails(selected);
      setVehicleDetails(details);
    }
    loadDetails();
  }, [selected]);


  // -----------------------------
  // Client Details
  // -----------------------------
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);


  useEffect(() => {
      const loadClients = async () => {
        const result = await fetchClients(); 
        setClients(result);
      };
      loadClients();
    }, []);




  // -----------------------------
  // Vehicle Details
  // -----------------------------
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleMaker, setVehicleMaker] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleVinNumber, setVinNumber] = useState("");
  const [vehiclePlateNumber, setPlatnumber] = useState(0);
  const [vehicleYear, setVehicleYear] = useState(0)


  // -----------------------------
  // PREMIUM INPUTS
  // -----------------------------
  const [rateInput, setRateInput] = useState(0);
  const [yearInput, setYearInput] = useState(0);
  const [vehicleCost, setVehicleCost] = useState(0);
  const [bodily_Injury, setBodily_Injury] = useState(0);
  const [property_Damage, setProperty_Damage] = useState(0);
  const [personal_Accident, setPersonal_Accident] = useState(0);
  const [vat_Tax, setVat_Tax] = useState(0);
  const [docu_Stamp, setDocu_Stamp] = useState(0);
  const [local_Gov_Tax, setLocal_Gov_Tax] = useState(0); 
  const [AoNRate, setAoNRate] = useState(0);
  const [isAoN, setIsAoN] = useState(false);

  useEffect(() => {
    if (vehicleDetails) {
      setRateInput(vehicleDetails.vehicle_Rate || 0);
      setBodily_Injury(vehicleDetails.bodily_Injury || 0);
      setProperty_Damage(vehicleDetails.property_Damage || 0);
      setPersonal_Accident(vehicleDetails.personal_Accident || 0);
      setVat_Tax(vehicleDetails.vat_Tax || 0);
      setDocu_Stamp(vehicleDetails.docu_Stamp || 0);
      setLocal_Gov_Tax(vehicleDetails.local_Gov_Tax || 0);
      setAoNRate(vehicleDetails.aon || 0);
    }
  }, [vehicleDetails]);

  // -----------------------------
  // SAFE CALC HELPERS
  // -----------------------------
  const safeNumber = (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  const safeCalculate = (calculationFn, ...args) => {
    try {
      const safeArgs = args.map(arg => safeNumber(arg));
      const result = calculationFn(...safeArgs);
      return isNaN(result) ? 0 : result;
    } catch (error) {
      console.error("Calculation error:", error);
      return 0;
    }
  };

  // -----------------------------
  // PREMIUM CALCULATIONS
  // -----------------------------
  const vehicleValue = safeCalculate(ComputationActionsVehicleValue, vehicleCost, yearInput, rateInput);
  const vehicleValueRate = safeCalculate(ComputatationRate, rateInput, vehicleValue);
  const basicPremiumValue = safeCalculate(
    ComputationActionsBasicPre, 
    bodily_Injury, 
    property_Damage, 
    personal_Accident
  ) + vehicleValueRate;

  const totalPremiumValue = safeCalculate(
    ComputationActionsTax, 
    basicPremiumValue, 
    vat_Tax, 
    docu_Stamp, 
    local_Gov_Tax
  );

  // AoN ADD-ON (extra fee only)
  const actOfNatureCost = isAoN 
    ? safeCalculate(ComputationActionsAoN, vehicleValue, AoNRate) 
    : 0;

  // Final total (base premium + AoN if selected)
  const totalPremiumValueWithAoN = totalPremiumValue + actOfNatureCost;

  // -----------------------------
  // STATE TRACKING
  // -----------------------------
  const [orginalVehicleCost, setOriginalVehicleCost] = useState(0);
  const [currentVehicleValueCost, setCurrentVehicleCost] = useState(0);
  const [totalVehicleValueRate, setTotalVehicleValueRate] = useState(0);
  const [totalPremiumCost, setTotalPremiumCost] = useState(0);

  useEffect(() => {
    setOriginalVehicleCost(vehicleCost);
    setCurrentVehicleCost(vehicleValue);
    setTotalVehicleValueRate(vehicleValueRate);
    setTotalPremiumCost(totalPremiumValueWithAoN); // ✅ now includes AoN
  }, [vehicleCost, vehicleValue, vehicleValueRate, totalPremiumValueWithAoN]);

  

  

  // -----------------------------
  // SAVE CLIENT
  // -----------------------------
  const handleSaveClient = async () => {
   

    const policyData = {
    policy_type: "Comprehensive",                
    policy_inception: null,   
    policy_expiry: null,               
    policy_is_active: false,
    client_id: selectedClient?.uid,               
    partner_id: selectedPartner
  };

  const { success: policySuccess, data: policyRow, error: policyError } =
    await NewPolicyCreation(policyData);

    

  if (!policySuccess) {
    return alert("Error saving policy: " + policyError);
  }

        const selectedVehicleType = vehicleTypes.find(
        (v) => v.vehicle_type === selected
      );


      const policyId = policyRow[0].id;

      const vehicleData = {
      vehicle_name: vehicleName,
      vehicle_maker: vehicleMaker,
      vehicle_color: vehicleColor,
      plate_num: vehiclePlateNumber,
      vehicle_year: yearInput,  
      vin_num: vehicleVinNumber,
      policy_id: policyId,
      vehicle_type_id: selectedVehicleType?.id 
    }

    const newVehicleDataResult = await NewVehicleCreation(vehicleData);
    if(!newVehicleDataResult.success){
      return console.error("Error Saving Vehicle Details" + newVehicleDataResult.error);
    }

    const clientComputationData = {
        policy_id: policyId, // <-- use the newly created policy id
        "original_Value": orginalVehicleCost,
        "current_Value": currentVehicleValueCost,
        "total_Premium": totalPremiumCost,
        "vehicle_Rate_Value": totalVehicleValueRate,
        "aon_Cost": actOfNatureCost
      };

    const newComputationResult = await NewComputationCreation(clientComputationData);


    if (newComputationResult.success) {
      alert("Client and computation saved successfully!");
      navigate("/appinsurance/MainArea/Policy");
    } else {
      alert("Error saving computation: " + newComputationResult.error);
    }



  };

  // -----------------------------
  // PARTNERS
  // -----------------------------
  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");

  useEffect(() => {
    async function loadPartners() {
      const data = await fetchPartners();
      setPartners(data);
    }
    loadPartners();
  }, []);

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <PolicyNewClient
    vehicleTypes={vehicleTypes}
    selected={selected}
    setSelected={setSelected}
    vehicleDetails={vehicleDetails}
    yearInput={yearInput}
    setYearInput={(v) => setYearInput(v === "" ? 0 : safeNumber(v))}
    vehicleCost={vehicleCost}
    setVehicleCost={(v) => setVehicleCost(v === "" ? 0 : safeNumber(v))}
    vehicleValue={vehicleValue}
    vehicleValueRate={vehicleValueRate}
    basicPremiumValue={basicPremiumValue}
    totalPremiumValue={totalPremiumValue}
    totalPremiumValueWithAoN={totalPremiumValueWithAoN}
    isAoN={isAoN}
    setIsAoN={setIsAoN}
    orginalVehicleCost={orginalVehicleCost}
    currentVehicleValueCost={currentVehicleValueCost}
    totalVehicleValueRate={totalVehicleValueRate}
    totalPremiumCost={totalPremiumCost}
    actOfNatureCost={actOfNatureCost}
    partners={partners}
    selectedPartner={selectedPartner}
    setSelectedPartner={setSelectedPartner}

    vehicleMaker={vehicleMaker}
    setVehicleMaker={setVehicleMaker}
    vehicleName={vehicleName}
    setVehicleName={setVehicleName}
   
    vehicleColor={vehicleColor}
    setVehicleColor={setVehicleColor}
    vehicleVinNumber={vehicleVinNumber}
    setVinNumber={setVinNumber}
    vehiclePlateNumber={vehiclePlateNumber}
    setPlateNumber={setPlatnumber}
    vehicleYear={vehicleYear}
    setVehicleYear={setVehicleYear}

    clients={clients}
    selectedClient={selectedClient}
    setSelectedClient={setSelectedClient}

    onSaveClient={handleSaveClient}
    navigate={navigate}
    />
  );
}
