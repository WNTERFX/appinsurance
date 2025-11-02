import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModeratorClientCreationForm from "../ModeratorForms/ModeratorClientCreationForm";
import { createModeratorClient, getCurrentUser } from "../ModeratorActions/ModeratorClientActions";

export default function ModeratorNewClientController({ onCancel, refreshClients }) {
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

  const handleChange = (name, value) => {
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (validatedData) => {
    const user = await getCurrentUser();
    if (!user) return alert("Please log in again.");

    const payload = {
      prefix: validatedData.prefix,
      first_Name: validatedData.firstName,
      middle_Name: validatedData.middleName,
      family_Name: validatedData.familyName,
      suffix: validatedData.suffix,
      phone_Number: validatedData.phoneNumber,
      address: validatedData.address,
      email: validatedData.email,
      client_active: true,
      client_Registered: new Date().toISOString().split("T")[0],
      agent_Id: user.id,
    };

    const success = await createModeratorClient(payload);
    if (success) {
      alert("Client created successfully!");
      if (refreshClients) await refreshClients();
      if (onCancel) {
        onCancel();
      } else {
        navigate("/appinsurance/MainAreaModerator/ClientModerator");
      }
    } else {
      alert("Error creating client.");
    }
  };

  return (
    <ModeratorClientCreationForm
      clientData={clientData}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onCancel={onCancel || (() => navigate("/appinsurance/MainAreaModerator/ClientModerator"))}
    />
  );
}
