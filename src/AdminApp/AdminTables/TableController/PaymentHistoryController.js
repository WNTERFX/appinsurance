import { useEffect, useState, useRef, useMemo } from "react";
import { fetchPaymentHistory, getPaymentHistoryStats } from "../../AdminActions/PaymentHistoryActions";
import { fetchPenaltiesForPayments } from "../../AdminActions/PaymentPenaltyActions";

/**
 * PaymentHistoryController
 * - Loads policy headers with paid payments
 * - Lazy-loads payment details on expand
 * - Supports date filtering
 */
export default function PaymentHistoryController() {
  // --- Core data state ---
  const [policies, setPolicies] = useState([]);
  const [paymentsByPolicy, setPaymentsByPolicy] = useState({});
  const [loadingPayments, setLoadingPayments] = useState({});
  const [stats, setStats] = useState(null);
  
  // --- UI state ---
  const [expanded, setExpanded] = useState({});
  const [expandedPolicy, setExpandedPolicy] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- Search & Pagination ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // --- Filtering ---
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState(null);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  // --- Infinite scroll ---
  const sentinelRef = useRef(null);

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    loadPolicies();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const uniqueAgents = useMemo(() => {
    const agents = policies
      .map(policy => {
        const client = policy.clients_Table;
        if (!client?.employee_Accounts) return null;
        
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

  const uniquePaymentTypes = useMemo(() => {
    const types = new Set();
    Object.values(paymentsByPolicy).forEach(payments => {
      payments.forEach(payment => {
        if (payment.payment_type_name) {
          types.add(payment.payment_type_name);
        }
      });
    });
    return [...types].sort();
  }, [paymentsByPolicy]);

  /**
   * Load policy headers from paid payments
   */
  const loadPolicies = async () => {
    try {
      setIsLoading(true);
      setPolicies([]);

      const data = await fetchPaymentHistory(dateFrom, dateTo);
      
      // Group by policy
      const policiesMap = {};
      data.forEach(payment => {
        const policy = payment.policy_Table;
        if (policy && !policiesMap[policy.id]) {
          policiesMap[policy.id] = policy;
        }
      });

      const uniquePolicies = Object.values(policiesMap);
      setPolicies(uniquePolicies);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error loading payment history:", err);
      setPolicies([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load payment statistics
   */
  const loadStats = async () => {
    try {
      const statsData = await getPaymentHistoryStats(dateFrom, dateTo);
      setStats(statsData);
    } catch (err) {
      console.error("Error loading stats:", err);
      setStats(null);
    }
  };

  /**
   * Handle expanding a policy: lazy-load payments
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
        const allData = await fetchPaymentHistory(dateFrom, dateTo);
        const policyPayments = allData.filter(p => p.policy_Table?.id === policyId);
        
        if (policyPayments.length > 0) {
          const paymentIds = policyPayments.map(p => p.id);
          const penaltiesMap = await fetchPenaltiesForPayments(paymentIds);
          
          const paymentsWithPenalties = policyPayments.map(p => ({
            ...p,
            penalties: penaltiesMap[p.id] || []
          })).sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

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
      
      // Search filter
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

  return {
    // --- Core data ---
    policies,
    paymentsByPolicy,
    loadingPayments,
    sentinelRef,
    stats,

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
    selectedPaymentType,
    setSelectedPaymentType,
    uniqueAgents,
    uniquePartners,
    uniquePaymentTypes,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,

    // --- Expand / collapse ---
    expanded,
    setExpanded,
    expandedPolicy,
    setExpandedPolicy,
    handleExpand,
    toggleExpand,

    // --- Handlers ---
    loadPolicies,
    loadStats,

    // --- Helpers ---
    calculateTotalPenalties,
    calculateTotalDue,
    calculateTotalPaid,
    getPaymentStatus,

    // --- UI state ---
    isLoading,
    setIsLoading,

    // --- For consistency ---
    renderPoliciesList: currentPolicies,
  };
}