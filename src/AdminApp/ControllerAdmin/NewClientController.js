import { getComputationValue, fetchVehicleDetails } from "../AdminActions/VehicleTypeActions";
import { ComputationActionsVehicleValue, ComputatationRate, ComputationActionsBasicPre,  ComputationActionsTax, ComputationActionsAoN  } from "../AdminActions/ComputationActions";
import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { NewClientCreation, NewComputationCreation, fetchPartners} from "../AdminActions/NewClientActions";
import { getCurrentUser } from "../AdminActions/CurrentUserActions";

import PolicyNewClient from '../PolicyNewClient'; 

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
    const [isAoN, setIsAoN] = useState(false);
    
  

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
  const vehicleValueWithAoN = isAoN ? safeCalculate(ComputationActionsAoN, vehicleValue, AoNRate) : vehicleValue;
  
 

  const totalPremiumValueWithAoN = isAoN  ? totalPremiumValue + vehicleValueWithAoN : totalPremiumValue;
  


 
  const handleYearInputChange = (value) => {
    const numValue = value === "" ? 0 : safeNumber(value);
    setYearInput(numValue);
  };

  const handleVehicleCostChange = (value) => {
    const numValue = value === "" ? 0 : safeNumber(value);
    setVehicleCost(numValue);
  };


  const [prefixName, setPrefix] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [suffixName, setSuffixName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleName, setVehicleName] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [orginalVehicleCost, setOriginalVehicleCost] = useState(0);
  const [currentVehicleValueCost, setCurrentVehicleCost] = useState(0);
  const [totalVehicleValueRate, setTotalVehicleValueRate] = useState(0);
  const [totalPremiumCost, setTotalPremiumCost] = useState(0);
  const [actOfNatureCost, setActofNatureCost] = useState(0);

  useEffect(() => {
  setOriginalVehicleCost(vehicleCost);
  setCurrentVehicleCost(vehicleValue);
  setTotalVehicleValueRate(vehicleValueRate);
  setTotalPremiumCost(totalPremiumValue);
  setActofNatureCost(isAoN ? vehicleValueWithAoN - vehicleValue : 0);
}, [vehicleCost, vehicleValue, vehicleValueRate, totalPremiumValue, vehicleValueWithAoN, isAoN]);


  


  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
     
    }, []);
    


  const handleSaveClient = async () => {
    const clientData = {
      agent_Id: currentUser.id, 
      insurance_Id: selectedPartner || null, 

      prefix_Name: prefixName,
      first_Name: firstName,
      middle_Name: middleName,
      family_Name: familyName,
      suffix_Name: suffixName,
      address: address,
      phone_Number: phoneNumber,
      vehicle_Model: vehicleName,
      vehicle_Type_Id: selected ? vehicleTypes.find(v => v.vehicle_Type === selected)?.id : null,
      client_Registered: new Date().toISOString().split("T")[0], 
      remarks: ""
    
    
    };

     const newClientResult = await NewClientCreation(clientData);
   
     

  if (!newClientResult.success) {
    return alert("Error saving client: " + newClientResult.error);
  }

  const clientId = newClientResult.uid;
    if (!clientId) {
    console.error("New client ID not returned:", newClientResult);
    return alert("Failed to get client ID from server.");
  }


 
    const clientComputationData = {
    client_Id: clientId,
    vehicle_Year: yearInput,
    original_Value: orginalVehicleCost,
    current_Value: currentVehicleValueCost,
    total_Premium: totalPremiumCost,
    vehicle_Rate_Value: totalVehicleValueRate,
    aon_Cost: actOfNatureCost
  };

  const newComputationResult = await NewComputationCreation(clientComputationData);

  if (newComputationResult.success) {
    alert("Client and computation saved successfully!");
    navigate("/appinsurance/MainArea/Policy");
  } else {
    alert("Error saving computation: " + newComputationResult.error);
  }
};



  const [partners, setPartners] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState("");

  useEffect(() => {
    async function loadPartners() {
      const data = await fetchPartners();
      setPartners(data);
      
    }
    loadPartners();
  }, []);

  


  
  return (
    <PolicyNewClient
      // Total Premium Calculation
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
      vehicleValueWithAoN={vehicleValueWithAoN} 
      totalPremiumValue={totalPremiumValue}
      totalPremiumValueWithAoN={totalPremiumValueWithAoN}
      isAoN={isAoN}
      setIsAoN={setIsAoN}  

      orginalVehicleCost={orginalVehicleCost}
      currentVehicleValueCost={currentVehicleValueCost}
      totalVehicleValueRate={totalVehicleValueRate}
      totalPremiumCost={totalPremiumCost}
      actOfNatureCost={actOfNatureCost}
      
      
      // Client Name
      prefixName={prefixName}
      setPrefix={setPrefix}
      firstName={firstName}
      setFirstName={setFirstName}
      middleName={middleName}
      setMiddleName={setMiddleName}
      familyName={familyName}
      setFamilyName={setFamilyName}
      suffixName={suffixName}
      setSuffixName={setSuffixName}
     
      phoneNumber={phoneNumber}
      setPhoneNumber={setPhoneNumber}
      address={address}
      setAddress={setAddress}
      email={email}
      setEmail={setEmail}
      partners={partners}
      selectedPartner={selectedPartner}
      setSelectedPartner={setSelectedPartner}
      vehicleName = {vehicleName}
      setVehicleName = {setVehicleName}
      
      onSaveClient={handleSaveClient}
      navigate={navigate}
    />
  );
}