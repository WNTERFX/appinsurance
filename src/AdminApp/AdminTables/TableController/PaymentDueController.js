import { useEffect, useState, useMemo } from "react";
import { fetchPolicies } from "../../AdminActions/PolicyActions";
import {
  fetchPaymentSchedule,
  updatePayment,
  generatePayments,
  archivePayment,
  fetchAllPaymentModes,
  editPaymentDetails,
  deletePayment,
  updatePaymentAmount
} from "../../AdminActions/PaymentDueActions";
import {
  addPaymentPenalty,
  calculateDailyPenalty,
  hasPenaltyForToday,
  notifyClientOfPenalty
} from "../../AdminActions/PaymentPenaltyActions";

import {
  uploadReceiptFile,
  fetchPaymentReceipts,
  deleteReceipt
} from "../../AdminActions/PaymentReceiptActions";


export default function PolicyWithPaymentsController() {
  // --- UI + data state ---
  const [policies, setPolicies] = useState([]);
  const [paymentsMap, setPaymentsMap] = useState({});
  const [paymentsByPolicy, setPaymentsByPolicy] = useState({});
  const [loadingPayments, setLoadingPayments] = useState({});
  const [expanded, setExpanded] = useState({});
  const [expandedPolicy, setExpandedPolicy] = useState(null);

  const [manualReference, setManualReference] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [paymentToEdit, setPaymentToEdit] = useState(null);

  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [paymentToUpdate, setPaymentToUpdate] = useState(null);
  const [updateAmountInput, setUpdateAmountInput] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [paymentInput, setPaymentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPaymentForDelete, setSelectedPaymentForDelete] = useState(null);

  const [penaltyModalOpen, setPenaltyModalOpen] = useState(false);
  const [selectedPaymentForPenalty, setSelectedPaymentForPenalty] = useState(null);

  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);

  // NEW: Filter states
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedPaymentForArchive, setSelectedPaymentForArchive] = useState(null);

  const [paymentModes, setPaymentModes] = useState([]);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);

  //attachment receipt payments
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  //receipt viewer modal state
  const [receiptViewerOpen, setReceiptViewerOpen] = useState(false);
  const [viewingReceipts, setViewingReceipts] = useState([]);
  const [currentReceiptIndex, setCurrentReceiptIndex] = useState(0);
    

  const CHEQUE_PAYMENT_TYPE = 2;

  // NEW: Extract unique agents and partners from policies
  const uniqueAgents = useMemo(() => {
    const agents = policies
      .map(policy => {
        const client = policy.clients_Table;
        if (!client?.employee_Accounts) return null;
        const firstName = client.employee_Accounts.first_name || "";
        const lastName = client.employee_Accounts.last_name || "";
        return `${firstName} ${lastName}`.trim();
      })
      .filter(agent => agent && agent !== "");
    
    return [...new Set(agents)].sort();
  }, [policies]);

  const uniquePartners = useMemo(() => {
    const partners = policies
      .map(policy => policy.insurance_Partners?.insurance_Name)
      .filter(partner => partner);
    
    return [...new Set(partners)].sort();
  }, [policies]);

  useEffect(() => {
    loadPaymentModes();
  }, []);

  const loadPaymentModes = async () => {
  try {
    const modes = await fetchAllPaymentModes();
    setPaymentModes(modes);
  } catch (err) {
    console.error("Error loading payment modes:", err);
    setPaymentModes([]);
  }
};

  // ---------- LOAD POLICIES ----------
  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setIsLoading(true);
      setPolicies([]);
      setPaymentsMap({});

      const allPolicies = await fetchPolicies();
      if (!allPolicies) {
        setPolicies([]);
        return;
      }

      const filtered = allPolicies.filter(policy => policy.is_archived !== true);
      setPolicies(filtered);

      setCurrentPage(1);
    } catch (err) {
      console.error("Error loading policies:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpand = async (policyId) => {
    setExpanded(prev => ({ ...prev, [policyId]: !prev[policyId] }));

    if (expandedPolicy === policyId) {
      setExpandedPolicy(null);
    } else {
      setExpandedPolicy(policyId);
    }

    if (!paymentsByPolicy[policyId] && !loadingPayments[policyId]) {
      setLoadingPayments(prev => ({ ...prev, [policyId]: true }));
      try {
        const data = await fetchPaymentSchedule(policyId);
        const nonArchived = (data || []).filter(p => p.is_archive !== true);
        setPaymentsByPolicy(prev => ({ ...prev, [policyId]: nonArchived }));
      } catch (err) {
        console.error("Error fetching payments for policy", policyId, err);
        setPaymentsByPolicy(prev => ({ ...prev, [policyId]: [] }));
      } finally {
        setLoadingPayments(prev => ({ ...prev, [policyId]: false }));
      }
    }
  };

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  const calculateTotalPenalties = (payment) => {
    const penalties = payment.penalties || [];
    return penalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
  };

  const calculateTotalDue = (payment) => {
    const baseDue = parseFloat(payment.amount_to_be_paid || 0);
    return baseDue + calculateTotalPenalties(payment);
  };

  const isChequePayment = (payment) => payment.payment_type_id === CHEQUE_PAYMENT_TYPE;

  const calculateOverdueInfo = (payment) => {
    if (isChequePayment(payment)) return { daysOverdue: 0, penaltyPercentage: 0 };

    const paymentDate = new Date(payment.payment_date);
    const today = new Date();
    const isPaid = getPaymentStatus(payment) === "fully-paid";
    const penalties = payment.penalties || payment.payment_due_penalties || [];

    if (isPaid) {
      if (penalties.length > 0) {
        const lastPenalty = penalties[penalties.length - 1];
        const lastDaysOverdue = lastPenalty.not_paid_days || 0;
        const penaltyPercentage = Math.min(lastDaysOverdue, 31);
        return { daysOverdue: lastDaysOverdue, penaltyPercentage };
      }
      return { daysOverdue: 0, penaltyPercentage: 0 };
    }

    const daysOverdue = Math.floor((today - paymentDate) / (1000 * 60 * 60 * 24));
    if (daysOverdue <= 0) return { daysOverdue: 0, penaltyPercentage: 0 };

    const penaltyPercentage = Math.min(daysOverdue, 31);
    return { daysOverdue, penaltyPercentage };
  };

  const calculateTotalPaid = (payment) => {
    const basePaid = parseFloat(payment.paid_amount || 0);
    const penaltiesPaid = (payment.penalties || [])
      .filter(p => p.is_paid)
      .reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
    return basePaid + penaltiesPaid;
  };

  const handlePaymentClick = (payment, clientPhone) => {
    setCurrentPayment({ ...payment, client_phone: clientPhone, policy_id: payment.policy_id });
    setPaymentInput("");
    setSelectedPaymentMode(payment.payment_mode_id || null); 
    setManualReference(payment.payment_manual_reference || "")
    setModalOpen(true);
  };

  const handleOpenEditModal = (payment) => {
    setPaymentToEdit(payment);
    setSelectedPaymentMode(payment.payment_mode_id || null);
    setManualReference(payment.payment_manual_reference || "");
    setEditModalOpen(true);
    setPaymentToEdit(payment);
    setSelectedPaymentMode(payment.payment_mode_id || null);
    setManualReference(payment.payment_manual_reference || "");
    setEditModalOpen(true);
  };

  const handlePaymentSave = async () => {
    if (!currentPayment?.id || !currentPayment?.policy_id) return;
    
    if (!selectedPaymentMode) {
      alert("Please select a payment mode");
      return;
    }
    
    try {
      const cleanedInput = parseFloat(paymentInput.replace(/,/g, ""));
      if (isNaN(cleanedInput)) {
        alert("Please enter a valid number");
        return;
      }

      const policyId = currentPayment.policy_id;
      const payments = paymentsByPolicy[policyId] || paymentsMap[policyId] || [];
      const currentIndex = payments.findIndex(p => p.id === currentPayment.id);
      if (currentIndex === -1) return;

      const currentTotalDue = calculateTotalDue(currentPayment);
      const currentPaid = calculateTotalPaid(currentPayment);
      const currentRemaining = Math.max(currentTotalDue - currentPaid, 0);

      const totalRemainingAcrossAll = payments.reduce((sum, p) => {
        const totalDue = calculateTotalDue(p);
        const totalPaid = calculateTotalPaid(p);
        return sum + Math.max(totalDue - totalPaid, 0);
      }, 0);

      if (cleanedInput > totalRemainingAcrossAll + 0.0001) {
        alert(`You cannot pay more than the total remaining balance (₱${totalRemainingAcrossAll.toLocaleString()}).`);
        return;
      }

      if (cleanedInput <= currentRemaining + 0.0001) {
        await updatePayment(currentPayment.id, cleanedInput, selectedPaymentMode, manualReference || null);
      } else {
        let remainingToApply = cleanedInput;
        for (let i = currentIndex; i < payments.length && remainingToApply > 0; i++) {
          const p = payments[i];
          const remaining = Math.max(calculateTotalDue(p) - calculateTotalPaid(p), 0);
          if (remaining <= 0) continue;
          const amountToPay = Math.min(remaining, remainingToApply);
          const ref = i === currentIndex ? (manualReference || null) : null;
          await updatePayment(p.id, amountToPay, selectedPaymentMode, ref);
          remainingToApply -= amountToPay;
        }
      }

      const updatedSchedule = await fetchPaymentSchedule(policyId);
      setPaymentsByPolicy(prev => ({ ...prev, [policyId]: updatedSchedule }));
      setPaymentsMap(prev => ({ ...prev, [policyId]: updatedSchedule }));

      if (Math.abs(cleanedInput - totalRemainingAcrossAll) < 0.01) {
        alert("Full payment applied across remaining months!");
      } else if (cleanedInput > currentRemaining) {
        alert("Payment applied with spillover across months.");
      } else {
        alert("Payment applied successfully!");
      }

      setModalOpen(false);
      setCurrentPayment(null);
      setPaymentInput("");
      setSelectedPaymentMode(null);
      setManualReference("");
      setManualReference("");
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Failed to update payment. Check console for details.");
    }
  };

  const handleOpenDeleteModal = (payment) => {
    setSelectedPaymentForDelete(payment);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPaymentForDelete) return;
    try {
      await deletePayment(selectedPaymentForDelete.id);

      const policyId = selectedPaymentForDelete.policy_id;
      
      const updatedSchedule = await fetchPaymentSchedule(policyId);
      const nonArchived = (updatedSchedule || []).filter(p => p.is_archive !== true);
      
      setPaymentsByPolicy(prev => ({ ...prev, [policyId]: nonArchived }));
      setPaymentsMap(prev => ({ ...prev, [policyId]: nonArchived }));

      alert("Payment deleted successfully!");
      setDeleteModalOpen(false);
      setSelectedPaymentForDelete(null);
    } catch (err) {
      console.error("Error deleting payment:", err);
      alert("Failed to delete payment. Check console for details.");
    }
  };

  const handleEditPaymentSave = async () => {
    if (!paymentToEdit?.id || !paymentToEdit?.policy_id) return;
    
    if (!selectedPaymentMode) {
      alert("Please select a payment mode");
      return;
    }
    
    try {
      await editPaymentDetails(
        paymentToEdit.id,
        selectedPaymentMode,
        manualReference || null
      );

      const policyId = paymentToEdit.policy_id;
      const updatedSchedule = await fetchPaymentSchedule(policyId);
      setPaymentsByPolicy(prev => ({ ...prev, [policyId]: updatedSchedule }));
      setPaymentsMap(prev => ({ ...prev, [policyId]: updatedSchedule }));

      alert("Payment details updated successfully!");
      setEditModalOpen(false);
      setPaymentToEdit(null);
      setManualReference("");
      setSelectedPaymentMode(null);
    } catch (err) {
      console.error("Error updating payment details:", err);
      alert("Failed to update payment details. Check console for details.");
    }
  };

  const handleAddPenalty = (payment) => {
    if (isChequePayment(payment)) {
      alert("Cheque payments are not subject to overdue penalties.");
      return;
    }
    const overdueInfo = calculateOverdueInfo(payment);
    if (overdueInfo.daysOverdue <= 0) {
      alert("This payment is not yet overdue. Penalties can only be added to overdue payments.");
      return;
    }
    setSelectedPaymentForPenalty(payment);
    setPenaltyModalOpen(true);
  };

  const handlePenaltySave = async () => {
    if (!selectedPaymentForPenalty) return;

    try {
      const overdueInfo = calculateOverdueInfo(selectedPaymentForPenalty);
      const { penaltyAmount } = await calculateDailyPenalty({
        amount_to_be_paid: selectedPaymentForPenalty.amount_to_be_paid,
        payment_date: selectedPaymentForPenalty.payment_date,
      });
      const reason = `${overdueInfo.daysOverdue} day(s) overdue - ${overdueInfo.penaltyPercentage}% penalty (1% per day)`;

      await addPaymentPenalty(
        selectedPaymentForPenalty.id,
        penaltyAmount,
        reason,
        overdueInfo.daysOverdue
      );

      try {
        console.log(`Attempting to notify client for penalty on payment ${selectedPaymentForPenalty.id}...`);
        await notifyClientOfPenalty(selectedPaymentForPenalty.id);
        console.log("Client notification function invoked.");
      } catch (notifyError) {
        console.warn("Penalty notification failed to send:", notifyError.message);
      }

      const policyId = selectedPaymentForPenalty.policy_id;
      const updated = await fetchPaymentSchedule(policyId);
      setPaymentsByPolicy((prev) => ({ ...prev, [policyId]: updated }));
      setPaymentsMap((prev) => ({ ...prev, [policyId]: updated }));

      alert("Penalty added successfully!");
      setPenaltyModalOpen(false);
      setSelectedPaymentForPenalty(null);
      
    } catch (err) {
      console.error("Error adding penalty:", err);
      alert("Failed to add penalty. See console for details.");
    }
  };

  const handleGeneratePayments = async (policyId, payments) => {
    try {
      await generatePayments(policyId, payments);
      if (paymentsByPolicy[policyId]) {
        const updated = await fetchPaymentSchedule(policyId);
        setPaymentsByPolicy(prev => ({ ...prev, [policyId]: updated }));
        setPaymentsMap(prev => ({ ...prev, [policyId]: updated }));
      }
      alert("Payments generated successfully!");
    } catch (err) {
      console.error("Error generating payments:", err);
      throw err;
    }
  };

  const handleOpenGenerateModal = (policy) => {
    setSelectedPolicy(policy);
    setGenerateModalOpen(true);
  };

  const handleOpenArchiveModal = (payment) => {
    setSelectedPaymentForArchive(payment);
    setArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!selectedPaymentForArchive) return;
    try {
      if (selectedPaymentForArchive.payments) {
        const { policy_id, payments } = selectedPaymentForArchive;
        for (const payment of payments) await archivePayment(payment.id);
        const updatedSchedule = await fetchPaymentSchedule(policy_id);
        setPaymentsByPolicy(prev => ({ ...prev, [policy_id]: updatedSchedule }));
        setPaymentsMap(prev => ({ ...prev, [policy_id]: updatedSchedule }));
        alert(`All ${payments.length} payments archived successfully!`);
      } else {
        await archivePayment(selectedPaymentForArchive.id);
        const policyId = selectedPaymentForArchive.policy_id;
        const updatedSchedule = await fetchPaymentSchedule(policyId);
        setPaymentsByPolicy(prev => ({ ...prev, [policyId]: updatedSchedule }));
        setPaymentsMap(prev => ({ ...prev, [policyId]: updatedSchedule }));
        alert("Payment archived successfully!");
      }
      setArchiveModalOpen(false);
      setSelectedPaymentForArchive(null);
    } catch (err) {
      console.error("Error archiving payment:", err);
      alert("Failed to archive payment. Check console for details.");
    }
  };

  // NEW: Enhanced filtering with agent and partner
  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const client = policy.clients_Table;
      
      // Client name and policy ID search
      const clientName = client
        ? [client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
        : "";
      
      const policyId = policy.internal_id?.toLowerCase() || "";
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch = clientName.includes(search) || policyId.includes(search);
      
      // Agent filter
      const agentName = client?.employee_Accounts
        ? `${client.employee_Accounts.first_name || ""} ${client.employee_Accounts.last_name || ""}`.trim()
        : "";
      const matchesAgent = !selectedAgent || agentName === selectedAgent;
      
      // Partner filter
      const partnerName = policy.insurance_Partners?.insurance_Name || "";
      const matchesPartner = !selectedPartner || partnerName === selectedPartner;
      
      return matchesSearch && matchesAgent && matchesPartner;
    });
  }, [policies, searchTerm, selectedAgent, selectedPartner]);

  const totalPoliciesCount = filteredPolicies.length;
  const totalPages = Math.ceil(totalPoliciesCount / rowsPerPage);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirst, indexOfLast);

  const renderPolicies = currentPolicies;

  // Reciept attachments and viewing functions
  const handleOpenReceiptModal = (payment) => {
    setSelectedPaymentForReceipt(payment);
    setReceiptModalOpen(true);
  };

  const handleUploadReceipt = async (file) => {
    if (!selectedPaymentForReceipt?.id || !selectedPaymentForReceipt?.policy_id) return;
    
    try {
      setUploadingReceipt(true);
      await uploadReceiptFile(selectedPaymentForReceipt.id, file);
      
      // Refresh payment schedule to include new receipt
      const policyId = selectedPaymentForReceipt.policy_id;
      const updatedSchedule = await fetchPaymentSchedule(policyId);
      const nonArchived = (updatedSchedule || []).filter(p => p.is_archive !== true);
      
      setPaymentsByPolicy(prev => ({ ...prev, [policyId]: nonArchived }));
      setPaymentsMap(prev => ({ ...prev, [policyId]: nonArchived }));
      
      alert("Receipt uploaded successfully!");
    } catch (err) {
      console.error("Error uploading receipt:", err);
      alert(err.message || "Failed to upload receipt. Check console for details.");
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleViewReceipts = (payment) => {
    if (payment.receipts && payment.receipts.length > 0) {
      setSelectedPaymentForReceipt(payment);
      setViewingReceipts(payment.receipts);
      setCurrentReceiptIndex(0);
      setReceiptViewerOpen(true);
    }
  };

  const handleDeleteReceiptFromViewer = async (receiptId) => {
    if (!window.confirm("Are you sure you want to delete this receipt?")) return;
    
    try {
      await deleteReceipt(receiptId);
      
      // Refresh receipts
      const updatedReceipts = viewingReceipts.filter(r => r.id !== receiptId);
      setViewingReceipts(updatedReceipts);
      
      if (updatedReceipts.length === 0) {
        setReceiptViewerOpen(false);
      } else if (currentReceiptIndex >= updatedReceipts.length) {
        setCurrentReceiptIndex(updatedReceipts.length - 1);
      }
      
      // Refresh payment schedule
      const payment = selectedPaymentForReceipt || viewingReceipts[0];
      if (payment?.payment_id) {
        const policyId = payment.policy_id;
        const updatedSchedule = await fetchPaymentSchedule(policyId);
        const nonArchived = (updatedSchedule || []).filter(p => p.is_archive !== true);
        
        setPaymentsByPolicy(prev => ({ ...prev, [policyId]: nonArchived }));
        setPaymentsMap(prev => ({ ...prev, [policyId]: nonArchived }));
      }
      
      alert("Receipt deleted successfully!");
    } catch (err) {
      console.error("Error deleting receipt:", err);
      alert("Failed to delete receipt. Check console for details.");
    }
  };

  return {
    policies,
    paymentsMap,
    paymentsByPolicy,
    loadingPayments,

    paymentModes,
    selectedPaymentMode,
    setSelectedPaymentMode,

    //Edit Payment
<<<<<<< HEAD
    updateModalOpen,
    setUpdateModalOpen,
    paymentToUpdate,
    setPaymentToUpdate,
    updateAmountInput,
    setUpdateAmountInput,
    handleOpenUpdateModal,
    handleUpdatePaymentAmount,

=======
>>>>>>> 0ba9d56960ed614b8b6f2cc5db336801ad217262
    updateModalOpen,
    setUpdateModalOpen,
    paymentToUpdate,
    setPaymentToUpdate,
    updateAmountInput,
    setUpdateAmountInput,
    handleOpenUpdateModal,
    handleUpdatePaymentAmount,

    // counts + pagination
    totalPoliciesCount,
    rowsPerPage,
    setRowsPerPage,
    currentPage,
    setCurrentPage,
    totalPages,

    searchTerm,
    setSearchTerm,

    // NEW: Filter exports
    selectedAgent,
    setSelectedAgent,
    selectedPartner,
    setSelectedPartner,
    uniqueAgents,
    uniquePartners,

    // NEW: Filter exports
    selectedAgent,
    setSelectedAgent,
    selectedPartner,
    setSelectedPartner,
    uniqueAgents,
    uniquePartners,

    expanded,
    setExpanded,
    expandedPolicy,
    setExpandedPolicy,
    isLoading,
    setIsLoading,

    modalOpen,
    setModalOpen,
    currentPayment,
    setCurrentPayment,
    paymentInput,
    setPaymentInput,

    deleteModalOpen,
    setDeleteModalOpen,
    selectedPaymentForDelete,
    setSelectedPaymentForDelete,

    manualReference,
    setManualReference,
    editModalOpen,
    setEditModalOpen,
    paymentToEdit,
    setPaymentToEdit,
    handleOpenEditModal,
    handleEditPaymentSave,

    penaltyModalOpen,
    setPenaltyModalOpen,
    selectedPaymentForPenalty,
    setSelectedPaymentForPenalty,

    generateModalOpen,
    setGenerateModalOpen,
    selectedPolicy,
    setSelectedPolicy,

    archiveModalOpen,
    setArchiveModalOpen,
    selectedPaymentForArchive,
    setSelectedPaymentForArchive,

    loadPolicies,
    handleExpand,
    toggleExpand,
    calculateTotalPenalties,
    calculateTotalDue,
    isChequePayment,
    calculateOverdueInfo,
    calculateTotalPaid,
    handlePaymentClick,
    handlePaymentSave,
    handleAddPenalty,
    handlePenaltySave,
    handleGeneratePayments,
    handleOpenGenerateModal,
    handleOpenArchiveModal,
    handleArchiveConfirm,
    hasPenaltyForToday,
    getPaymentStatus,
    handleOpenDeleteModal,
    handleDeleteConfirm,

    filteredPolicies,
    currentPolicies,
    renderPoliciesList: renderPolicies,

    receiptModalOpen,
    setReceiptModalOpen,
    selectedPaymentForReceipt,
    setSelectedPaymentForReceipt,
    uploadingReceipt,
    handleOpenReceiptModal,
    handleUploadReceipt,
    
    receiptViewerOpen,
    setReceiptViewerOpen,
    viewingReceipts,
    setViewingReceipts,
    currentReceiptIndex,
    setCurrentReceiptIndex,
    handleViewReceipts,
    handleDeleteReceiptFromViewer,

    receiptModalOpen,
    setReceiptModalOpen,
    selectedPaymentForReceipt,
    setSelectedPaymentForReceipt,
    uploadingReceipt,
    handleOpenReceiptModal,
    handleUploadReceipt,
    
    receiptViewerOpen,
    setReceiptViewerOpen,
    viewingReceipts,
    setViewingReceipts,
    currentReceiptIndex,
    setCurrentReceiptIndex,
    handleViewReceipts,
    handleDeleteReceiptFromViewer
  };
}

export function getPaymentStatus(payment) {
  if (!payment) return "not-paid";
  if (payment.is_refunded || payment.payment_status === "refunded") return "refunded";
  if (payment.payment_status === "cancelled") return "cancelled";
  if (payment.payment_status === "voided") return "voided";
  const paid = parseFloat(payment.paid_amount || 0);
  const due = parseFloat(payment.amount_to_be_paid || 0);
  if (paid <= 0) return "not-paid";
  if (paid < due) return "partially-paid";
  if (paid >= due) return "fully-paid";
  return "not-paid";
}