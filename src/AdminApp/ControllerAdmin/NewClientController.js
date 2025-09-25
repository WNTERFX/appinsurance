import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ClientCreationForm from "../AdminForms/ClientCreationForm";
import { NewClientCreation, getCurrentUser } from "../AdminActions/NewClientActions";

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

    const user = await getCurrentUser();
    if (!user) {
      alert("No logged-in user. Please sign in again.");
      return;
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

    const { success, error } = await NewClientCreation(dbPayload);
    if (!success) {
      alert("Error saving client: " + error);
    } else {
      alert("Client successfully created!");
      if (onCancel) {
        onCancel();
      } else {
        navigate("/appinsurance/MainArea/Client");
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
    }
  };

  return (
    <ClientCreationForm
      clientData={clientData}
      onChange={handleChange}
      onSubmit={async () => {
        const success = await handleSubmit();
        if (success) navigate(-1);
      }}
      onCancel={onCancel || (() => navigate("/appinsurance/MainArea/Client"))}
    />
  );
}
