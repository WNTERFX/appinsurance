// ✅ ModeratorEditNewClientController.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { editClientModerator } from "../ModeratorActions/ModeratorEditClientActions";
import ModeratorClientEditForm from "../ModeratorForms/ModeratorClientEditForm";

export default function ModeratorEditNewClientController({ client, onClose, onUpdateSuccess }) {
  const navigate = useNavigate();

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

  const [formData, setFormData] = useState({ ...originalData });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await editClientModerator(
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
      
      //  Refresh table + close modal
      if (onUpdateSuccess) {
        onUpdateSuccess();
      } else if (onClose) {
        onClose();
      } else {
        navigate("/appinsurance/MainAreaModerator/ClientModerator");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating client.");
    }
  };

  return (
    <ModeratorClientEditForm
      originalData={originalData}
      formData={formData}
      errors={errors}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onClose={onClose}
    />
  );
}
