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
  ComputationActionsAoN,
  ComputationActionsCommission
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

  // -----------------------------------
  // Lookup data
  // -----------------------------------
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);

  // -----------------------------------
  // Selected items
  // -----------------------------------
  const [selected, setSelected] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("");
  const [vehicleDetails, setVehicleDetails] = useState(null);

  // -----------------------------------
  // Vehicle info
  // -----------------------------------
  const [vehicleName, setVehicleName] = useState("");
  const [vehicleMaker, setVehicleMaker] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleVinNumber, setVinNumber] = useState("");
  const [vehiclePlateNumber, setPlateNumber] = useState("");
  const [vehicleEngineNumber, setEngineNumber] = useState("");
  const [vehicleYear, setVehicleYear] = useState(0);

  // -----------------------------------
  // Computation inputs
  // -----------------------------------
  const [vehicleCost, setVehicleCost] = useState(0);
  const [yearInput, setYearInput] = useState(0);
  const [rateInput, setRateInput] = useState(0);

  const [bodily_Injury, setBodily_Injury] = useState(0);
  const [property_Damage, setProperty_Damage] = useState(0);
  const [personal_Accident, setPersonal_Accident] = useState(0);

  const [vat_Tax, setVat_Tax] = useState(0);
  const [docu_Stamp, setDocu_Stamp] = useState(0);
  const [local_Gov_Tax, setLocal_Gov_Tax] = useState(0);

  const [AoNRate, setAoNRate] = useState(0);
  const [isAoN, setIsAoN] = useState(false);

  const [commissionFee, setCommissionFee] = useState("0");

  // -----------------------------------
  // Derived values
  // -----------------------------------
  const [orginalVehicleCost, setOriginalVehicleCost] = useState(0);
  const [currentVehicleValueCost, setCurrentVehicleCost] = useState(0);
  const [totalVehicleValueRate, setTotalVehicleValueRate] = useState(0);
  const [totalPremiumCost, setTotalPremiumCost] = useState(0);
  const [commissionValue, setCommissionValue] = useState(0);
  

  const safeNumber = (v) => isNaN(Number(v)) ? 0 : Number(v);

  // -----------------------------------
  // Load lookup data
  // -----------------------------------
  useEffect(() => {
    (async () => {
      const [vt, cl, pt, pmt] = await Promise.all([
        getComputationValue(),
        fetchClients(),
        fetchPartners(),
        fetchPaymentTypes()
      ]);
      setVehicleTypes(vt || []);
      setClients(cl || []);
      setPartners(pt || []);
      setPaymentTypes(pmt || []);
    })();
  }, []);

  // Fetch payment types function
  const fetchPaymentTypes = async () => {
    try {
      const { db } = await import("../../dbServer");
      const { data, error } = await db
        .from("payment_type")
        .select("*")
        .order("months_payment", { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching payment types:", error);
      return [];
    }
  };

  // -----------------------------------
  // Load vehicle details
  // -----------------------------------
  useEffect(() => {
    if (!selected) return setVehicleDetails(null);
    (async () => {
      const details = await fetchVehicleDetails(selected);
      setVehicleDetails(details || null);
    })();
  }, [selected]);

  useEffect(() => {
    if (!vehicleDetails) return;
    setRateInput(vehicleDetails.vehicle_Rate || 0);
    setBodily_Injury(vehicleDetails.bodily_Injury || 0);
    setProperty_Damage(vehicleDetails.property_Damage || 0);
    setPersonal_Accident(vehicleDetails.personal_Accident || 0);
    setVat_Tax(vehicleDetails.vat_Tax || 0);
    setDocu_Stamp(vehicleDetails.docu_Stamp || 0);
    setLocal_Gov_Tax(vehicleDetails.local_Gov_Tax || 0);
    setAoNRate(vehicleDetails.aon || 0);
  }, [vehicleDetails]);

  // -----------------------------------
  // Computations
  // -----------------------------------
  const vehicleValue = ComputationActionsVehicleValue(vehicleCost, yearInput);
  const vehicleValueRate = ComputatationRate(rateInput, vehicleValue);
  
  const basicPremiumValue = ComputationActionsBasicPre(
    bodily_Injury,
    property_Damage,
    personal_Accident
  ) + vehicleValueRate;

  const totalPremiumBeforeCommission = ComputationActionsTax(
    basicPremiumValue,
    vat_Tax,
    docu_Stamp,
    local_Gov_Tax
  );

  const actOfNatureCost = isAoN ? ComputationActionsAoN(vehicleValue, AoNRate) : 0;

  const commissionFeeNumber = parseFloat(commissionFee) || 0;
  const computedCommissionValue = commissionFeeNumber > 0
    ? ComputationActionsCommission(
        totalPremiumBeforeCommission + actOfNatureCost,
        commissionFeeNumber
      )
    : 0;

  const totalWithCommission = totalPremiumBeforeCommission + actOfNatureCost + computedCommissionValue;
  const basicPremiumWithCommissionValue = basicPremiumValue + computedCommissionValue;

  useEffect(() => {
    setOriginalVehicleCost(vehicleCost);
    setCurrentVehicleCost(vehicleValue);
    setTotalVehicleValueRate(vehicleValueRate);
    setTotalPremiumCost(totalWithCommission);
    setCommissionValue(computedCommissionValue);
  }, [vehicleCost, vehicleValue, vehicleValueRate, totalWithCommission, computedCommissionValue]);

  // -----------------------------------
  // Save handler
  // -----------------------------------
  const handleSaveClient = async () => {
    // Validation
    if (!selectedClient) {
      alert("Please select a client");
      return;
    }
    if (!selectedPartner) {
      alert("Please select a partner");
      return;
    }
    if (!selectedPaymentType) {
      alert("Please select a payment type");
      return;
    }

    const commissionFeeToSave = parseFloat(commissionFee) || 0;

    console.log("=== SAVING NEW POLICY ===");
    console.log("Payment Type ID:", selectedPaymentType);

    const policyData = {
      policy_type: "Comprehensive",
      policy_inception: null,
      policy_expiry: null,
      policy_is_active: false,
      client_id: selectedClient?.uid,
      partner_id: selectedPartner
    };

    const { success: policySuccess, data: policyRow, error: policyError } = await NewPolicyCreation(policyData);
    if (!policySuccess) return alert("Error saving policy: " + policyError);

    const policyId = policyRow[0].id;
    const vehicleTypeObj = vehicleTypes.find(v => v.vehicle_type === selected);

    const vehicleData = {
      vehicle_name: vehicleName,
      vehicle_maker: vehicleMaker,
      vehicle_color: vehicleColor,
      plate_num: vehiclePlateNumber,
      vehicle_year: yearInput,
      vin_num: vehicleVinNumber,
      engine_serial_no: vehicleEngineNumber,
      policy_id: policyId,
      vehicle_type_id: vehicleTypeObj?.id || null
    };

    const newVehicleResult = await NewVehicleCreation(vehicleData);
    if (!newVehicleResult.success) return alert("Error saving vehicle details");

    const computationData = {
    policy_id: policyId,
    original_Value: orginalVehicleCost,
    current_Value: currentVehicleValueCost,
    total_Premium: totalWithCommission,
    vehicle_Rate_Value: totalVehicleValueRate,
    aon_Cost: actOfNatureCost,
    commission_fee: commissionFeeToSave,
    payment_type_id: Number(selectedPaymentType)
  };

    const computationResult = await NewComputationCreation(computationData);
    if (!computationResult.success) {
      alert("Error saving computation: " + computationResult.error);
      return;
    }

    alert("Policy created successfully!");
    navigate("/appinsurance/main-app/policy");
  };

  // -----------------------------------
  // Render
  // -----------------------------------
  return (
    <PolicyNewClient
      vehicleTypes={vehicleTypes}
      selected={selected}
      setSelected={setSelected}
      vehicleDetails={vehicleDetails}
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
      vehicleEngineNumber={vehicleEngineNumber}
      setEngineNumber={setEngineNumber}
      vehicleYear={vehicleYear}
      setVehicleYear={setVehicleYear}
      yearInput={yearInput}
      setYearInput={(v) => setYearInput(v === "" ? 0 : safeNumber(v))}
      vehicleCost={vehicleCost}
      setVehicleCost={(v) => setVehicleCost(v === "" ? 0 : safeNumber(v))}
      rateInput={rateInput}
      bodily_Injury={bodily_Injury}
      property_Damage={property_Damage}
      personal_Accident={personal_Accident}
      vat_Tax={vat_Tax}
      docu_Stamp={docu_Stamp}
      local_Gov_Tax={local_Gov_Tax}
      AoNRate={AoNRate}
      isAoN={isAoN}
      setIsAoN={setIsAoN}
      orginalVehicleCost={orginalVehicleCost}
      currentVehicleValueCost={currentVehicleValueCost}
      totalVehicleValueRate={totalVehicleValueRate}
      basicPremiumValue={basicPremiumValue}
      totalPremiumValue={totalPremiumBeforeCommission}
      actOfNatureCost={actOfNatureCost}
      commissionFee={commissionFee}
      setCommissionFee={setCommissionFee}
      commissionValue={commissionValue}
      totalPremiumWithCommission={totalWithCommission}
      basicPremiumWithCommissionValue={basicPremiumWithCommissionValue} 
      totalPremiumCost={totalPremiumCost}
      clients={clients}
      selectedClient={selectedClient}
      setSelectedClient={setSelectedClient}
      partners={partners}
      selectedPartner={selectedPartner}
      setSelectedPartner={setSelectedPartner}
      paymentTypes={paymentTypes}
      selectedPaymentType={selectedPaymentType}
      setSelectedPaymentType={setSelectedPaymentType}
      onSaveClient={handleSaveClient}
      navigate={navigate}
    />
  );
}