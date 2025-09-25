import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { editClient } from "../AdminActions/EditClientActions";
import ClientEditForm from "../AdminForms/ClientEditForm";

export default function EditClientController({ client, onClose, onUpdateSuccess }) {
  const navigate = useNavigate();

  // Always declare hooks first
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Build originalData safely
  const originalData = {
    uid: client?.uid || "",
    prefix: client?.prefix || "",
    first_Name: client?.first_Name || "",
    middle_Name: client?.middle_Name || "",
    family_Name: client?.family_Name || "",
    suffix: client?.suffix || "",
    address: client?.address || "",
    phone_Number: client?.phone_Number || "",
    email: client?.email || "",
  };

  //  useEffect to sync state when client changes
  useEffect(() => {
    setFormData({ ...originalData });
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

   const validate = () => {
    const newErrors = {};

    if (!formData.first_Name?.trim()) {
      newErrors.first_Name = "First Name is required";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone_Number?.trim()) {
      newErrors.phone_Number = "Phone number is required";
    } else if (!/^\d+$/.test(formData.phone_Number)) {
      newErrors.phone_Number = "Phone number must contain only digits";
    } else if (formData.phone_Number.length !== 11) {
      newErrors.phone_Number = "Phone number must be exactly 11 digits";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Home Address is required";
    }

    return newErrors;
  };

  const handleSubmit = async () => {

    const validationErrors = validate();
    if(Object.keys(validationErrors).length > 0){
      setErrors(validationErrors);
      alert("Please fix validation errors before submitting.");
      return; // stop submission if invalid
    }
    console.log("Submitting UID:", formData.uid);

    try {
      await editClient(
        formData.uid,
        formData.prefix,
        formData.first_Name,
        formData.middle_Name,
        formData.family_Name,
        formData.suffix,
        formData.address,
        formData.phone_Number,
        formData.email
      );

      alert("Client updated successfully!");
      if (onUpdateSuccess) {
        onUpdateSuccess();
      } else if (onClose) {
        onClose();
      } else {
        navigate("/appinsurance/MainArea/Client");
      }
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
