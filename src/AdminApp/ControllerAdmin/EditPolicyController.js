// EditPolicyController.jsx
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
  ComputationActionsAoN,
  ComputationActionsCommission
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

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);

  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState("");

  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleMaker, setVehicleMaker] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleVin, setVehicleVin] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleEngine, setVehicleEngine] = useState("");
  const [yearInput, setYearInput] = useState(0);
  const [originalVehicleCost, setOriginalVehicleCost] = useState(0);
  const [vehicleOriginalValueFromDB, setVehicleOriginalValueFromDB] = useState(0);

  // stored computation fields (pulled from DB)
  const [bodilyInjury, setBodilyInjury] = useState(0);
  const [propertyDamage, setPropertyDamage] = useState(0);
  const [personalAccident, setPersonalAccident] = useState(0);
  const [vatTax, setVatTax] = useState(0);
  const [docuStamp, setDocuStamp] = useState(0);
  const [localGovTax, setLocalGovTax] = useState(0);
  const [aonRate, setAonRate] = useState(0);
  const [isAon, setIsAon] = useState(false);
  const [rateInput, setRateInput] = useState(0);
  
  // 🔧 FIX: Changed to string to preserve input formatting
  const [commissionFee, setCommissionFee] = useState("0");

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const safeNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));

  // load lookups once
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

  // load policy / vehicle / computation once lookups are ready
  useEffect(() => {
    if (!policyId || !clients.length || !vehicleTypes.length) return;
    (async () => {
      try {
        const [policy, vehicle, computation] = await Promise.all([
          fetchPolicyById(policyId),
          fetchVehicleByPolicyId(policyId),
          fetchComputationByPolicyId(policyId)
        ]);

        console.log("=== LOADED DATA ===");
        console.log("Policy:", policy);
        console.log("Vehicle:", vehicle);
        console.log("Computation:", computation);

        if (policy) {
          const foundClient = clients.find((c) => c.uid === policy.client_id);
          setSelectedClient(foundClient || null);
          setSelectedPartner(policy.partner_id || "");
        }

        if (vehicle) {
          setVehicleName(vehicle.vehicle_name || "");
          setVehicleMaker(vehicle.vehicle_maker || "");
          setVehicleColor(vehicle.vehicle_color || "");
          setVehicleVin(vehicle.vin_num || "");
          setVehiclePlate(vehicle.plate_num || "");
          setVehicleEngine(vehicle.engine_serial_no || "");
          setYearInput(vehicle.vehicle_year || 0);
          setVehicleOriginalValueFromDB(vehicle.original_value || 0);
        }

        if (computation) {
          console.log("=== SETTING COMPUTATION VALUES ===");
          console.log("original_Value:", computation.original_Value);
          console.log("current_Value:", computation.current_Value);
          console.log("total_Premium:", computation.total_Premium);
          console.log("aon_Cost:", computation.aon_Cost);
          console.log("commission_fee:", computation.commission_fee);

          setOriginalVehicleCost(computation.original_Value || vehicleOriginalValueFromDB || 0);

          const matchedVehicleType = vehicleTypes.find(
            (vt) => vt.vehicle_type.toLowerCase() === (computation.vehicle_type || "").toLowerCase()
          );
          if (matchedVehicleType) {
            setSelectedVehicleType(matchedVehicleType.vehicle_type);
            const details = await fetchVehicleDetails(matchedVehicleType.vehicle_type);
            setVehicleDetails(details || null);
          }

          setBodilyInjury(computation.bodily_Injury || 0);
          setPropertyDamage(computation.property_Damage || 0);
          setPersonalAccident(computation.personal_Accident || 0);
          setVatTax(computation.vat_Tax || 0);
          setDocuStamp(computation.docu_Stamp || 0);
          setLocalGovTax(computation.local_Gov_Tax || 0);
          setAonRate(computation.aon_Rate || 0);
          setRateInput(computation.vehicle_Rate || 0);
          setIsAon(Boolean(computation.aon_Cost && computation.aon_Cost > 0));
          
          // 🔧 FIX: Convert to string for proper input handling
          setCommissionFee(String(computation.commission_fee ?? 0));
        } else {
          console.warn("No computation data found - using vehicle table values");
          setOriginalVehicleCost(vehicleOriginalValueFromDB);
        }

        setIsDataLoaded(true);
      } catch (err) {
        console.error("Error loading policy data:", err);
        alert("Error loading policy data. See console.");
      }
    })();
  }, [policyId, clients, vehicleTypes]);

  // -----------------------------------
  // COMPUTATION LOGIC
  // -----------------------------------
  const vehicleValue = ComputationActionsVehicleValue(originalVehicleCost, yearInput);
  const vehicleValueRate = ComputatationRate(rateInput, vehicleValue);

  const basicPremiumValue = ComputationActionsBasicPre(
    bodilyInjury,
    propertyDamage,
    personalAccident
  ) + vehicleValueRate;

  const totalPremiumBeforeCommission = ComputationActionsTax(
    basicPremiumValue,
    vatTax,
    docuStamp,
    localGovTax
  );

  const actOfNatureCost = isAon ? ComputationActionsAoN(vehicleValue, aonRate) : 0;

  // 🔧 FIX: Convert string to number for calculation
  const commissionFeeNumber = parseFloat(commissionFee) || 0;
  const commissionValue = commissionFeeNumber > 0
    ? ComputationActionsCommission(
        totalPremiumBeforeCommission + actOfNatureCost,
        commissionFeeNumber
      )
    : 0;

  const totalPremiumFinal = totalPremiumBeforeCommission + actOfNatureCost + commissionValue;
  const basicPremiumWithCommission = basicPremiumValue + commissionValue;

  console.log("=== COMPUTED VALUES ===");
  console.log("originalVehicleCost:", originalVehicleCost);
  console.log("vehicleValue:", vehicleValue);
  console.log("basicPremiumValue:", basicPremiumValue);
  console.log("commissionFee (%):", commissionFeeNumber);
  console.log("commissionValue (₱):", commissionValue);
  console.log("totalPremiumFinal:", totalPremiumFinal);

  // Update handler
  const handleUpdatePolicy = async () => {
    try {
      // 🔧 FIX: Convert commission fee to number before saving
      const commissionFeeToSave = parseFloat(commissionFee) || 0;

      console.log("=== SAVING UPDATES ===");
      console.log("Commission fee (%) to save:", commissionFeeToSave);
      console.log("Total Premium:", totalPremiumFinal);

      const policyResult = await updatePolicy(policyId, {
        client_id: selectedClient?.uid,
        partner_id: selectedPartner
      });
      if (!policyResult.success) throw new Error(policyResult.error);

      const vehicle = await fetchVehicleByPolicyId(policyId);
      if (!vehicle) throw new Error("Vehicle not found");

      const vehicleTypeId = vehicleTypes.find((v) => v.vehicle_type === selectedVehicleType)?.id || null;

      const vehicleResult = await updateVehicle(vehicle.id, {
        vehicle_name: vehicleName,
        vehicle_maker: vehicleMaker,
        vehicle_color: vehicleColor,
        vin_num: vehicleVin,
        plate_num: vehiclePlate,
        engine_serial_no: vehicleEngine,
        vehicle_year: yearInput,
        original_value: originalVehicleCost,
        vehicle_type_id: vehicleTypeId
      });
      if (!vehicleResult.success) throw new Error(vehicleResult.error);

      const computationData = {
        original_Value: originalVehicleCost,
        current_Value: vehicleValue,
        vehicle_Rate_Value: vehicleValueRate,
        total_Premium: totalPremiumFinal,
        aon_Cost: actOfNatureCost,
        commission_fee: commissionFeeToSave // 🔧 FIX: Save as number
      };

      // 🔧 DEBUG: Log the data being saved
      console.log("💾 Computation data being saved:", computationData);

      const computationResult = await updateComputation(policyId, computationData);
      if (!computationResult.success) throw new Error(computationResult.error);

      alert("Policy updated successfully!");
      navigate("/appinsurance/main-app/policy");
    } catch (err) {
      console.error("Error updating policy:", err);
      alert(`Error updating policy: ${err.message}`);
    }
  };

  // Pass everything into presentational form
  return (
    <PolicyEditForm
      vehicleTypes={vehicleTypes}
      selected={selectedVehicleType}
      setSelected={setSelectedVehicleType}
      vehicleDetails={vehicleDetails}
      yearInput={yearInput}
      setYearInput={setYearInput}
      vehicleOriginalValueFromDB={vehicleOriginalValueFromDB}
      setVehicleOriginalValueFromDB={setVehicleOriginalValueFromDB}
      basicPremiumValue={basicPremiumValue}
      basicPremiumWithCommission={basicPremiumWithCommission}
      isAoN={isAon}
      setIsAoN={setIsAon}  // 🔧 FIX: Changed from setIsAoN to setIsAon (lowercase 'a')
      setOriginalVehicleCost={setOriginalVehicleCost}
      originalVehicleCost={originalVehicleCost}
      currentVehicleValueCost={vehicleValue}
      totalVehicleValueRate={vehicleValueRate}
      totalPremiumCost={totalPremiumFinal}
      actOfNatureCost={actOfNatureCost}
      commissionRate={commissionFee} // Pass as string
      setCommissionRate={setCommissionFee} // 🔧 FIX: Direct setter
      commissionValue={commissionValue}
      vehicleName={vehicleName}
      setVehicleName={setVehicleName}
      vehicleMaker={vehicleMaker}
      setVehicleMaker={setVehicleMaker}
      vehicleColor={vehicleColor}
      setVehicleColor={setVehicleColor}
      vehicleVinNumber={vehicleVin}
      setVinNumber={setVehicleVin}
      vehiclePlateNumber={vehiclePlate}
      setPlateNumber={setVehiclePlate}
      vehicleEngineNumber={vehicleEngine}
      setEngineNumber={setVehicleEngine}
      clients={clients}
      selectedClient={selectedClient}
      setSelectedClient={setSelectedClient}
      partners={partners}
      selectedPartner={selectedPartner}
      setSelectedPartner={setSelectedPartner}
      onSaveClient={handleUpdatePolicy}
      navigate={navigate}
    />
  );
}