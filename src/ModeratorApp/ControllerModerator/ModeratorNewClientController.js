import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ModeratorClientCreationForm from "../ModeratorForms/ModeratorClientCreationForm";
import { createModeratorClient, getCurrentUser } from "../ModeratorActions/ModeratorClientActions";

export default function ModeratorNewClientController({ onCancel, refreshClients }) {
  const [clientData, setClientData] = useState({
    prefix: "",
    firstName: "",
    homeAddress: "",
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
      address: validatedData.homeAddress,
      phone_Number: validatedData.phoneNumber,
      email: validatedData.email,
      client_active: true,
      client_Registered: new Date().toISOString().split("T")[0],
      agent_Id: user.id,
    };

    const success = await createModeratorClient(payload);
    if (success) {
      alert("Client created successfully!");
      if (refreshClients) await refreshClients();   // ✅ reload parent table
      if (onCancel) {
        onCancel(); // ✅ close modal
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
