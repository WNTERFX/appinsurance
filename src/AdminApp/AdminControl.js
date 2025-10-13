// AdminControl.js
import React, { useState, useEffect } from "react";
import { 
  fetchAllCalculations, 
  createCalculation, 
  updateCalculation, 
  deleteCalculation,
  fetchAllMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  fetchAllInsurancePartners,
  createInsurancePartner,
  updateInsurancePartner,
  deleteInsurancePartner
} from "./AdminActions/AdminControlActions"
import "./styles/admin-control-styles.css"

export default function AdminControl() {
  // Tab state
  const [activeTab, setActiveTab] = useState("calculations"); // "calculations", "messages", or "partners"

  // Calculations state
  const [calculations, setCalculations] = useState([]);
  const [isEditingCalc, setIsEditingCalc] = useState(false);
  const [isCreatingCalc, setIsCreatingCalc] = useState(false);
  const [editCalcId, setEditCalcId] = useState(null);
  const [loadingCalc, setLoadingCalc] = useState(false);

  // Messages state
  const [messages, setMessages] = useState([]);
  const [isEditingMsg, setIsEditingMsg] = useState(false);
  const [isCreatingMsg, setIsCreatingMsg] = useState(false);
  const [editMsgId, setEditMsgId] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState(false);

  // Insurance Partners state
  const [partners, setPartners] = useState([]);
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [isCreatingPartner, setIsCreatingPartner] = useState(false);
  const [editPartnerId, setEditPartnerId] = useState(null);
  const [loadingPartner, setLoadingPartner] = useState(false);

  const [message, setMessage] = useState({ text: "", type: "" });

  // Calculation form fields
  const [vehicleType, setVehicleType] = useState("");
  const [bodilyInjury, setBodilyInjury] = useState("");
  const [personalAccident, setPersonalAccident] = useState("");
  const [propertyDamage, setPropertyDamage] = useState("");
  const [vehicleRate, setVehicleRate] = useState("");
  const [vat, setVat] = useState("");
  const [localTax, setLocalTax] = useState("");
  const [docStamp, setDocStamp] = useState("");
  const [aon, setAon] = useState("");

  // Message form fields
  const [messageType, setMessageType] = useState("");
  const [messageDesc, setMessageDesc] = useState("");

  // Insurance Partner form fields
  const [insuranceName, setInsuranceName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [insuranceRate, setInsuranceRate] = useState("");

  // Fetch all calculations
  const loadCalculations = async () => {
    try {
      const data = await fetchAllCalculations();
      setCalculations(data);
    } catch (error) {
      console.error("Error fetching calculations:", error);
      showMessage("Error fetching calculations", "error");
    }
  };

  // Fetch all messages
  const loadMessages = async () => {
    try {
      const data = await fetchAllMessages();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
      showMessage("Error fetching messages", "error");
    }
  };

  // Fetch all insurance partners
  const loadPartners = async () => {
    try {
      const data = await fetchAllInsurancePartners();
      setPartners(data);
    } catch (error) {
      console.error("Error fetching insurance partners:", error);
      showMessage("Error fetching insurance partners", "error");
    }
  };

  useEffect(() => {
    loadCalculations();
    loadMessages();
    loadPartners();
  }, []);

  // Show message
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Reset calculation form
  const resetCalcForm = () => {
    setVehicleType("");
    setBodilyInjury("");
    setPersonalAccident("");
    setPropertyDamage("");
    setVehicleRate("");
    setVat("");
    setLocalTax("");
    setDocStamp("");
    setAon("");
    setIsEditingCalc(false);
    setIsCreatingCalc(false);
    setEditCalcId(null);
  };

  // Reset message form
  const resetMsgForm = () => {
    setMessageType("");
    setMessageDesc("");
    setIsEditingMsg(false);
    setIsCreatingMsg(false);
    setEditMsgId(null);
  };

  // Reset partner form
  const resetPartnerForm = () => {
    setInsuranceName("");
    setAddress("");
    setContact("");
    setInsuranceRate("");
    setIsEditingPartner(false);
    setIsCreatingPartner(false);
    setEditPartnerId(null);
  };

  // Show create forms
  const showCreateCalcForm = () => {
    resetCalcForm();
    setIsCreatingCalc(true);
  };

  const showCreateMsgForm = () => {
    resetMsgForm();
    setIsCreatingMsg(true);
  };

  const showCreatePartnerForm = () => {
    resetPartnerForm();
    setIsCreatingPartner(true);
  };

  // Handle calculation submit
  const handleCalcSubmit = async (e) => {
    e.preventDefault();

    if (!vehicleType.trim()) {
      showMessage("Please enter a vehicle type", "error");
      return;
    }

    setLoadingCalc(true);

    const calculationData = {
      vehicle_type: vehicleType.trim(),
      bodily_Injury: parseFloat(bodilyInjury) || 0,
      personal_Accident: parseFloat(personalAccident) || 0,
      property_Damage: parseFloat(propertyDamage) || 0,
      vehicle_Rate: parseFloat(vehicleRate) || 0,
      vat_Tax: parseFloat(vat) || 0,
      local_Gov_Tax: parseFloat(localTax) || 0,
      docu_Stamp: parseFloat(docStamp) || 0,
      aon: parseFloat(aon) || 0,
    };

    try {
      if (isEditingCalc) {
        await updateCalculation(editCalcId, calculationData);
        showMessage("Calculation updated successfully", "success");
      } else {
        await createCalculation(calculationData);
        showMessage("Calculation created successfully", "success");
      }
      
      resetCalcForm();
      loadCalculations();
    } catch (error) {
      console.error("Error saving calculation:", error);
      showMessage(error.message || "Error saving calculation", "error");
    } finally {
      setLoadingCalc(false);
    }
  };

  // Handle message submit
  const handleMsgSubmit = async (e) => {
    e.preventDefault();

    if (!messageType.trim()) {
      showMessage("Please enter a message type", "error");
      return;
    }

    if (!messageDesc.trim()) {
      showMessage("Please enter a message description", "error");
      return;
    }

    setLoadingMsg(true);

    const messageData = {
      message_type: messageType.trim(),
      message_desc: messageDesc.trim(),
    };

    try {
      if (isEditingMsg) {
        await updateMessage(editMsgId, messageData);
        showMessage("Message updated successfully", "success");
      } else {
        await createMessage(messageData);
        showMessage("Message created successfully", "success");
      }
      
      resetMsgForm();
      loadMessages();
    } catch (error) {
      console.error("Error saving message:", error);
      showMessage(error.message || "Error saving message", "error");
    } finally {
      setLoadingMsg(false);
    }
  };

  // Handle partner submit
  const handlePartnerSubmit = async (e) => {
    e.preventDefault();

    if (!insuranceName.trim()) {
      showMessage("Please enter an insurance name", "error");
      return;
    }

    setLoadingPartner(true);

    const partnerData = {
      insurance_Name: insuranceName.trim(),
      address: address.trim() || null,
      contact: contact.trim() || null,
      insurance_Rate: parseFloat(insuranceRate) || null,
    };

    try {
      if (isEditingPartner) {
        await updateInsurancePartner(editPartnerId, partnerData);
        showMessage("Insurance partner updated successfully", "success");
      } else {
        await createInsurancePartner(partnerData);
        showMessage("Insurance partner created successfully", "success");
      }
      
      resetPartnerForm();
      loadPartners();
    } catch (error) {
      console.error("Error saving insurance partner:", error);
      showMessage(error.message || "Error saving insurance partner", "error");
    } finally {
      setLoadingPartner(false);
    }
  };

  // Edit handlers
  const handleEditCalc = (calc) => {
    setIsEditingCalc(true);
    setIsCreatingCalc(true);
    setEditCalcId(calc.id);
    setVehicleType(calc.vehicle_type);
    setBodilyInjury(calc.bodily_Injury);
    setPersonalAccident(calc.personal_Accident);
    setPropertyDamage(calc.property_Damage);
    setVehicleRate(calc.vehicle_Rate);
    setVat(calc.vat_Tax);
    setLocalTax(calc.local_Gov_Tax);
    setDocStamp(calc.docu_Stamp);
    setAon(calc.aon);
  };

  const handleEditMsg = (msg) => {
    setIsEditingMsg(true);
    setIsCreatingMsg(true);
    setEditMsgId(msg.id);
    setMessageType(msg.message_type);
    setMessageDesc(msg.message_desc);
  };

  const handleEditPartner = (partner) => {
    setIsEditingPartner(true);
    setIsCreatingPartner(true);
    setEditPartnerId(partner.id);
    setInsuranceName(partner.insurance_Name);
    setAddress(partner.address || "");
    setContact(partner.contact || "");
    setInsuranceRate(partner.insurance_Rate || "");
  };

  // Delete handlers
  const handleDeleteCalc = async (id) => {
    if (!window.confirm("Are you sure you want to delete this calculation?")) {
      return;
    }

    try {
      await deleteCalculation(id);
      showMessage("Calculation deleted successfully", "success");
      loadCalculations();
    } catch (error) {
      console.error("Error deleting calculation:", error);
      showMessage("Error deleting calculation", "error");
    }
  };

  const handleDeleteMsg = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      await deleteMessage(id);
      showMessage("Message deleted successfully", "success");
      loadMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
      showMessage("Error deleting message", "error");
    }
  };

  const handleDeletePartner = async (id) => {
    if (!window.confirm("Are you sure you want to delete this insurance partner?")) {
      return;
    }

    try {
      await deleteInsurancePartner(id);
      showMessage("Insurance partner deleted successfully", "success");
      loadPartners();
    } catch (error) {
      console.error("Error deleting insurance partner:", error);
      showMessage("Error deleting insurance partner", "error");
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="admin-controller-container">
      <div className="admin-controller-wrapper">
        <div className="admin-controller-header">
          <h2 className="admin-controller-title">Admin Control Panel</h2>
        </div>

        {/* Tab Navigation */}
        <div style={{ marginBottom: "20px", borderBottom: "2px solid #e0e0e0" }}>
          <button
            onClick={() => setActiveTab("calculations")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              border: "none",
              background: activeTab === "calculations" ? "#007bff" : "#f8f9fa",
              color: activeTab === "calculations" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px 4px 0 0"
            }}
          >
            Vehicle Calculations
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              border: "none",
              background: activeTab === "messages" ? "#007bff" : "#f8f9fa",
              color: activeTab === "messages" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px 4px 0 0"
            }}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab("partners")}
            style={{
              padding: "10px 20px",
              border: "none",
              background: activeTab === "partners" ? "#007bff" : "#f8f9fa",
              color: activeTab === "partners" ? "white" : "#333",
              cursor: "pointer",
              fontWeight: "bold",
              borderRadius: "4px 4px 0 0"
            }}
          >
            Insurance Partners
          </button>
        </div>

        {message.text && (
          <div className={`admin-controller-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* CALCULATIONS TAB */}
        {activeTab === "calculations" && (
          <>
            <div className="admin-controller-header">
              {!isCreatingCalc && (
                <button
                  onClick={showCreateCalcForm}
                  className="admin-controller-btn admin-controller-btn-primary"
                >
                  Add New Vehicle Type
                </button>
              )}
            </div>

            {isCreatingCalc && (
              <form onSubmit={handleCalcSubmit} className="admin-controller-form">
                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Vehicle Type:
                    <input
                      type="text"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="admin-controller-input"
                      placeholder="e.g., Sedan, SUV, Truck"
                      required
                      disabled={isEditingCalc}
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Bodily Injury:
                    <input
                      type="number"
                      step="0.01"
                      value={bodilyInjury}
                      onChange={(e) => setBodilyInjury(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Amount"
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Personal Accident:
                    <input
                      type="number"
                      step="0.01"
                      value={personalAccident}
                      onChange={(e) => setPersonalAccident(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Amount"
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Property Damage:
                    <input
                      type="number"
                      step="0.01"
                      value={propertyDamage}
                      onChange={(e) => setPropertyDamage(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Amount"
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Vehicle Rate:
                    <input
                      type="number"
                      step="0.01"
                      value={vehicleRate}
                      onChange={(e) => setVehicleRate(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Rate"
                    />
                  </label>
                </div>

                <h3 className="admin-controller-subtitle">Taxes & Fees</h3>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    VAT Tax:
                    <input
                      type="number"
                      step="0.01"
                      value={vat}
                      onChange={(e) => setVat(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Amount"
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Local Government Tax:
                    <input
                      type="number"
                      step="0.01"
                      value={localTax}
                      onChange={(e) => setLocalTax(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Amount"
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Documentary Stamp:
                    <input
                      type="number"
                      step="0.01"
                      value={docStamp}
                      onChange={(e) => setDocStamp(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Amount"
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    AON:
                    <input
                      type="number"
                      step="0.01"
                      value={aon}
                      onChange={(e) => setAon(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Amount"
                    />
                  </label>
                </div>

                <div className="admin-controller-button-group">
                  <button
                    type="submit"
                    className="admin-controller-btn admin-controller-btn-primary"
                    disabled={loadingCalc}
                  >
                    {loadingCalc ? "Saving..." : isEditingCalc ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={resetCalcForm}
                    className="admin-controller-btn admin-controller-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="admin-controller-table-wrapper">
              <h3 className="admin-controller-subtitle">Vehicle Type Calculations</h3>
              <table className="admin-controller-table">
                <thead>
                  <tr>
                    <th>Vehicle Type</th>
                    <th>Bodily Injury</th>
                    <th>Personal Accident</th>
                    <th>Property Damage</th>
                    <th>Vehicle Rate</th>
                    <th>VAT Tax</th>
                    <th>Local Tax</th>
                    <th>Doc Stamp</th>
                    <th>AON</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.length === 0 ? (
                    <tr>
                      <td colSpan="10" className="admin-controller-empty">
                        No calculations found. Click "Add New Vehicle Type" to create one.
                      </td>
                    </tr>
                  ) : (
                    calculations.map((calc) => (
                      <tr key={calc.id}>
                        <td><strong>{calc.vehicle_type}</strong></td>
                        <td>{calc.bodily_Injury}</td>
                        <td>{calc.personal_Accident}</td>
                        <td>{calc.property_Damage}</td>
                        <td>{calc.vehicle_Rate}</td>
                        <td>{calc.vat_Tax}</td>
                        <td>{calc.local_Gov_Tax}</td>
                        <td>{calc.docu_Stamp}</td>
                        <td>{calc.aon}</td>
                        <td>
                          <button
                            onClick={() => handleEditCalc(calc)}
                            className="admin-controller-btn admin-controller-btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCalc(calc.id)}
                            className="admin-controller-btn admin-controller-btn-delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <>
            <div className="admin-controller-header">
              {!isCreatingMsg && (
                <button
                  onClick={showCreateMsgForm}
                  className="admin-controller-btn admin-controller-btn-primary"
                >
                  Add New Message
                </button>
              )}
            </div>

            {isCreatingMsg && (
              <form onSubmit={handleMsgSubmit} className="admin-controller-form">
                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Message Type:
                    <input
                      type="text"
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="admin-controller-input"
                      placeholder="e.g., Info, Warning, Error, Success"
                      required
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Message Description:
                    <textarea
                      value={messageDesc}
                      onChange={(e) => setMessageDesc(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Enter message description"
                      rows="4"
                      required
                    />
                  </label>
                </div>

                <div className="admin-controller-button-group">
                  <button
                    type="submit"
                    className="admin-controller-btn admin-controller-btn-primary"
                    disabled={loadingMsg}
                  >
                    {loadingMsg ? "Saving..." : isEditingMsg ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={resetMsgForm}
                    className="admin-controller-btn admin-controller-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="admin-controller-table-wrapper">
              <h3 className="admin-controller-subtitle">Messages</h3>
              <table className="admin-controller-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Message Type</th>
                    <th>Message Description</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="admin-controller-empty">
                        No messages found. Click "Add New Message" to create one.
                      </td>
                    </tr>
                  ) : (
                    messages.map((msg) => (
                      <tr key={msg.id}>
                        <td>{msg.id}</td>
                        <td><strong>{msg.message_type}</strong></td>
                        <td>{msg.message_desc}</td>
                        <td>{formatDate(msg.created_at)}</td>
                        <td>
                          <button
                            onClick={() => handleEditMsg(msg)}
                            className="admin-controller-btn admin-controller-btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMsg(msg.id)}
                            className="admin-controller-btn admin-controller-btn-delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* INSURANCE PARTNERS TAB */}
        {activeTab === "partners" && (
          <>
            <div className="admin-controller-header">
              {!isCreatingPartner && (
                <button
                  onClick={showCreatePartnerForm}
                  className="admin-controller-btn admin-controller-btn-primary"
                >
                  Add New Insurance Partner
                </button>
              )}
            </div>

            {isCreatingPartner && (
              <form onSubmit={handlePartnerSubmit} className="admin-controller-form">
                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Insurance Name:
                    <input
                      type="text"
                      value={insuranceName}
                      onChange={(e) => setInsuranceName(e.target.value)}
                      className="admin-controller-input"
                      placeholder="e.g., ABC Insurance Corp"
                      required
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Address:
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Company address"
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Contact:
                    <textarea
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Phone, email, or other contact information"
                      rows="3"
                    />
                  </label>
                </div>

                <div className="admin-controller-form-group">
                  <label className="admin-controller-label">
                    Insurance Rate:
                    <input
                      type="number"
                      step="0.01"
                      value={insuranceRate}
                      onChange={(e) => setInsuranceRate(e.target.value)}
                      className="admin-controller-input"
                      placeholder="Rate percentage or amount"
                    />
                  </label>
                </div>

                <div className="admin-controller-button-group">
                  <button
                    type="submit"
                    className="admin-controller-btn admin-controller-btn-primary"
                    disabled={loadingPartner}
                  >
                    {loadingPartner ? "Saving..." : isEditingPartner ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={resetPartnerForm}
                    className="admin-controller-btn admin-controller-btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="admin-controller-table-wrapper">
              <h3 className="admin-controller-subtitle">Insurance Partners</h3>
              <table className="admin-controller-table">
                <thead>
                  <tr>
                    <th>Insurance Name</th>
                    <th>Address</th>
                    <th>Contact</th>
                    <th>Insurance Rate</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {partners.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="admin-controller-empty">
                        No insurance partners found. Click "Add New Insurance Partner" to create one.
                      </td>
                    </tr>
                  ) : (
                    partners.map((partner) => (
                      <tr key={partner.id}>
                        <td><strong>{partner.insurance_Name}</strong></td>
                        <td>{partner.address || "N/A"}</td>
                        <td>{partner.contact || "N/A"}</td>
                        <td>{partner.insurance_Rate || "N/A"}</td>
                        <td>{formatDate(partner.created_at)}</td>
                        <td>
                          <button
                            onClick={() => handleEditPartner(partner)}
                            className="admin-controller-btn admin-controller-btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePartner(partner.id)}
                            className="admin-controller-btn admin-controller-btn-delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}