import { getComputationValue, fetchVehicleDetails } from "../AdminActions/VehicleTypeActions";
import {ComputationActionsVehicleValue, ComputatationRate, ComputationActionsBasicPre,  ComputationActionsTax} from "../AdminActions/ComputationActions";
import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { NewClientCreation } from "../AdminActions/NewClientActions";
import PolicyNewClient from '../PolicyNewClient'; 
import { db } from "../../dbServer";

export default function NewClientController() {

  const navigate = useNavigate();

  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [selected, setSelected] = useState(""); 
  const [vehicleDetails, setVehicleDetails] = useState(null);

  useEffect(() => {
    async function loadVehicleTypes() {
      const types = await getComputationValue();
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
    
  

  useEffect (() => {
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
      console.error('Calculation error:', error);
      return 0;
    }
  };

 
  const vehicleValue = safeCalculate(ComputationActionsVehicleValue, vehicleCost, yearInput, rateInput);
  const vehicleValueRate = safeCalculate(ComputatationRate, rateInput, vehicleValue);
  const basicPremiumValue = safeCalculate(ComputationActionsBasicPre, bodily_Injury, property_Damage, personal_Accident) + vehicleValueRate;
  const totalPremiumValue = safeCalculate(ComputationActionsTax, basicPremiumValue, vat_Tax, docu_Stamp, local_Gov_Tax);

 
  const handleYearInputChange = (value) => {
    const numValue = value === "" ? 0 : safeNumber(value);
    setYearInput(numValue);
  };

  const handleVehicleCostChange = (value) => {
    const numValue = value === "" ? 0 : safeNumber(value);
    setVehicleCost(numValue);
  };


  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [insurancePartner, setInsurancePartner] = useState("");


const handleSaveClient = async () => {
  const clientData = {
    agent_Id: "00000000-0000-0000-0000-000000000000", 
    insurance_Id: "00000000-0000-0000-0000-000000000000", 
    client_Name: fullName,
    address: address,
    phone_Number: phoneNumber,
    client_Registered: new Date().toISOString().split("T")[0], 
    remarks: "", 
    vehicle_Type_Id: selected ? vehicleTypes.find(v => v.vehicle_Type === selected)?.id : null,
    vehicle_Model: vehicleDetails?.vehicle_Model || "",
    
  };

  const result = await NewClientCreation(clientData);

  if (result.success) {
    alert("Client saved successfully!");
    navigate("/appinsurance/MainArea/Policy");
  } else {
    alert("Error saving client: " + result.error);
  }

  const clientpolicydata = {
    client_Id:"00000000-0000-0000-0000-000000000000",
    email_Address:email,
    vehicle_Year:yearInput,
    Original_Value_of_Vehicle:vehicleCost,
    VAT_Tax:vehicleDetails.vat_Tax,
    docu_stamp:vehicleDetails.docu_Stamp,
    gov_Tax:vehicleDetails.local_Gov_Tax,
    rate:vehicleDetails.vehicle_Rate ,
    Vehicle_Value:vehicleValue,

  };

  const { error: policyError } = await db.from("ClientPolicy_Table").insert([clientpolicydata]);

  if (policyError) {
    alert("Error saving policy: " + policyError.message);
    return;
  }

  alert("Saved successfully!");
  navigate("/appinsurance/MainArea/Policy");

};

  


  return (
    <PolicyNewClient
      vehicleTypes={vehicleTypes}
      selected={selected}
      setSelected={setSelected}
      vehicleDetails={vehicleDetails}
      yearInput={yearInput}
      setYearInput={handleYearInputChange}      
      vehicleCost={vehicleCost}
      setVehicleCost={handleVehicleCostChange}  
      vehicleValue={vehicleValue}
      vehicleValueRate={vehicleValueRate}
      basicPremiumValue={basicPremiumValue}
      totalPremiumValue={totalPremiumValue}
      fullName={fullName}
      setFullName={setFullName}
      phoneNumber={phoneNumber}
      setPhoneNumber={setPhoneNumber}
      address={address}
      setAddress={setAddress}
      email={email}
      setEmail={setEmail}
      insurancePartner={insurancePartner}
      setInsurancePartner={setInsurancePartner}
      onSaveClient={handleSaveClient}
   
     

      navigate={navigate}
    />
  );
}
