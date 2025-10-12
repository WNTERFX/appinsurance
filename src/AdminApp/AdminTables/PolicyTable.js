import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ClientInfo from "../ClientInfo";
import "../styles/policy-table-styles.css";
import {
  fetchPolicies,
  archivePolicy,
  activatePolicy,
  fetchPartners
} from "../AdminActions/PolicyActions";

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

  const handleActivateClick = async (policy) => {
    const confirmActivate = window.confirm("Activate this policy?");
    if (!confirmActivate) return;

    try {
      const result = await activatePolicy(policy, 1);
      if (result.success) {
        setPolicies((prev) =>
          prev.map((p) =>
            p.id === policy.id ? { ...p, policy_is_active: true } : p
          )
        );
        alert("Policy activated and payment schedule created.");
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Activation failed:", err);
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

      // 🔹 Partner filter
      if (partnerFilter) { // empty string means All, so skip
        tempPolicies = tempPolicies.filter((policy) => {
          // insurance_Partners is an array from Supabase joins
          const partnerArray = policy.insurance_Partners;
          const partnerIdFromJoin =
            Array.isArray(partnerArray) && partnerArray.length > 0
              ? partnerArray[0].id
              : null;

          // fallback to direct FK column
          const partnerId = partnerIdFromJoin || policy.partner_id || null;

          return String(partnerId) === String(partnerFilter);
        });
      }

      // 🔹 Status filter
      if (statusFilter === "Active") {
        tempPolicies = tempPolicies.filter((policy) => policy.policy_is_active);
      } else if (statusFilter === "Inactive") {
        tempPolicies = tempPolicies.filter((policy) => !policy.policy_is_active);
      }

      // 🔹 Search filter
      if (searchTerm.trim()) {
        const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
        tempPolicies = tempPolicies.filter((policy) => {
          const policyIdMatch = policy.id.toString().includes(lowerCaseSearchTerm);

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

          return policyIdMatch || clientNameMatch;
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
          <span /* Removed className="policy-count" */>({filteredAndSearchedPolicies.length})</span>{" "}
        </h2>

        {/* This div holds ALL right-aligned controls */}
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

          {/* Status Filter Dropdown */}
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

        {/* 🔹 Pagination Controls */}
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