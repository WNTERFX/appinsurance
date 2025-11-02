import { useEffect, useState, useMemo } from "react";
import { db } from "../../dbServer";
import { fetchModeratorPolicies, archivePolicy, fetchPartners } from "../ModeratorActions/ModeratorPolicyActions"; // Assuming fetchPartners is in this file or a shared one.
import ClientInfo from "../../AdminApp/ClientInfo";
import { useNavigate } from "react-router-dom";
import "../moderator-styles/policy-table-styles-moderator.css";

export default function PolicyTableModerator() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  // ✨ NEW STATE FOR PARTNER FILTER
  const [partnerFilter, setPartnerFilter] = useState(""); // Stores selected partner ID
  const [partners, setPartners] = useState([]); // Stores the list of partners

  const loadPolicies = async () => {
    try {
      const { data: { user } } = await db.auth.getUser();
      if (!user) return;
      const data = await fetchModeratorPolicies(user.id);
      setPolicies(data || []);
    } catch (err) {
      console.error("Error loading policies:", err);
    }
  };

  // ✨ NEW FUNCTION TO LOAD PARTNERS
  const loadPartners = async () => {
    try {
      // Assuming fetchPartners is available in ModeratorActions or a common place.
      // If not, you might need to create it in ModeratorPolicyActions.js
      const data = await fetchPartners();
      setPartners(data);
    } catch (err) {
      console.error("Error loading partners:", err);
    }
  };

  useEffect(() => {
    loadPolicies();
    loadPartners(); // ✨ Load partners on mount
  }, []);

  const handleRowClick = (policy) => {
    setSelectedPolicy({
      policyId: policy.id,
      clientId: policy.client_id,
    });
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

    // ✨ 1. Apply Partner Filter
    if (partnerFilter) {
      tempPolicies = tempPolicies.filter((policy) => {
        const partnerArray = policy.insurance_Partners; // Assuming this is from a Supabase join
        const partnerIdFromJoin =
          Array.isArray(partnerArray) && partnerArray.length > 0
            ? partnerArray[0].id
            : null;

        const actualPartnerId = partnerIdFromJoin || policy.partner_id || null; // Fallback to direct FK
        return String(actualPartnerId) === String(partnerFilter);
      });
    }

    // 2. Apply Status Filter
    if (statusFilter === "Active") {
      tempPolicies = tempPolicies.filter((policy) => policy.policy_is_active);
    } else if (statusFilter === "Inactive") {
      tempPolicies = tempPolicies.filter((policy) => !policy.policy_is_active);
    }

    // 3. Apply Search Term Filter
    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
      tempPolicies = tempPolicies.filter((policy) => {
        const policyInternalIdMatch = (policy.internal_id || "")
          .toString()
          .toLowerCase()
          .includes(lowerCaseSearchTerm);

        const client = policy.clients_Table;
        const clientName = client
          ? [client.first_Name, client.middle_Name, client.family_Name]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
          : "";
        const clientNameMatch = clientName.includes(lowerCaseSearchTerm);

        return policyInternalIdMatch || clientNameMatch;
      });
    }

    return tempPolicies;
  }, [policies, searchTerm, statusFilter, partnerFilter]); // ✨ Add partnerFilter to dependencies

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPolicies = filteredAndSearchedPolicies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAndSearchedPolicies.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleReset = async () => {
    setSearchTerm("");
    setStatusFilter("All");
    setPartnerFilter(""); // ✨ Reset partner filter
    setCurrentPage(1);
    await loadPolicies();
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="policy-table-container-moderator">
      <div className="policy-table-header-moderator">
        <h2>
          Current Policies{" "}
          <span>({filteredAndSearchedPolicies.length})</span>{" "}
        </h2>

        <div className="policy-header-controls-moderator">
          <input
            type="text"
            placeholder="Search by Policy ID or Client Name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
            className="policy-search-input-moderator"
          />

          {/* Status Filter Dropdown */}
          <div className="policy-status-filter-dropdown-moderator">
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

          {/* ✨ NEW PARTNER FILTER DROPDOWN */}
          <div className="policy-partner-filter-dropdown-moderator">
            <label htmlFor="partnerFilter">Partner:</label>
            <select
              id="partnerFilter"
              value={partnerFilter}
              onChange={(e) => {
                setPartnerFilter(e.target.value);
                setCurrentPage(1); // Reset page on filter change
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

          <div className="rows-per-page-inline-moderator">
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

          <button onClick={handleReset} className="reset-btn-policy-moderator">
            Refresh
          </button>
        </div>
      </div>

      <div className="policy-table-wrapper-moderator">
        <div className="policy-table-scroll-moderator">
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
                <th>Computation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentPolicies.length > 0 ? (
                currentPolicies.map((policy) => {
                  const client = policy.clients_Table;
                  // Assuming policy.insurance_Partners is an array or object from a join
                  // and has a 'name' property or similar.
                  // Adjust access based on your actual data structure.
                  const partner = Array.isArray(policy.insurance_Partners)
                    ? policy.insurance_Partners[0]
                    : policy.insurance_Partners; // Handle if it's a direct object or single item array
                  const computation = policy.policy_Computation_Table?.[0];

                  const clientName = client
                    ? [
                        client.prefix,
                        client.first_Name,
                        client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
                        client.family_Name,
                        client.suffix,
                      ]
                        .filter(Boolean)
                        .join(" ")
                    : "Unknown Client";

                  return (
                    <tr
                      key={policy.id}
                      className="policy-table-clickable-row-moderator"
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
                              ? "policy-status-active-moderator"
                              : "policy-status-inactive-moderator"
                          }
                        >
                          {policy.policy_is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {computation
                          ? new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(computation.total_Premium)
                          : "No Computation"}
                      </td>
                      <td className="policy-table-actions-moderator">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/appinsurance/MainAreaModerator/PolicyModerator/Edit/${policy.id}`);
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
      </div>

      {totalPages > 1 && (
        <div className="pagination-controls-moderator">
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

      <ClientInfo
        selectedPolicy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  );
}