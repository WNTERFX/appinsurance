import { useEffect, useState } from "react";
import ClientInfo from "../ClientInfo";
import "../styles/policy-archive-table.css"; 

import { fetchPolicies, unArchivePolicy, deletePolicy } from "../AdminActions/PolicyArchiveActions";

export default function PolicyArchiveTable() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    async function loadPolicies() {
      try {
        const data = await fetchPolicies();
        setPolicies(data);
      } catch (error) {
        console.error("Error loading policies:", error);
        setPolicies([]);
      }
    }
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await fetchPolicies();
      setPolicies(data);
    } catch (error) {
      console.error("Error loading policies:", error);
      setPolicies([]);
    }
  };

  const handleRowClick = (policy) => {
    setSelectedPolicy({
      policyId: policy.id,
      clientId: policy.client_id,
    });
  };

  const handleUnArchive = async (policyId) => {
    const confirmUnarchive = window.confirm("Un-archive this policy?");
    if (!confirmUnarchive) return;

    try {
      await unArchivePolicy(policyId);
      setPolicies((prev) => prev.filter((p) => p.id !== policyId)); // remove from archive view
    } catch (err) {
      console.error("Error un-archiving policy:", err.message);
    }
  };

  const handleDelete = async (policyId) => {
    const confirmDelete = window.confirm(
      "This will permanently delete the policy, this should only be done when needed. Continue?"
    );
    if (!confirmDelete) return;

    try {
      await deletePolicy(policyId);
      setPolicies((prev) => prev.filter((p) => p.id !== policyId)); // remove from UI
    } catch (err) {
      console.error("Error deleting policy:", err.message);
    }
  };

  return (
  <div className="archive-table-container">
    {/* Header with title + controls */}
    <div className="archive-table-header">
      <h2>Archived Policies</h2>
      <div className="archive-header-controls">
        {/* optional search bar */}
        <input
          type="text"
          placeholder="Search policies..."
          className="archive-search-input"
        />
        {/* refresh button */}
        <button
          className="reset-btn-archive"
          onClick={() => loadPolicies()} // <-- call your fetch again
        >
          Refresh
        </button>
      </div>
    </div>

    {/* Table */}
    <div className="archive-table-wrapper">
      <div className="archive-table-scroll">
        <table>
          <thead>
            <tr>
              <th className="archive-id-column">Policy ID</th>
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
            {policies.length > 0 ? (
              policies.map((policy) => {
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
                    className="archive-table-clickable-row"
                    onClick={() => handleRowClick(policy)}
                  >
                    <td className="archive-id-column">{policy.internal_id}</td>
                    <td>{policy.policy_type}</td>
                    <td>{clientName}</td>
                    <td>{partner?.insurance_Name || "No Partner"}</td>
                    <td>{policy.policy_inception || "N/A"}</td>
                    <td>{policy.policy_expiry || "N/A"}</td>
                    <td>
                      <span
                        className={
                          policy.policy_is_active
                            ? "archive-status-active"
                            : "archive-status-inactive"
                        }
                      >
                        {policy.policy_is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                     <td className="premium-cell-archive">
                        {computation
                          ? new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(computation.total_Premium)
                          : "No Computation"}
                      </td>
                    <td className="archive-table-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnArchive(policy.id);
                        }}
                      >
                        Un-Archive
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(policy.id);
                        }}
                      >
                        Delete
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

    <ClientInfo
      selectedPolicy={selectedPolicy}
      onClose={() => setSelectedPolicy(null)}
    />
  </div>
);

}
