import { useEffect, useState, useRef, useMemo  } from "react";
import { 
  fetchArchivedPayments, 
  unArchivePayment, 
  deletePayment 
} from "../../AdminActions/PaymentDueActions";
import { fetchPenaltiesForPayments } from "../../AdminActions/PaymentPenaltyActions";

/**
 * PaymentArchiveController
 * - Matches the pattern of PolicyWithPaymentsController
 * - Loads policy headers first, then lazy-loads payments on expand
 */
export default function PaymentArchiveController() {
  // --- Core data state ---
  const [policies, setPolicies] = useState([]); // Just policy metadata
  const [paymentsByPolicy, setPaymentsByPolicy] = useState({}); // lazy-loaded payments
  const [loadingPayments, setLoadingPayments] = useState({});
  
  // --- UI state ---
  const [expanded, setExpanded] = useState({});
  const [expandedPolicy, setExpandedPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Modal states ---
  const [unarchiveModalOpen, setUnarchiveModalOpen] = useState(false);
  const [selectedPolicyForUnarchive, setSelectedPolicyForUnarchive] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPolicyForDelete, setSelectedPolicyForDelete] = useState(null);

  // --- Search & Pagination ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // --- Filtering ---
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);

  // --- Infinite scroll ---
  const sentinelRef = useRef(null);

  // ---------- INITIAL LOAD: Only Policy Headers ----------
  useEffect(() => {
    loadPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const uniqueAgents = useMemo(() => {
    const agents = policies
      .map(policy => {
        const client = policy.clients_Table;
        if (!client?.employee_Accounts) return null;
        
        // Handle both array and object
        const agentAccounts = client.employee_Accounts;
        let firstName = "";
        let lastName = "";
        
        if (Array.isArray(agentAccounts) && agentAccounts.length > 0) {
          firstName = agentAccounts[0].first_name || "";
          lastName = agentAccounts[0].last_name || "";
        } else if (agentAccounts && !Array.isArray(agentAccounts)) {
          firstName = agentAccounts.first_name || "";
          lastName = agentAccounts.last_name || "";
        }
        
        return `${firstName} ${lastName}`.trim();
      })
      .filter(agent => agent && agent !== "");
    
    return [...new Set(agents)].sort();
  }, [policies]);

  const uniquePartners = useMemo(() => {
    const partners = policies
      .map(policy => {
        const insurancePartners = policy.insurance_Partners;
        if (Array.isArray(insurancePartners) && insurancePartners.length > 0) {
          return insurancePartners[0].insurance_Name;
        } else if (insurancePartners && !Array.isArray(insurancePartners)) {
          return insurancePartners.insurance_Name;
        }
        return null;
      })
      .filter(partner => partner);
    
    return [...new Set(partners)].sort();
  }, [policies]);


  /**
   * Load ONLY policy headers (no payment data at all)
   * Extract unique policies from archived payments with all their relationships
   * (clients_Table with employee_Accounts, insurance_Partners)
   */
  const loadPolicies = async () => {
    try {
      setIsLoading(true);
      setPolicies([]);

      const data = await fetchArchivedPayments();
      
      // Group by policy - keep full policy object with all relationships
      const policiesMap = {};
      data.forEach(payment => {
        const policy = payment.policy_Table;
        if (policy && !policiesMap[policy.id]) {
          // Store the complete policy object as-is
          // This includes: clients_Table (with employee_Accounts), insurance_Partners
          policiesMap[policy.id] = policy;
        }
      });

      const uniquePolicies = Object.values(policiesMap);
      setPolicies(uniquePolicies);

      // reset pagination
      setCurrentPage(1);
    } catch (err) {
      console.error("Error loading archived policies:", err);
      setPolicies([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle expanding a policy: lazy-load payments
   * This matches handleExpand from PolicyWithPaymentsController
   */
  const handleExpand = async (policyId) => {
    setExpanded(prev => ({ ...prev, [policyId]: !prev[policyId] }));

    if (expandedPolicy === policyId) {
      setExpandedPolicy(null);
    } else {
      setExpandedPolicy(policyId);
    }

    // Lazy load payments if not already loaded
    if (!paymentsByPolicy[policyId] && !loadingPayments[policyId]) {
      setLoadingPayments(prev => ({ ...prev, [policyId]: true }));
      try {
        // Fetch all archived payments and filter for this policy
        const allData = await fetchArchivedPayments();
        const policyPayments = allData.filter(p => p.policy_Table?.id === policyId);
        
        if (policyPayments.length > 0) {
          // Fetch penalties
          const paymentIds = policyPayments.map(p => p.id);
          const penaltiesMap = await fetchPenaltiesForPayments(paymentIds);
          
          const paymentsWithPenalties = policyPayments.map(p => ({
            ...p,
            penalties: penaltiesMap[p.id] || []
          })).sort((a, b) => new Date(a.payment_date) - new Date(b.payment_date));

          setPaymentsByPolicy(prev => ({ ...prev, [policyId]: paymentsWithPenalties }));
        } else {
          setPaymentsByPolicy(prev => ({ ...prev, [policyId]: [] }));
        }
      } catch (err) {
        console.error("Error fetching payments for policy", policyId, err);
        setPaymentsByPolicy(prev => ({ ...prev, [policyId]: [] }));
      } finally {
        setLoadingPayments(prev => ({ ...prev, [policyId]: false }));
      }
    }
  };

  const toggleExpand = (policyId) => {
    setExpanded(prev => ({ ...prev, [policyId]: !prev[policyId] }));
  };

  // ---------- CALCULATION HELPERS ----------
  const calculateTotalPenalties = (payment) => {
    return (payment.penalties || []).reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
  };

  const calculateTotalDue = (payment) => {
    return parseFloat(payment.amount_to_be_paid || 0) + calculateTotalPenalties(payment);
  };

  const calculateTotalPaid = (payment) => {
    const basePaid = parseFloat(payment.paid_amount || 0);
    const penaltiesPaid = (payment.penalties || []).filter(p => p.is_paid)
      .reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
    return basePaid + penaltiesPaid;
  };

  const calculateOverdueInfo = (payment) => {
    const penalties = payment.penalties || [];
    if (penalties.length > 0) {
      const lastPenalty = penalties[penalties.length - 1];
      const lastDaysOverdue = lastPenalty.not_paid_days || 0;
      const penaltyPercentage = Math.min(lastDaysOverdue, 31);
      return { daysOverdue: lastDaysOverdue, penaltyPercentage };
    }
    return { daysOverdue: 0, penaltyPercentage: 0 };
  };

  // ---------- UNARCHIVE HANDLERS ----------
  const handleOpenUnarchiveModal = (policy, payments) => {
    setSelectedPolicyForUnarchive({ policy, payments });
    setUnarchiveModalOpen(true);
  };

  const handleUnarchiveConfirm = async () => {
    if (!selectedPolicyForUnarchive) return;
    try {
      const { policy, payments } = selectedPolicyForUnarchive;
      const policyId = policy.id;
      
      // Get payments from lazy-loaded store
      const paymentsToUnarchive = payments || paymentsByPolicy[policyId] || [];
      
      if (paymentsToUnarchive.length === 0) {
        alert("No payments to unarchive.");
        return;
      }
      
      for (const p of paymentsToUnarchive) {
        await unArchivePayment(p.id);
      }
      
      // Clear from lazy-loaded cache
      setPaymentsByPolicy(prev => {
        const updated = { ...prev };
        delete updated[policyId];
        return updated;
      });
      
      // Reload policies
      await loadPolicies();
      setUnarchiveModalOpen(false);
      setSelectedPolicyForUnarchive(null);
    } catch (err) {
      console.error("Error un-archiving payments:", err);
      alert("Failed to un-archive payments.");
    }
  };

  // ---------- DELETE HANDLERS ----------
  const handleOpenDeleteModal = (policy, payments) => {
    setSelectedPolicyForDelete({ policy, payments });
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPolicyForDelete) return;
    try {
      const { policy, payments } = selectedPolicyForDelete;
      const policyId = policy.id;
      
      // Get payments from lazy-loaded store
      const paymentsToDelete = payments || paymentsByPolicy[policyId] || [];
      
      if (paymentsToDelete.length === 0) {
        alert("No payments to delete.");
        return;
      }
      
      for (const p of paymentsToDelete) {
        await deletePayment(p.id);
      }
      
      // Clear from lazy-loaded cache
      setPaymentsByPolicy(prev => {
        const updated = { ...prev };
        delete updated[policyId];
        return updated;
      });
      
      // Reload policies
      await loadPolicies();
      setDeleteModalOpen(false);
      setSelectedPolicyForDelete(null);
    } catch (err) {
      console.error("Error deleting payments:", err);
      alert("Failed to delete payments.");
    }
  };

  // ---------- PAYMENT STATUS ----------
  const getPaymentStatus = (payment) => {
    if (payment.payment_status === "cancelled" || payment.payment_status === "voided") return "cancelled";
    if (payment.is_refunded) return "refunded";
    const paid = parseFloat(payment.paid_amount || 0);
    const due = parseFloat(payment.amount_to_be_paid || 0);
    if (paid <= 0) return "not-paid";
    if (paid < due) return "partially-paid";
    return "fully-paid";
  };

  // ---------- FILTERING & PAGINATION ----------
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
      const matchesSearch = policyId.includes(search) || clientName.includes(search);
      
      // Agent filter
      const agentAccounts = client?.employee_Accounts;
      let agentName = "";
      if (Array.isArray(agentAccounts) && agentAccounts.length > 0) {
        const agent = agentAccounts[0];
        agentName = `${agent.first_name || ""} ${agent.last_name || ""}`.trim();
      } else if (agentAccounts && !Array.isArray(agentAccounts)) {
        agentName = `${agentAccounts.first_name || ""} ${agentAccounts.last_name || ""}`.trim();
      }
      const matchesAgent = !selectedAgent || agentName === selectedAgent;
      
      // Partner filter
      const insurancePartners = policy.insurance_Partners;
      let partnerName = "";
      if (Array.isArray(insurancePartners) && insurancePartners.length > 0) {
        partnerName = insurancePartners[0].insurance_Name || "";
      } else if (insurancePartners && !Array.isArray(insurancePartners)) {
        partnerName = insurancePartners.insurance_Name || "";
      }
      const matchesPartner = !selectedPartner || partnerName === selectedPartner;
      
      return matchesSearch && matchesAgent && matchesPartner;
    });
  }, [policies, searchTerm, selectedAgent, selectedPartner]);

  const totalPoliciesCount = filteredPolicies.length;
  const totalPages = Math.ceil(totalPoliciesCount / rowsPerPage);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirst, indexOfLast);

  // ---------- INFINITE SCROLL (DISABLED - using pagination instead) ----------
  // Not needed for archive table since we have pagination

  return {
    // --- Core data (matching PolicyWithPaymentsController structure) ---
    policies,
    paymentsByPolicy,
    loadingPayments,
    sentinelRef,

    // --- Pagination & filtering ---
    totalPoliciesCount,
    rowsPerPage,
    setRowsPerPage,
    currentPage,
    setCurrentPage,
    totalPages,
    filteredPolicies,
    currentPolicies,
    searchTerm,
    setSearchTerm,
    selectedAgent,
    setSelectedAgent,
    selectedPartner,
    setSelectedPartner,
    uniqueAgents,
    uniquePartners,
    

    // --- Expand / collapse ---
    expanded,
    setExpanded,
    expandedPolicy,
    setExpandedPolicy,
    handleExpand,
    toggleExpand,

    // --- Modals ---
    unarchiveModalOpen,
    setUnarchiveModalOpen,
    selectedPolicyForUnarchive,
    setSelectedPolicyForUnarchive,
    deleteModalOpen,
    setDeleteModalOpen,
    selectedPolicyForDelete,
    setSelectedPolicyForDelete,

    // --- Handlers ---
    loadPolicies,
    handleOpenUnarchiveModal,
    handleUnarchiveConfirm,
    handleOpenDeleteModal,
    handleDeleteConfirm,

    // --- Helpers ---
    calculateTotalPenalties,
    calculateTotalDue,
    calculateTotalPaid,
    calculateOverdueInfo,
    getPaymentStatus,

    // --- UI state ---
    isLoading,
    setIsLoading,

    // --- For consistency with PolicyWithPaymentsController ---
    renderPoliciesList: currentPolicies,
  };
}