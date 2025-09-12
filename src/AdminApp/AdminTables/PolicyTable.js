import { useEffect, useState } from "react";
import ClientInfo from "../ClientInfo";
import "../styles/policy-table-styles.css";
import { fetchPolicies } from "../AdminActions/PolicyActions";

export default function PolicyTable() {
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

  const handleRowClick = (policy) => {
    setSelectedPolicy({
      policyId: policy.id,
      clientId: policy.client_id,
    });
  };

  return (
    <div className="policy-table-container">
      <h2>Current Policies</h2>
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
                      <td>{policy.id}</td>
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
                      <td>
                        {computation
                          ? `Total Premium: ${computation.total_Premium}`
                          : "No Computation"}
                      </td>

                      <td className="policy-table-actions">
                        <button>Edit</button>
                        <button>Archive</button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8">No policies found</td>
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
