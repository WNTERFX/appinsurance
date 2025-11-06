import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientCreationForm from "../AdminForms/ClientCreationForm";
import { CustomAlert } from "../../ReusableComponents/CustomAlert";
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
    streetAddress: "", 
    barangay: "",
    city: "",
    province: "",
    region: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
  });

  // Add state for custom alerts
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // 'error' or 'success'

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helper function to show alerts
  const showAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setAlertMessage("");
      setAlertType("");
    }, 5000);
  };

  const handleSubmit = async () => {
    console.log("Submitting (camelCase):", clientData);

    // Clear any existing alerts
    setAlertMessage("");
    setAlertType("");

    // ✅ 1. Validate required fields
    if (
      !clientData.firstName.trim() ||
      !clientData.familyName.trim() ||
      !clientData.streetAddress.trim() || 
      !clientData.phoneNumber.trim() ||
      !clientData.email.trim()
    ) {
      showAlert("Please fill in all required fields.", "error");
      return false;
    }

    // ✅ 2. Check email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      showAlert("Please enter a valid email address.", "error");
      return false;
    }

    // ✅ 3. Check phone format (11 digits)
    if (!/^\d{11}$/.test(clientData.phoneNumber)) {
      showAlert("Phone number must be 11 digits (e.g., 09XXXXXXXXX).", "error");
      return false;
    }

    // ✅ 4. Check for duplicate email
    const emailExists = await checkIfEmailExists(clientData.email);
    if (emailExists) {
      showAlert("This email is already registered. Please use another one.", "error");
      return false;
    }

    // ✅ 5. Check for duplicate phone number
    const phoneExists = await checkIfPhoneExists(clientData.phoneNumber);
    if (phoneExists) {
      showAlert("This phone number is already registered. Please use another one.", "error");
      return false;
    }

    // ✅ 6. Ensure logged-in user
    const user = await getCurrentUser();
    if (!user) {
      showAlert("No logged-in user. Please sign in again.", "error");
      return false;
    }

    const dbPayload = {
      prefix: clientData.prefix,
      first_Name: clientData.firstName,
      middle_Name: clientData.middleName,
      family_Name: clientData.familyName,
      suffix: clientData.suffix,
      phone_Number: clientData.phoneNumber,
      address: clientData.streetAddress, 
      barangay_address: clientData.barangay,
      city_address: clientData.city,
      province_address: clientData.province,
      region_address: clientData.region,
      zip_code: clientData.zipCode ? parseInt(clientData.zipCode, 10) : null, 
      email: clientData.email,
      client_active: true,
      client_Registered: new Date().toISOString().split("T")[0],
      agent_Id: user.id,
    };

    // ✅ 8. Insert into Supabase
    const { success, error } = await NewClientCreation(dbPayload);
    if (!success) {
      showAlert("Error saving client: " + error, "error");
      return false;
    }

    // ✅ 9. Success — reset form and navigate
    showAlert("Client successfully created!", "success");
    
    // Wait a moment before navigation so user sees the success message
    setTimeout(() => {
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
          streetAddress: "",
          barangay: "",
          city: "",
          province: "",
          region: "",
          zipCode: "",
          phoneNumber: "",
          email: "",
        });
      }
    }, 1500);

    return true;
  };

  return (
    <>
      {alertMessage && <CustomAlert message={alertMessage} type={alertType} />}
      <ClientCreationForm
        clientData={clientData}
        onChange={handleChange}
        onSubmit={async () => {
          const success = await handleSubmit();
        }}
        onCancel={onCancel || (() => navigate("/appinsurance/main-area/client"))}
      />
    </>
  );
}