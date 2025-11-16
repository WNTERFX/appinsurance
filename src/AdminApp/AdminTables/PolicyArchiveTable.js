import { useEffect, useState } from "react";
import ClientInfo from "../ClientInfo";
import CustomConfirmModal from "../AdminForms/CustomConfirmModal";
import "../styles/policy-archive-table.css"; 

import { fetchPolicies, unArchivePolicy, deletePolicy } from "../AdminActions/PolicyArchiveActions";

export default function PolicyArchiveTable() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    title: "Confirm",
    onConfirm: null
  });

  useEffect(() => {
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

  const handleUnArchive = (policyId) => {
    setConfirmModal({
      isOpen: true,
      message: "Un-archive this policy?",
      title: "Un-Archive Policy",
      onConfirm: async () => {
        try {
          await unArchivePolicy(policyId);
          setPolicies((prev) => prev.filter((p) => p.id !== policyId));
        } catch (err) {
          console.error("Error un-archiving policy:", err.message);
        }
      }
    });
  };

  const handleDelete = (policyId) => {
    setConfirmModal({
      isOpen: true,
      message: "This will permanently delete the policy, this should only be done when needed. Continue?",
      title: "Delete Policy",
      onConfirm: async () => {
        try {
          await deletePolicy(policyId);
          setPolicies((prev) => prev.filter((p) => p.id !== policyId));
        } catch (err) {
          console.error("Error deleting policy:", err.message);
        }
      }
    });
  };

  // Close confirm modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      message: "",
      title: "Confirm",
      onConfirm: null
    });
  };

  return (
    <div className="policy-archive-table-container">
      {/* Header with title + controls */}
      <div className="policy-archive-table-header">
        <h2>Archived Policies</h2>
        <div className="policy-archive-header-controls">
          <input
            type="text"
            placeholder="Search policies..."
            className="policy-archive-search-input"
          />
          <button
            className="reset-btn-policy"
            onClick={loadPolicies}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="policy-archive-table-wrapper">
        <div className="policy-archive-table-scroll">
          <table>
            <thead>
              <tr>
                <th className="policy-id-column">Policy ID</th>
                <th>Policy Type</th>
                <th>Client Name</th>
                <th>Insurer</th>
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
                      className="policy-archive-table-clickable-row"
                      onClick={() => handleRowClick(policy)}
                    >
                      <td className="policy-id-column">{policy.internal_id}</td>
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
                      <td className="premium-cell-policy">
                        {computation
                          ? new Intl.NumberFormat("en-PH", {
                              style: "currency",
                              currency: "PHP",
                            }).format(computation.total_Premium)
                          : "No Computation"}
                      </td>
                      <td className="policy-table-actions">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnArchive(policy.id);
                          }}
                        >
                          Un-Archive
                        </button>
                       {/* <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(policy.id);
                          }}
                        >
                          Delete
                        </button>*/}
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

      {/* Client Info Modal */}
      <ClientInfo
        selectedPolicy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />

      {/* Confirm Modal */}
      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        title={confirmModal.title}
      />
    </div>
  );
}