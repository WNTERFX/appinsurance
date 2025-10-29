import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientCreationForm from "../AdminForms/ClientCreationForm";
import {
  NewClientCreation,
  getCurrentUser,
  checkIfEmailExists,
  checkIfPhoneExists,
} from "../AdminActions/NewClientActions";

export default function NewClientController({ onCancel }) {
  const [clientData, setClientData] = useState({
    prefix: "",
    firstName: "",
    middleName: "",
    familyName: "",
    suffix: "",
    address: "",
    phoneNumber: "",
    email: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    console.log("Submitting (camelCase):", clientData);

    // ✅ 1. Validate required fields
    if (
      !clientData.firstName.trim() ||
      !clientData.familyName.trim() ||
      !clientData.address.trim() ||
      !clientData.phoneNumber.trim() ||
      !clientData.email.trim()
    ) {
      alert("Please fill in all required fields.");
      return false;
    }

    // ✅ 2. Check email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    // ✅ 3. Check phone format (11 digits)
    if (!/^\d{11}$/.test(clientData.phoneNumber)) {
      alert("Phone number must be 11 digits (e.g., 09XXXXXXXXX).");
      return false;
    }

    // ✅ 4. Check for duplicate email
    const emailExists = await checkIfEmailExists(clientData.email);
    if (emailExists) {
      alert("This email is already registered. Please use another one.");
      return false;
    }

    // ✅ 5. Check for duplicate phone number
    const phoneExists = await checkIfPhoneExists(clientData.phoneNumber);
    if (phoneExists) {
      alert("This phone number is already registered. Please use another one.");
      return false;
    }

    // ✅ 6. Ensure logged-in user
    const user = await getCurrentUser();
    if (!user) {
      alert("No logged-in user. Please sign in again.");
      return false;
    }

    const dbPayload = {
      prefix: clientData.prefix,
      first_Name: clientData.firstName,
      middle_Name: clientData.middleName,
      family_Name: clientData.familyName,
      suffix: clientData.suffix,
      phone_Number: clientData.phoneNumber,
      address: clientData.address,
      email: clientData.email,
      client_active: true,
      client_Registered: new Date().toISOString().split("T")[0],
      agent_Id: user.id,
    };

    // ✅ 8. Insert into Supabase
    const { success, error } = await NewClientCreation(dbPayload);
    if (!success) {
      alert("Error saving client: " + error);
      return false;
    }

    // ✅ 9. Success — reset form and navigate
    alert("Client successfully created!");
    if (onCancel) {
      onCancel();
    } else {
      navigate("/appinsurance/main-area/client");
      setClientData({
        prefix: "",
        firstName: "",
        middleName: "",
        familyName: "",
        suffix: "",
        address: "",
        phoneNumber: "",
        email: "",
      });
    }

    return true;
  };

  return (
    <ClientCreationForm
      clientData={clientData}
      onChange={handleChange}
      onSubmit={async () => {
        const success = await handleSubmit();
        if (success) navigate(-1);
      }}
      onCancel={onCancel || (() => navigate("/appinsurance/main-area/client"))}
    />
  );
}
