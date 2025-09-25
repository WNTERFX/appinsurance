import { useEffect, useState } from "react";
import { db } from "../../dbServer";
import { fetchModeratorPolicies ,archivePolicy  } from "../ModeratorActions/ModeratorPolicyActions";
import ClientInfo from "../../AdminApp/ClientInfo";
import { useNavigate } from "react-router-dom";
import "../moderator-styles/policy-table-styles-moderator.css";

export default function PolicyTableModerator() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // ✅ Load policies (always respect current moderator)
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

  // ✅ Run once on mount
  useEffect(() => {
    loadPolicies();
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

  // 🔹 Filtering by Policy ID
  const filteredPolicies = policies.filter((policy) =>
    policy.id.toString().includes(searchTerm.trim())
  );

  // 🔹 Pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPolicies.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleReset = async () => {
    setSearchTerm("");
    setCurrentPage(1);
    await loadPolicies(); // ✅ proper reload
  };

  return (
    <div className="policy-table-container-moderator">
      <div className="policy-table-header-moderator">
        <h2>Current Policies</h2>

        <div className="policy-header-controls">
          <input
            type="text"
            placeholder="Search by Policy ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="policy-search-input-moderator"
          />

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

          {/* 🔹 Refresh button */}
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
                  const partner = policy.insurance_Partners;
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

      {/* 🔹 Pagination Controls */}
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
