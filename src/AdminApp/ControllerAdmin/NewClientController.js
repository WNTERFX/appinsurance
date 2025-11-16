import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientCreationForm from "../AdminForms/ClientCreationForm";
import CustomAlertModal from "../AdminForms/CustomAlertModal";
import {
  NewClientCreation,
  getCurrentUser,
  checkIfEmailExists,
  checkIfPhoneExists,
} from "../AdminActions/NewClientActions";

export default function NewClientController({ onCancel, onSuccess }) {
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

  // Modal state
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", title: "Alert", isSuccess: false });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Helper functions for alert modal
  const showAlert = (message, title = "Alert", isSuccess = false) => {
    setAlertModal({ isOpen: true, message, title, isSuccess });
  };

  const closeAlert = () => {
    const wasSuccess = alertModal.isSuccess;
    setAlertModal({ isOpen: false, message: "", title: "Alert", isSuccess: false });
    
    // If it was a success alert, trigger refresh and close ONLY when OK is clicked
    if (wasSuccess) {
      // Reset form data
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
      
      // Trigger parent refresh if callback provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal or navigate
      if (onCancel) {
        onCancel();
      } else {
        navigate("/appinsurance/main-area/client");
      }
    }
  };

  const handleSubmit = async () => {
    console.log("Submitting (camelCase):", clientData);

    // ✅ 1. Validate required fields
    if (
      !clientData.firstName.trim() ||
      !clientData.familyName.trim() ||
      !clientData.streetAddress.trim() || 
      !clientData.phoneNumber.trim() ||
      !clientData.email.trim()
    ) {
      showAlert("Please fill in all required fields.", "Validation Error");
      return false;
    }

    // ✅ 2. Check email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      showAlert("Please enter a valid email address.", "Invalid Email");
      return false;
    }

    // ✅ 3. Check phone format (11 digits)
    if (!/^\d{11}$/.test(clientData.phoneNumber)) {
      showAlert("Phone number must be 11 digits (e.g., 09XXXXXXXXX).", "Invalid Phone Number");
      return false;
    }

    // ✅ 4. Check for duplicate email
    const emailExists = await checkIfEmailExists(clientData.email);
    if (emailExists) {
      showAlert("This email is already registered. Please use another one.", "Duplicate Email");
      return false;
    }

    // ✅ 5. Check for duplicate phone number
    const phoneExists = await checkIfPhoneExists(clientData.phoneNumber);
    if (phoneExists) {
      showAlert("This phone number is already registered. Please use another one.", "Duplicate Phone Number");
      return false;
    }

    // ✅ 6. Ensure logged-in user
    const user = await getCurrentUser();
    if (!user) {
      showAlert("No logged-in user. Please sign in again.", "Authentication Error");
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

    // ✅ 7. Insert into Supabase
    const { success, error } = await NewClientCreation(dbPayload);
    if (!success) {
      showAlert("Error saving client: " + error, "Error");
      return false;
    }

    // ✅ 8. Success — show modal (refresh happens when user clicks OK)
    showAlert("Client successfully created!", "Success", true);

    return true;
  };

  return (
    <>
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        message={alertModal.message}
        title={alertModal.title}
      />
      
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