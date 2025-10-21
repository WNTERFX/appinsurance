import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ClientInfo from "../ClientInfo";
import "../styles/policy-table-styles.css";
import {
  fetchPolicies,
  archivePolicy,
  fetchPartners
} from "../AdminActions/PolicyActions";
import { ActivatePolicyAndPayment } from "../AdminActions/PolicyActivationActions";

export default function PolicyTable() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [partnerFilter, setPartnerFilter] = useState("");
  const [partners, setPartners] = useState([]);
  const navigate = useNavigate();

  const loadPolicies = async () => {
    try {
      const data = await fetchPolicies();
      setPolicies(data);
    } catch (error) {
      console.error("Error loading policies:", error);
      setPolicies([]);
    }
  };

  const loadPartners = async () => {
    try {
      const data = await fetchPartners();
      setPartners(data);
    } catch (err) {
      console.error("Error loading partners:", err);
    }
  };

  useEffect(() => {
    loadPolicies();
    loadPartners();
  }, []);

  const handleRowClick = (policy) => {
    setSelectedPolicy({
      policyId: policy.id,
      clientId: policy.client_id,
    });
  };

  // Fetch payment type for a policy
  const fetchPolicyPaymentType = async (policyId) => {
    try {
      const { db } = await import("../../dbServer");
      
      // Get the payment_type_id from policy_Computation_Table
      const { data: computation, error: compError } = await db
        .from("policy_Computation_Table")
        .select("payment_type_id")
        .eq("policy_id", policyId)
        .single();
      
      if (compError || !computation?.payment_type_id) {
        console.error("No payment type found in computation");
        return null;
      }

      // Get the payment type details
      const { data: paymentType, error: ptError } = await db
        .from("payment_type")
        .select("*")
        .eq("id", computation.payment_type_id)
        .single();
      
      if (ptError) throw ptError;
      return paymentType;
    } catch (error) {
      console.error("Error fetching payment type:", error);
      return null;
    }
  };

  const handleActivateClick = async (policy) => {
    const confirmActivate = window.confirm(
      "Activate this policy and generate payment schedule?"
    );
    if (!confirmActivate) return;

    try {
      // Get computation for total premium
      const computation = policy.policy_Computation_Table?.[0];
      if (!computation || !computation.total_Premium) {
        alert("No computation found for this policy");
        return;
      }

      // Get payment type that was selected during policy creation
      const paymentType = await fetchPolicyPaymentType(policy.id);
      if (!paymentType) {
        alert("No payment type found for this policy. Please edit the policy and select a payment type.");
        return;
      }

      const totalPremium = computation.total_Premium;
      const months = paymentType.months_payment;
      const paymentTypeId = paymentType.id;

      console.log("=== ACTIVATING POLICY ===");
      console.log("Policy ID:", policy.id);
      console.log("Payment Type:", paymentType.payment_type_name);
      console.log("Months:", months);
      console.log("Total Premium:", totalPremium);

      // Activate and create payment schedule
      const result = await ActivatePolicyAndPayment(
        policy.id,
        paymentTypeId,
        totalPremium,
        months
      );

      if (result.success) {
        setPolicies((prev) =>
          prev.map((p) =>
            p.id === policy.id ? { ...p, policy_is_active: true } : p
          )
        );
        alert(
          `Policy activated successfully!\n` +
          `Payment Plan: ${paymentType.payment_type_name} (${months} months)\n` +
          `Monthly Payment: ₱${(totalPremium / months).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
        );
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Activation failed:", err);
      alert("Error activating policy: " + err.message);
    }
  };

  const handleArchiveClick = async (policyId) => {
    const confirmArchive = window.confirm("Proceed to archive this policy?");
    if (!confirmArchive) return;

    try {
      await archivePolicy(policyId);
      setPolicies((prev) => prev.filter((p) => p.id !== policyId));
    } catch (error) {
      console.error("Error archiving policy:", error);
    }
  };

  const filteredAndSearchedPolicies = useMemo(() => {
    let tempPolicies = policies;

    // Partner filter
    if (partnerFilter) {
      tempPolicies = tempPolicies.filter((policy) => {
        const partnerArray = policy.insurance_Partners;
        const partnerIdFromJoin =
          Array.isArray(partnerArray) && partnerArray.length > 0
            ? partnerArray[0].id
            : null;

        const partnerId = partnerIdFromJoin || policy.partner_id || null;
        return String(partnerId) === String(partnerFilter);
      });
    }

    // Status filter
    if (statusFilter === "Active") {
      tempPolicies = tempPolicies.filter((policy) => policy.policy_is_active);
    } else if (statusFilter === "Inactive") {
      tempPolicies = tempPolicies.filter((policy) => !policy.policy_is_active);
    }

    // Search filter
    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
      tempPolicies = tempPolicies.filter((policy) => {
        const policyMainIdMatch = policy.id.toString().toLowerCase().includes(lowerCaseSearchTerm);
        const policyInternalIdMatch = policy.internal_id?.toString().toLowerCase().includes(lowerCaseSearchTerm);

        const client = policy.clients_Table;
        const clientName = client
          ? [
              client.first_Name,
              client.middle_Name,
              client.family_Name,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
          : "";

        const clientNameMatch = clientName.includes(lowerCaseSearchTerm);
        return policyMainIdMatch || policyInternalIdMatch || clientNameMatch;
      });
    }

    return tempPolicies;
  }, [policies, searchTerm, statusFilter, partnerFilter]);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPolicies = filteredAndSearchedPolicies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAndSearchedPolicies.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="policy-table-container">
      <div className="policy-table-header">
        <h2>
          Current Policies{" "}
          <span>({filteredAndSearchedPolicies.length})</span>
        </h2>

        <div className="policy-controls-right-group">
          <input
            type="text"
            placeholder="Search by Policy ID or Client Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="policy-search-input"
          />

          <div className="policy-status-filter-dropdown">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="policy-partner-filter-dropdown">
            <label htmlFor="partnerFilter">Partner:</label>
            <select
              id="partnerFilter"
              value={partnerFilter}
              onChange={(e) => {
                setPartnerFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Partners</option>
              {partners.map(partner => (
                <option key={partner.id} value={partner.id}>
                  {partner.insurance_Name}
                </option>
              ))}
            </select>
          </div>

          <div className="rows-per-page-inline">
            <label htmlFor="rowsPerPage">Results:</label>
            <select
              id="rowsPerPage"
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <button onClick={loadPolicies} className="reset-btn-policy">
            Refresh
          </button>
        </div>
      </div>

      <div className="policy-table-wrapper">
        <div className="policy-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Policy ID</th>
                <th>Policy Type</th>
                <th>Client Name</th>
                <th>Insurance Partner</th>
                <th>Inception Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Premium</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPolicies.length > 0 ? (
                currentPolicies.map((policy) => {
                  const client = policy.clients_Table;
                  const partner = policy.insurance_Partners;
                  const computation = policy.policy_Computation_Table?.[0];
                  const clientName = client
                    ? [
                        client.prefix,
                        client.first_Name,
                        client.middle_Name
                          ? client.middle_Name.charAt(0) + "."
                          : "",
                        client.family_Name,
                        client.suffix,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : "Unknown Client";

                  return (
                    <tr
                      key={policy.id}
                      className="policy-table-clickable-row"
                      onClick={() => handleRowClick(policy)}
                    >
                      <td>{policy.internal_id}</td>
                      <td>{policy.policy_type}</td>
                      <td>{clientName}</td>
                      <td>{partner?.insurance_Name || "No Partner"}</td>
                      <td>{policy.policy_inception || "N/A"}</td>
                      <td>{policy.policy_expiry || "N/A"}</td>
                      <td>
                        <span
                          className={
                            policy.policy_is_active
                              ? "policy-status-active"
                              : "policy-status-inactive"
                          }
                        >
                          {policy.policy_is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="premium-cell">
                        {computation
                          ? new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(computation.total_Premium)
                          : "No Computation"}
                      </td>
                      <td className="policy-table-actions">
                        <button
                          disabled={policy.policy_is_active}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActivateClick(policy);
                          }}
                        >
                          Activate
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/appinsurance/main-app/policy/Edit/${policy.id}`
                            );
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveClick(policy.id);
                          }}
                        >
                          Archive
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">No policies found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ClientInfo
        selectedPolicy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  );
}