import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  fetchClients,
  fetchPartners,
  fetchPolicyById,
  fetchVehicleByPolicyId,
  fetchComputationByPolicyId,
  updatePolicy,
  updateVehicle,
  updateComputation
} from "../AdminActions/EditPolicyActions";

import PolicyEditForm from "../AdminForms/PolicyEditForm";

export default function EditPolicyController() {
  const navigate = useNavigate();
  const { policyId } = useParams();

  // -----------------------------
  // Dropdowns & selections
  // -----------------------------
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState("");

  const [vehicleDetails, setVehicleDetails] = useState(null);

  // -----------------------------
  // Vehicle info (editable inputs)
  // -----------------------------
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleMaker, setVehicleMaker] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleVinNumber, setVinNumber] = useState("");
  const [vehiclePlateNumber, setPlateNumber] = useState("");
  const [vehicleYear, setVehicleYear] = useState(0);
  const [yearInput, setYearInput] = useState(0);
  const [originalVehicleCost, setOriginalVehicleCost] = useState(0);

  // Keep DB original value for comparison (readonly)
  const [vehicleOriginalValueFromDB, setVehicleOriginalValueFromDB] = useState(0);


  // keep track of the original/default values


  // -----------------------------
  // Premium inputs
  // -----------------------------
  const [rateInput, setRateInput] = useState(0);
  const [bodily_Injury, setBodily_Injury] = useState(0);
  const [property_Damage, setProperty_Damage] = useState(0);
  const [personal_Accident, setPersonal_Accident] = useState(0);
  const [vat_Tax, setVat_Tax] = useState(0);
  const [docu_Stamp, setDocu_Stamp] = useState(0);
  const [local_Gov_Tax, setLocal_Gov_Tax] = useState(0);
  const [AoNRate, setAoNRate] = useState(0);
  const [isAoN, setIsAoN] = useState(false);

  // -----------------------------
  // Computed / display values
  // -----------------------------
  const [currentVehicleValueCost, setCurrentVehicleCost] = useState(0);
  const [totalVehicleValueRate, setTotalVehicleValueRate] = useState(0);
  const [totalPremiumCost, setTotalPremiumCost] = useState(0);

  // State to track if initial data is loaded
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // -----------------------------
  // Helpers
  // -----------------------------
  const safeNumber = (value) => (isNaN(Number(value)) ? 0 : Number(value));
  const safeCalculate = (fn, ...args) => {
    try {
      return fn(...args.map(safeNumber));
    } catch (err) {
      console.error("Calculation error:", err);
      return 0;
    }
  };

  // -----------------------------
  // Load dropdowns once
  // -----------------------------
  useEffect(() => {
    (async () => {
      const [vt, cl, pt] = await Promise.all([
        getComputationValue(),
        fetchClients(),
        fetchPartners()
      ]);
      setVehicleTypes(vt || []);
      setClients(cl || []);
      setPartners(pt || []);
    })();
  }, []);

  // -----------------------------
  // Load existing policy (single source of truth)
  // -----------------------------
  useEffect(() => {
    if (!policyId || clients.length === 0 || vehicleTypes.length === 0) return;

    (async () => {
      try {
        //devLogs
        console.log("🔄 Loading policy data for ID:", policyId);
        
        const [policy, vehicle, computation] = await Promise.all([
          fetchPolicyById(policyId),
          fetchVehicleByPolicyId(policyId),
          fetchComputationByPolicyId(policyId)
        ]);

         //devLogs
        console.log("📋 Policy data:", policy);
        console.log("🚗 Vehicle data:", vehicle);
        console.log("📊 Computation data:", computation);
        console.log("🎯 Available vehicle types:", vehicleTypes);

        // Set client & partner
        if (policy) {
          const foundClient = clients.find(c => c.uid === policy.client_id);
          setSelectedClient(foundClient || null);
          setSelectedPartner(policy.partner_id || "");
          console.log("👤 Found client:", foundClient);
        }

        // Set vehicle info
        if (vehicle) {
          // Set basic vehicle info
          setVehicleName(vehicle.vehicle_name || "");
          setVehicleMaker(vehicle.vehicle_maker || "");
          setVehicleColor(vehicle.vehicle_color || "");
          setVinNumber(vehicle.vin_num || "");
          setPlateNumber(vehicle.plate_num || "");
          setVehicleYear(vehicle.vehicle_year || 0);
          setYearInput(vehicle.vehicle_year || 0);
          setOriginalVehicleCost(vehicle.original_value || 0);
          setVehicleOriginalValueFromDB(vehicle.original_value || 0);
        }

        // Set computation values and get vehicle type from calculation_Table
        if (computation) {
          const original = computation.original_Value || 0;
          
           //devLogs
          console.log("🎯 Vehicle type from computation:", computation.vehicle_type);
          
          // IMPORTANT: Get the vehicle_type from the computation/calculation_Table
          if (computation.vehicle_type) {
            const matchedVehicleType = vehicleTypes.find(
              (vt) => vt.vehicle_type.toLowerCase() === computation.vehicle_type.toLowerCase()
            );
            
             //devLogs
            console.log("🔍 Looking for vehicle type:", computation.vehicle_type);
            console.log("✅ Matched vehicle type:", matchedVehicleType);
            
            if (matchedVehicleType) {
              console.log("🎉 Setting vehicle type to:", matchedVehicleType.vehicle_type);
              setSelectedVehicleType(matchedVehicleType.vehicle_type);
              
              // Load vehicle details for this type
              const details = await fetchVehicleDetails(matchedVehicleType.vehicle_type);
              if (details) {
                setVehicleDetails(details);
              }
            } else {
              console.log("❌ No matching vehicle type found");
              console.log("Available types:", vehicleTypes.map(v => v.vehicle_type));
            }
          } else {
            console.log("❌ No vehicle_type found in computation data");
          }
          
          // Set the actual saved computation values
          setRateInput(computation.vehicle_Rate || 0);
          setBodily_Injury(computation.bodily_Injury || 0);
          setProperty_Damage(computation.property_Damage || 0);
          setPersonal_Accident(computation.personal_Accident || 0);
          setVat_Tax(computation.vat_Tax || 0);
          setDocu_Stamp(computation.docu_Stamp || 0);
          setLocal_Gov_Tax(computation.local_Gov_Tax || 0);
          setAoNRate(computation.aon_Rate || 0);
          setIsAoN(computation.aon_Cost > 0);
          setCurrentVehicleCost(computation.current_Value || 0);
          setTotalVehicleValueRate(computation.vehicle_Rate_Value || 0);
          setTotalPremiumCost(computation.total_Premium || 0);
          setOriginalVehicleCost(original);
          setVehicleOriginalValueFromDB(original);
        }

        setIsDataLoaded(true);
        console.log("✅ Data loading complete");

      } catch (err) {
        console.error("❌ Error loading policy data:", err);
        alert("Error loading policy data. See console.");
      }
    })();
  }, [policyId, clients, vehicleTypes]); // Added vehicleTypes as dependency

  // Debug: Log the selected vehicle type whenever it changes
  useEffect(() => {
    console.log("🎯 Selected vehicle type changed to:", selectedVehicleType);
    console.log("🎯 Vehicle types available:", vehicleTypes.map(v => v.vehicle_type));
    console.log("🎯 Is data loaded:", isDataLoaded);
  }, [selectedVehicleType]);
  useEffect(() => {
    if (!selectedVehicleType || !isDataLoaded) return;

    (async () => {
      const details = await fetchVehicleDetails(selectedVehicleType);
      setVehicleDetails(details || null);

      if (details) {
        setRateInput(details.vehicle_Rate || 0);
        setBodily_Injury(details.bodily_Injury || 0);
        setProperty_Damage(details.property_Damage || 0);
        setPersonal_Accident(details.personal_Accident || 0);
        setVat_Tax(details.vat_Tax || 0);
        setDocu_Stamp(details.docu_Stamp || 0);
        setLocal_Gov_Tax(details.local_Gov_Tax || 0);
        setAoNRate(details.aon || 0);
      }
    })();
  }, [selectedVehicleType, isDataLoaded]);

  // -----------------------------
  // Recompute totals on changes
  // -----------------------------
  useEffect(() => {
    if (!isDataLoaded) return; // Don't compute until data is loaded

    const vehicleValue = safeCalculate(
      ComputationActionsVehicleValue, 
      originalVehicleCost, 
      yearInput, 
      rateInput
    );
    const vehicleValueRate = safeCalculate(ComputatationRate, rateInput, vehicleValue);
    const basicPremium = safeCalculate(
      ComputationActionsBasicPre, 
      bodily_Injury, 
      property_Damage, 
      personal_Accident
    ) + vehicleValueRate;
    const totalPremium = safeCalculate(
      ComputationActionsTax, 
      basicPremium, 
      vat_Tax, 
      docu_Stamp, 
      local_Gov_Tax
    );
    const actOfNature = isAoN 
      ? safeCalculate(ComputationActionsAoN, vehicleValue, AoNRate)
      : 0;

    setCurrentVehicleCost(vehicleValue);
    setTotalVehicleValueRate(vehicleValueRate);
    setTotalPremiumCost(totalPremium + actOfNature);
  }, [
    originalVehicleCost, yearInput, rateInput, 
    bodily_Injury, property_Damage, personal_Accident, 
    vat_Tax, docu_Stamp, local_Gov_Tax, isAoN, AoNRate,
    isDataLoaded
  ]);

  // -----------------------------
  // Update policy handler
  // -----------------------------
  const handleUpdatePolicy = async () => {
    try {
      // Update policy
      const policyResult = await updatePolicy(policyId, {
        client_id: selectedClient?.uid,
        partner_id: selectedPartner
      });
      
      if (!policyResult.success) {
        throw new Error(policyResult.error);
      }

      // Get the vehicle to update
      const vehicle = await fetchVehicleByPolicyId(policyId);
      if (!vehicle) {
        throw new Error("Vehicle not found");
      }

      const vehicleTypeId = vehicleTypes.find(
        (v) => v.vehicle_type === selectedVehicleType
      )?.id || null;

      // Update vehicle
      const vehicleResult = await updateVehicle(vehicle.id, {
        vehicle_name: vehicleName,
        vehicle_maker: vehicleMaker,
        vehicle_color: vehicleColor,
        vin_num: vehicleVinNumber,
        plate_num: vehiclePlateNumber,
        vehicle_year: yearInput,
        vehicle_type_id: vehicleTypeId,
      });

      if (!vehicleResult.success) {
        throw new Error(vehicleResult.error);
      }

      // Update computation
      const computationResult = await updateComputation(policyId, {
        original_Value: originalVehicleCost,
        current_Value: currentVehicleValueCost,
        vehicle_Rate_Value: totalVehicleValueRate,
        total_Premium: totalPremiumCost,
        aon_Cost: isAoN ? safeCalculate(ComputationActionsAoN, currentVehicleValueCost, AoNRate) : 0
      });

      if (!computationResult.success) {
        throw new Error(computationResult.error);
      }

      alert("Policy updated successfully!");
      navigate("/appinsurance/MainArea/Policy");
    } catch (err) {
      console.error("Error updating policy:", err);
      alert(`Error updating policy: ${err.message}`);
    }
  };

  // Calculate basicPremiumValue for display
  const basicPremiumValue = safeCalculate(
    ComputationActionsBasicPre, 
    bodily_Injury, 
    property_Damage, 
    personal_Accident
  ) + totalVehicleValueRate;

  // Calculate actOfNatureCost for display
  const actOfNatureCost = isAoN 
    ? safeCalculate(ComputationActionsAoN, currentVehicleValueCost, AoNRate)
    : 0;

  return (
    <PolicyEditForm
      vehicleTypes={vehicleTypes}
      selected={selectedVehicleType}
      setSelected={setSelectedVehicleType}
      vehicleDetails={vehicleDetails}
      yearInput={yearInput}
      setYearInput={setYearInput}
      originalVehicleCost={originalVehicleCost}
      vehicleOriginalValueFromDB={vehicleOriginalValueFromDB} 
      setVehicleOriginalValueFromDB={setVehicleOriginalValueFromDB}
      setOriginalVehicleCost={setOriginalVehicleCost}
      basicPremiumValue={basicPremiumValue}
      vehicleName={vehicleName}
      setVehicleName={setVehicleName}
      vehicleMaker={vehicleMaker}
      setVehicleMaker={setVehicleMaker}
      vehicleColor={vehicleColor}
      setVehicleColor={setVehicleColor}
      vehicleVinNumber={vehicleVinNumber}
      setVinNumber={setVinNumber}
      vehiclePlateNumber={vehiclePlateNumber}
      setPlateNumber={setPlateNumber}
      selectedClient={selectedClient}
      setSelectedClient={setSelectedClient}
      selectedPartner={selectedPartner}
      setSelectedPartner={setSelectedPartner}
      clients={clients}
      partners={partners}
      vehicleYear={vehicleYear}
      setVehicleYear={setVehicleYear}
      isAoN={isAoN}
      setIsAoN={setIsAoN}
      currentVehicleValueCost={currentVehicleValueCost}
      totalVehicleValueRate={totalVehicleValueRate}
      totalPremiumCost={totalPremiumCost}
      actOfNatureCost={actOfNatureCost}
      rateInput={rateInput}
      bodily_Injury={bodily_Injury}
      property_Damage={property_Damage}
      personal_Accident={personal_Accident}
      vat_Tax={vat_Tax}
      docu_Stamp={docu_Stamp}
      local_Gov_Tax={local_Gov_Tax}
      AoNRate={AoNRate}
      onSaveClient={handleUpdatePolicy}
      navigate={navigate}
    />
  );
}