import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { editClient, checkIfEmailExists, checkIfPhoneExists } from "../AdminActions/EditClientActions";
import ClientEditForm from "../AdminForms/ClientEditForm";
import CustomAlertModal from "../AdminForms/CustomAlertModal";

export default function EditClientController({ client, onClose, onUpdateSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal states - added isSuccess tracking
  const [alertModal, setAlertModal] = useState({ 
    isOpen: false, 
    message: "", 
    title: "Alert", 
    isSuccess: false,
    shouldRefresh: false  // NEW: explicit refresh flag
  });

  const originalData = {
    uid: client?.uid || "",
    prefix: client?.prefix || "",
    first_Name: client?.first_Name || "",
    middle_Name: client?.middle_Name || "",
    family_Name: client?.family_Name || "",
    suffix: client?.suffix || "",
    address: client?.address || "",
    barangay_address: client?.barangay_address || "",
    city_address: client?.city_address || "",
    province_address: client?.province_address || "",
    region_address: client?.region_address || "",
    zip_code: client?.zip_code ?? "",
    phone_Number: client?.phone_Number || "",
    email: client?.email || "",
  };

  useEffect(() => {
    setFormData({ ...originalData });
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [`${name}Exists`]: false })); 
  };

  // Helper function to show alert with optional refresh flag
  const showAlert = (message, title = "Alert", isSuccess = false, shouldRefresh = false) => {
    setAlertModal({ 
      isOpen: true, 
      message, 
      title, 
      isSuccess,
      shouldRefresh: shouldRefresh || isSuccess  // Refresh on success or when explicitly requested
    });
  };

  // Updated closeAlert to handle refresh more explicitly
  const closeAlert = () => {
    const { shouldRefresh } = alertModal;
    
    console.log("closeAlert called, shouldRefresh:", shouldRefresh);
    console.log("onUpdateSuccess callback exists:", !!onUpdateSuccess);
    
    // Reset modal state first
    setAlertModal({ 
      isOpen: false, 
      message: "", 
      title: "Alert", 
      isSuccess: false,
      shouldRefresh: false
    });
    
    // If we need to refresh, do it after closing the modal
    if (shouldRefresh) {
      console.log("Triggering refresh and close...");
      
      // Small delay to ensure modal closes smoothly before refresh
      setTimeout(() => {
        if (onUpdateSuccess) {
          console.log("Calling onUpdateSuccess");
          onUpdateSuccess(); // Trigger parent refresh
        }
        
        if (onClose) {
          console.log("Calling onClose");
          onClose(); // Close the edit form
        } else {
          console.log("Navigating to client list");
          navigate("/appinsurance/MainArea/Client");
        }
      }, 100);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.first_Name?.trim())
      newErrors.first_Name = "First Name is required";
    if (!formData.family_Name?.trim())
      newErrors.family_Name = "Last Name is required";

    if (!formData.email?.trim())
      newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.phone_Number?.trim())
      newErrors.phone_Number = "Phone number is required";
    else if (!/^\d+$/.test(formData.phone_Number))
      newErrors.phone_Number = "Phone number must contain only digits";
    else if (formData.phone_Number.length !== 11)
      newErrors.phone_Number = "Phone number must be exactly 11 digits";
    else if (!/^09\d{9}$/.test(formData.phone_Number))
      newErrors.phone_Number = "Phone number must start with '09'";

    if (!formData.address?.trim())
      newErrors.address = "Street Address is required";

    // Zip code validation (optional field, but must be 4 digits if present)
    if (formData.zip_code && !/^\d{4}$/.test(formData.zip_code)) {
      newErrors.zip_code = "Zip code must be 4 digits, if provided";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent double submission
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showAlert("Please fix validation errors before submitting.", "Validation Error", false, false);
      return;
    }

    setIsSubmitting(true);
    let duplicateErrors = {};

    // Check for duplicate email/phone
    if (formData.email !== originalData.email) {
      const emailExists = await checkIfEmailExists(formData.email);
      if (emailExists) duplicateErrors.emailExists = true;
    }
    if (formData.phone_Number !== originalData.phone_Number) {
      const phoneExists = await checkIfPhoneExists(formData.phone_Number);
      if (phoneExists) duplicateErrors.phoneExists = true;
    }

    if (Object.keys(duplicateErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...duplicateErrors }));
      setIsSubmitting(false);
      
      let errorMessage = "";
      if (duplicateErrors.emailExists && duplicateErrors.phoneExists) {
        errorMessage = "Email and phone number are already in use.";
      } else if (duplicateErrors.emailExists) {
        errorMessage = "Email is already in use.";
      } else if (duplicateErrors.phoneExists) {
        errorMessage = "Phone number is already in use.";
      }
      showAlert(errorMessage, "Duplicate Entry", false, false);
      return; 
    }

    // Coerce zip code to integer or null for DB
    const zipCodePayload = formData.zip_code ? parseInt(formData.zip_code, 10) : null;

    try {
      await editClient(
        formData.uid,
        formData.prefix,
        formData.first_Name,
        formData.middle_Name,
        formData.family_Name,
        formData.suffix,
        formData.address, 
        formData.barangay_address,
        formData.city_address,
        formData.province_address,
        formData.region_address,
        formData.phone_Number,
        formData.email,
        zipCodePayload
      );

      // Show success modal with refresh flag
      console.log("Edit successful, showing alert with shouldRefresh: true");
      showAlert("Client updated successfully!", "Success", true, true);
      
    } catch (error) {
      console.error("Update error:", error);
      
      // Handle specific errors
      if (error.message === "EMAIL_IN_USE") {
        setErrors((prev) => ({ ...prev, emailExists: true }));
        showAlert("Email is already in use by another account.", "Error", false, false);
      } else if (error.message === "INVALID_EMAIL") {
        setErrors((prev) => ({ ...prev, email: "Invalid email format" }));
        showAlert("Invalid email format.", "Error", false, false);
      } else if (error.message === "NOT_AUTHENTICATED") {
        showAlert("Session expired. Please login again.", "Session Expired", false, false);
      } else {
        showAlert("Error updating client. Please try again.", "Error", false, false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        message={alertModal.message}
        title={alertModal.title}
      />
      
      <ClientEditForm
        originalData={originalData}
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onClose={onClose}
        isSubmitting={isSubmitting}
      />
    </>
  );
}