import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { editClient, checkIfEmailExists, checkIfPhoneExists } from "../AdminActions/EditClientActions";
import ClientEditForm from "../AdminForms/ClientEditForm";

export default function EditClientController({ client, onClose, onUpdateSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

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
    zip_code: client?.zip_code ?? "", // ADDED (use ?? "" to handle null/undefined)
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
    // ... (rest of phone validation)
    else if (!/^\d+$/.test(formData.phone_Number))
      newErrors.phone_Number = "Phone number must contain only digits";
    else if (formData.phone_Number.length !== 11)
      newErrors.phone_Number = "Phone number must be exactly 11 digits";
    else if (!/^09\d{9}$/.test(formData.phone_Number))
      newErrors.phone_Number = "Phone number must start with '09'";

    if (!formData.address?.trim())
      newErrors.address = "Street Address is required";

    // ADDED: Zip code validation (optional field, but must be 4 digits if present)
    if (formData.zip_code && !/^\d{4}$/.test(formData.zip_code)) {
      newErrors.zip_code = "Zip code must be 4 digits, if provided";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Please fix validation errors before submitting.");
      return;
    }

    let duplicateErrors = {};

    // ... (duplicate email/phone checks are unchanged) ...
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
      return; 
    }

    // ADDED: Coerce zip code to integer or null for DB
    const zipCodePayload = formData.zip_code ? parseInt(formData.zip_code, 10) : null;

    try {
      // MODIFIED: Updated editClient call
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
        zipCodePayload // ADDED
      );

      alert("Client updated successfully!");
      if (onUpdateSuccess) onUpdateSuccess();
      else if (onClose) onClose();
      else navigate("/appinsurance/MainArea/Client");
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating client.");
    }
  };

  return (
    <ClientEditForm
      originalData={originalData}
      formData={formData}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}