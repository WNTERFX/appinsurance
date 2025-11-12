import { useState, useEffect } from "react";
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
} from "../AdminActions/AdminControlActions";
import {
  fetchAllEmployeeRoles,
  createEmployeeRole,
  updateEmployeeRole,
  deleteEmployeeRole
} from "../AdminActions/EmployeeRoleActions";

export const useAdminController = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState("calculations");
  
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
  
  // Employee Roles state
  const [roles, setRoles] = useState([]);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [editRoleId, setEditRoleId] = useState(null);
  const [loadingRole, setLoadingRole] = useState(false);
  
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

  // Employee Role form fields
  const [roleName, setRoleName] = useState("");

  //CronJobs
  const [cronJobs, setCronJobs] = useState([]);
  const [isCreatingCron, setIsCreatingCron] = useState(false);
  const [loadingCron, setLoadingCron] = useState(false);
  const [cronApiKey, setCronApiKey] = useState("");
  const [cronApiKeyInput, setCronApiKeyInput] = useState("");

  // Cron form fields
  const [cronUrl, setCronUrl] = useState("");
  const [cronTitle, setCronTitle] = useState("");
  const [cronEnabled, setCronEnabled] = useState(true);
  const [cronTimezone, setCronTimezone] = useState("UTC");
  const [cronMinutes, setCronMinutes] = useState("0");
  const [cronHours, setCronHours] = useState("-1");
  const [cronMdays, setCronMdays] = useState("-1");
  const [cronMonths, setCronMonths] = useState("-1");
  const [cronWdays, setCronWdays] = useState("-1");

  const CRON_ENDPOINT = "https://api.cron-job.org";

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

  // Fetch all employee roles
  const loadRoles = async () => {
    try {
      const data = await fetchAllEmployeeRoles();
      setRoles(data);
    } catch (error) {
      console.error("Error fetching employee roles:", error);
      showMessage("Error fetching employee roles", "error");
    }
  };

  useEffect(() => {
    loadCalculations();
    loadMessages();
    loadPartners();
    loadRoles();
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

  // Reset role form
  const resetRoleForm = () => {
    setRoleName("");
    setIsEditingRole(false);
    setIsCreatingRole(false);
    setEditRoleId(null);
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

  const showCreateRoleForm = () => {
    resetRoleForm();
    setIsCreatingRole(true);
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

  // Handle role submit
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showMessage("Please enter a role name", "error");
      return;
    }
    setLoadingRole(true);
    const roleData = {
      role_name: roleName.trim(),
    };
    try {
      if (isEditingRole) {
        await updateEmployeeRole(editRoleId, roleData);
        showMessage("Employee role updated successfully", "success");
      } else {
        await createEmployeeRole(roleData);
        showMessage("Employee role created successfully", "success");
      }
      resetRoleForm();
      loadRoles();
    } catch (error) {
      console.error("Error saving employee role:", error);
      showMessage(error.message || "Error saving employee role", "error");
    } finally {
      setLoadingRole(false);
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

  const handleEditRole = (role) => {
    setIsEditingRole(true);
    setIsCreatingRole(true);
    setEditRoleId(role.id);
    setRoleName(role.role_name);
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

  const handleDeleteRole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee role?")) {
      return;
    }
    try {
      await deleteEmployeeRole(id);
      showMessage("Employee role deleted successfully", "success");
      loadRoles();
    } catch (error) {
      console.error("Error deleting employee role:", error);
      showMessage("Error deleting employee role", "error");
    }
  };

  const parseCronValue = (value) => {
    if (!value || value.trim() === "-1") return [-1];
    return value.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v));
  };

  // Save API Key
  const saveCronApiKey = () => {
    if (!cronApiKeyInput.trim()) {
      showMessage("Please enter an API key", "error");
      return;
    }
    setCronApiKey(cronApiKeyInput.trim());
    showMessage("API key saved successfully", "success");
    loadCronJobs();
  };

  // Clear API Key
  const clearCronApiKey = () => {
    if (!window.confirm("Are you sure you want to clear the API key?")) return;
    setCronApiKey("");
    setCronApiKeyInput("");
    setCronJobs([]);
    showMessage("API key cleared", "success");
  };

  // Fetch all cron jobs
  const loadCronJobs = async () => {
    if (!cronApiKey) {
      showMessage("Please configure your API key first", "error");
      return;
    }

    setLoadingCron(true);
    try {
      const response = await fetch(`${CRON_ENDPOINT}/jobs`, {
        headers: {
          'Authorization': `Bearer ${cronApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setCronJobs(data.jobs || []);
      showMessage("Cron jobs loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching cron jobs:", error);
      showMessage(error.message || "Error fetching cron jobs", "error");
    } finally {
      setLoadingCron(false);
    }
  };

  // Reset cron form
  const resetCronForm = () => {
    setCronUrl("");
    setCronTitle("");
    setCronEnabled(true);
    setCronTimezone("UTC");
    setCronMinutes("0");
    setCronHours("-1");
    setCronMdays("-1");
    setCronMonths("-1");
    setCronWdays("-1");
    setIsCreatingCron(false);
  };

  // Show create form
  const showCreateCronForm = () => {
    resetCronForm();
    setIsCreatingCron(true);
  };

  // Handle cron job submit
  const handleCronSubmit = async (e) => {
    e.preventDefault();
    
    if (!cronUrl.trim()) {
      showMessage("Please enter a job URL", "error");
      return;
    }

    setLoadingCron(true);

    const jobData = {
      job: {
        url: cronUrl.trim(),
        enabled: cronEnabled,
        title: cronTitle.trim() || undefined,
        saveResponses: true,
        schedule: {
          timezone: cronTimezone,
          expiresAt: 0,
          hours: parseCronValue(cronHours),
          mdays: parseCronValue(cronMdays),
          minutes: parseCronValue(cronMinutes),
          months: parseCronValue(cronMonths),
          wdays: parseCronValue(cronWdays)
        }
      }
    };

    try {
      const response = await fetch(`${CRON_ENDPOINT}/jobs`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cronApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      showMessage("Cron job created successfully", "success");
      resetCronForm();
      await loadCronJobs();
    } catch (error) {
      console.error("Error creating cron job:", error);
      showMessage(error.message || "Error creating cron job", "error");
    } finally {
      setLoadingCron(false);
    }
  };

  // Toggle cron job enabled/disabled
  const toggleCronJob = async (jobId, currentState) => {
    setLoadingCron(true);

    try {
      const response = await fetch(`${CRON_ENDPOINT}/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${cronApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          job: {
            enabled: !currentState
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      showMessage(`Cron job ${!currentState ? 'enabled' : 'disabled'} successfully`, "success");
      await loadCronJobs();
    } catch (error) {
      console.error("Error toggling cron job:", error);
      showMessage(error.message || "Error toggling cron job", "error");
    } finally {
      setLoadingCron(false);
    }
  };

  // Delete cron job
  const handleDeleteCron = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this cron job?")) {
      return;
    }

    setLoadingCron(true);

    try {
      const response = await fetch(`${CRON_ENDPOINT}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${cronApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      showMessage("Cron job deleted successfully", "success");
      await loadCronJobs();
    } catch (error) {
      console.error("Error deleting cron job:", error);
      showMessage(error.message || "Error deleting cron job", "error");
    } finally {
      setLoadingCron(false);
    }
  };

  const handleTestCron = async (jobId) => {
    setLoadingCron(true);
    console.log(`Attempting to test job: ${jobId}`);

    try {
      const response = await fetch(`${CRON_ENDPOINT}/jobs/${jobId}/run`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${cronApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const result = await response.json(); 
      console.log("Test run successfully triggered:", result);
      
      alert(`Successfully triggered test run for job ${jobId}.`);

    } catch (error) {
      console.error("Failed to test cron job:", error);
      alert(`Error triggering job: ${error.message}`);
    } finally {
      setLoadingCron(false);
    }
  };

  return {
    // Tab state
    activeTab,
    setActiveTab,
    
    // Message state
    message,
    
    // Calculations
    calculations,
    isEditingCalc,
    isCreatingCalc,
    loadingCalc,
    vehicleType,
    setVehicleType,
    bodilyInjury,
    setBodilyInjury,
    personalAccident,
    setPersonalAccident,
    propertyDamage,
    setPropertyDamage,
    vehicleRate,
    setVehicleRate,
    vat,
    setVat,
    localTax,
    setLocalTax,
    docStamp,
    setDocStamp,
    aon,
    setAon,
    showCreateCalcForm,
    handleCalcSubmit,
    resetCalcForm,
    handleEditCalc,
    handleDeleteCalc,
    
    // Messages
    messages,
    isEditingMsg,
    isCreatingMsg,
    loadingMsg,
    messageType,
    setMessageType,
    messageDesc,
    setMessageDesc,
    showCreateMsgForm,
    handleMsgSubmit,
    resetMsgForm,
    handleEditMsg,
    handleDeleteMsg,
    
    // Partners
    partners,
    isEditingPartner,
    isCreatingPartner,
    loadingPartner,
    insuranceName,
    setInsuranceName,
    address,
    setAddress,
    contact,
    setContact,
    insuranceRate,
    setInsuranceRate,
    showCreatePartnerForm,
    handlePartnerSubmit,
    resetPartnerForm,
    handleEditPartner,
    handleDeletePartner,

    // Employee Roles
    roles,
    isEditingRole,
    isCreatingRole,
    loadingRole,
    roleName,
    setRoleName,
    showCreateRoleForm,
    handleRoleSubmit,
    resetRoleForm,
    handleEditRole,
    handleDeleteRole,

    // Cron Jobs
    cronJobs,
    isCreatingCron,
    loadingCron,
    cronApiKey,
    cronApiKeyInput,
    setCronApiKeyInput,
    cronUrl,
    setCronUrl,
    cronTitle,
    setCronTitle,
    cronEnabled,
    setCronEnabled,
    cronTimezone,
    setCronTimezone,
    cronMinutes,
    setCronMinutes,
    cronHours,
    setCronHours,
    cronMdays,
    setCronMdays,
    cronMonths,
    setCronMonths,
    cronWdays,
    setCronWdays,
    saveCronApiKey,
    clearCronApiKey,
    loadCronJobs,
    showCreateCronForm,
    handleCronSubmit,
    resetCronForm,
    toggleCronJob,
    handleDeleteCron,
    handleTestCron,
  };
};