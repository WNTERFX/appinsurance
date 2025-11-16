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
import CustomAlertModal from "../AdminForms/CustomAlertModal";
import CustomConfirmModal from "../AdminForms/CustomConfirmModal";

export default function EditPolicyController() {
  const navigate = useNavigate();
  const { policyId } = useParams();

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [clients, setClients] = useState([]);
  const [partners, setPartners] = useState([]);
  const [paymentTypes, setPaymentTypes] = useState([]);

  const [selectedVehicleType, setSelectedVehicleType] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState("");
  const [selectedPaymentType, setSelectedPaymentType] = useState("");

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

  const [bodilyInjury, setBodilyInjury] = useState(0);
  const [propertyDamage, setPropertyDamage] = useState(0);
  const [personalAccident, setPersonalAccident] = useState(0);
  const [vatTax, setVatTax] = useState(0);
  const [docuStamp, setDocuStamp] = useState(0);
  const [localGovTax, setLocalGovTax] = useState(0);
  const [aonRate, setAonRate] = useState(0);
  const [isAon, setIsAoN] = useState(false);
  const [rateInput, setRateInput] = useState(0);
  
  const [commissionFee, setCommissionFee] = useState("0");

  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [isRenewalMode, setIsRenewalMode] = useState(false);
  const [policyInception, setPolicyInception] = useState(null);
  const [policyExpiry, setPolicyExpiry] = useState(null);

  // Modal states
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "", onCloseCallback: null });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  const safeNumber = (val) => (isNaN(Number(val)) ? 0 : Number(val));

  const showAlert = (title, message, onCloseCallback = null) => {
    setAlertModal({ isOpen: true, title, message, onCloseCallback });
  };

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

  const fetchPolicyPaymentType = async (policyId) => {
    try {
      const { db } = await import("../../dbServer");
      const { data, error } = await db
        .from("payment_Table")
        .select("payment_type_id")
        .eq("policy_id", policyId)
        .limit(1)
        .single();
      
      if (error) {
        console.log("No payment type found for this policy");
        return null;
      }
      return data?.payment_type_id;
    } catch (error) {
      console.error("Error fetching policy payment type:", error);
      return null;
    }
  };

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

  useEffect(() => {
    if (!policyId || !clients.length || !vehicleTypes.length) return;
    (async () => {
      try {
        const [policy, vehicle, computation, paymentTypeId] = await Promise.all([
          fetchPolicyById(policyId),
          fetchVehicleByPolicyId(policyId),
          fetchComputationByPolicyId(policyId),
          fetchPolicyPaymentType(policyId)
        ]);

        console.log("=== LOADED DATA ===");
        console.log("Policy:", policy);
        console.log("Vehicle:", vehicle);
        console.log("Computation:", computation);
        console.log("Payment Type ID:", paymentTypeId);

        if (policy) {
          const foundClient = clients.find((c) => c.uid === policy.client_id);
          setSelectedClient(foundClient || null);
          setSelectedPartner(policy.partner_id || "");
          setPolicyInception(policy.policy_inception);
          setPolicyExpiry(policy.policy_expiry);
        }

        if (paymentTypeId) {
          setSelectedPaymentType(String(paymentTypeId));
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
          console.log("basic_Premium:", computation.basic_Premium);
          console.log("total_Premium:", computation.total_Premium);
          console.log("aon_Cost:", computation.aon_Cost);
          console.log("commission_fee:", computation.commission_fee);
          console.log("payment_type_id:", computation.payment_type_id);

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
          setIsAoN(Boolean(computation.aon_Cost && computation.aon_Cost > 0));
          
          setCommissionFee(String(computation.commission_fee ?? 0));

          if (computation.payment_type_id) {
            setSelectedPaymentType(String(computation.payment_type_id));
          }
        } else {
          console.warn("No computation data found - using vehicle table values");
          setOriginalVehicleCost(vehicleOriginalValueFromDB);
        }

        setIsDataLoaded(true);
      } catch (err) {
        console.error("Error loading policy data:", err);
        showAlert("Error", "Error loading policy data. See console.");
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

  const handleRenewPolicy = async () => {
    try {
      if (!selectedPaymentType) {
        showAlert("Validation Error", "Please select a payment type");
        return;
      }

      const commissionFeeToSave = parseFloat(commissionFee) || 0;

      console.log("=== RENEWING POLICY (null inception/expiry) ===");

      const policyResult = await updatePolicy(policyId, {
        client_id: selectedClient?.uid,
        partner_id: selectedPartner,
        policy_inception: null,
        policy_expiry: null,
      });

      if (!policyResult.success) throw new Error(policyResult.error);

      const { db } = await import("../../dbServer");
      const renewalInsert = await db.from("renewal_table").insert({
        policy_id: policyId,
        renewal_date: new Date().toISOString(),
      });

      if (renewalInsert.error) throw new Error(renewalInsert.error.message);

      const vehicle = await fetchVehicleByPolicyId(policyId);
      if (!vehicle) throw new Error("Vehicle not found");

      const vehicleTypeId =
        vehicleTypes.find((v) => v.vehicle_type === selectedVehicleType)?.id || null;

      const vehicleResult = await updateVehicle(vehicle.id, {
        vehicle_name: vehicleName,
        vehicle_maker: vehicleMaker,
        vehicle_color: vehicleColor,
        vin_num: vehicleVin,
        plate_num: vehiclePlate,
        engine_serial_no: vehicleEngine,
        vehicle_year: yearInput,
        original_value: originalVehicleCost,
        vehicle_type_id: vehicleTypeId,
      });

      if (!vehicleResult.success) throw new Error(vehicleResult.error);

      const computationData = {
        original_Value: originalVehicleCost,
        current_Value: vehicleValue,
        basic_Premium: basicPremiumValue,
        vehicle_Rate_Value: vehicleValueRate,
        total_Premium: totalPremiumFinal,
        aon_Cost: actOfNatureCost,
        commission_fee: commissionFeeToSave,
        payment_type_id: Number(selectedPaymentType),
      };

      console.log("💾 Computation data being saved (renewal):", computationData);

      const computationResult = await updateComputation(policyId, computationData);
      if (!computationResult.success) throw new Error(computationResult.error);

      showAlert("Success", "Policy renewed successfully — inception and expiry cleared!", () => {
        navigate("/appinsurance/main-app/policy");
      });
    } catch (err) {
      console.error("Error renewing policy:", err);
      showAlert("Error", `Error renewing policy: ${err.message}`);
    }
  };

  const handleUpdatePolicy = async () => {
    try {
      if (!selectedPaymentType) {
        showAlert("Validation Error", "Please select a payment type");
        return;
      }

      const commissionFeeToSave = parseFloat(commissionFee) || 0;

      console.log("=== SAVING UPDATES ===");
      console.log("Basic Premium:", basicPremiumValue);
      console.log("Commission fee (%) to save:", commissionFeeToSave);
      console.log("Payment Type ID:", selectedPaymentType);
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
        basic_Premium: basicPremiumValue,
        vehicle_Rate_Value: vehicleValueRate,
        total_Premium: totalPremiumFinal,
        aon_Cost: actOfNatureCost,
        commission_fee: commissionFeeToSave,
        payment_type_id: Number(selectedPaymentType)
      };

      console.log("💾 Computation data being saved:", computationData);

      const computationResult = await updateComputation(policyId, computationData);
      if (!computationResult.success) throw new Error(computationResult.error);

      showAlert("Success", "Policy updated successfully!", () => {
        navigate("/appinsurance/main-app/policy");
      });
    } catch (err) {
      console.error("Error updating policy:", err);
      showAlert("Error", `Error updating policy: ${err.message}`);
    }
  };

  return (
    <>
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
        setIsAoN={setIsAoN}
        setOriginalVehicleCost={setOriginalVehicleCost}
        originalVehicleCost={originalVehicleCost}
        currentVehicleValueCost={vehicleValue}
        totalVehicleValueRate={vehicleValueRate}
        totalPremiumCost={totalPremiumFinal}
        actOfNatureCost={actOfNatureCost}
        commissionRate={commissionFee}
        setCommissionRate={setCommissionFee}
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
        paymentTypes={paymentTypes}
        selectedPaymentType={selectedPaymentType}
        setSelectedPaymentType={setSelectedPaymentType}
        onSaveClient={handleUpdatePolicy}
        onRenewPolicy={handleRenewPolicy}
        isRenewalMode={isRenewalMode}
        setIsRenewalMode={setIsRenewalMode}
        policyExpiry={policyExpiry}
        navigate={navigate}
      />

      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => {
          setAlertModal({ ...alertModal, isOpen: false });
          if (alertModal.onCloseCallback) {
            alertModal.onCloseCallback();
          }
        }}
        title={alertModal.title}
        message={alertModal.message}
      />

      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </>
  );
}