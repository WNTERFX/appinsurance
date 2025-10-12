import { useEffect, useState} from "react";
import {
  fetchModeratorArchivedPolicies,
  unarchiveModeratorPolicy,
  deleteModeratorPolicy,
} from "../ModeratorActions/ModeratorPolicyArchiveActions";
import ClientInfo from "../../AdminApp/ClientInfo";
import "../moderator-styles/policy-archive-table-moderator.css";

export default function ModeratorPolicyArchiveTable({ agentId }) {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadPolicies = async () => {
    if (!agentId) return;
    try {
      const data = await fetchModeratorArchivedPolicies(agentId);
      setPolicies(data);
    } catch (error) {
      console.error("Error loading archived policies:", error);
      setPolicies([]);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [agentId]);

  const handleUnarchive = async (policyId) => {
    if (!window.confirm("Unarchive this policy?")) return;
    await unarchiveModeratorPolicy(policyId);
    await loadPolicies();
  };

  const handleDelete = async (policyId) => {
    if (!window.confirm("This will permanently delete the policy. Continue?")) return;
    await deleteModeratorPolicy(policyId);
    await loadPolicies();
  };

  const filteredPolicies = policies.filter((policy) => {
    const client = policy.clients_Table;
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
          .toLowerCase()
      : "";

    const lowerCaseSearchQuery = searchQuery.toLowerCase();

    return (
      clientName.includes(lowerCaseSearchQuery) ||
      // Search by the database primary key 'id' (usually numeric, but this handles it as string)
      policy.id.toString().includes(lowerCaseSearchQuery) ||
      // **ADD THIS LINE:** Search by the displayed 'internal_id' which can contain letters
      (policy.internal_id && policy.internal_id.toLowerCase().includes(lowerCaseSearchQuery))
    );
  });

  return (
    <div className="policy-archive-table-container-moderator">
      <div className="policy-archive-table-header-moderator">
        <h2>Archived Policies{" "}
          <span>({filteredPolicies.length})</span>{" "}
        </h2>
        <div className="policy-archive-header-controls-moderator">
          <input
            type="text"
            placeholder="Search policies..."
            className="policy-archive-search-input-moderator"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button className="reset-btn-policy-archive-moderator" onClick={loadPolicies}>
            Refresh
          </button>
        </div>
      </div>

      <div className="policy-archive-table-wrapper-moderator">
        <div className="policy-archive-table-scroll-moderator">
          <table>
            <thead>
              <tr>
                <th>Policy ID</th> {/* This is your internal_id */}
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
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => {
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
                      className="policy-archive-table-clickable-row-moderator"
                      onClick={() =>
                        setSelectedPolicy({
                          policyId: policy.id,
                          clientId: policy.client_id,
                        })
                      }
                    >
                      <td>{policy.internal_id}</td> {/* Displaying internal_id */}
                      <td>{policy.policy_type}</td>
                      <td>{clientName}</td>
                      <td>{partner?.insurance_Name || "N/A"}</td>
                      <td>{policy.policy_inception || "N/A"}</td>
                      <td>{policy.policy_expiry || "N/A"}</td>
                      <td>
                        <span
                          className={
                            policy.policy_is_active
                              ? "policy-archive-status-active-moderator"
                              : "policy-archive-status-inactive-moderator"
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
                      <td className="policy-archive-header-controls-moderator">
                        <button onClick={(e) => { e.stopPropagation(); handleUnarchive(policy.id); }}>
                          Unarchive
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(policy.id); }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9">No archived policies found</td>
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