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
    console.log("Clicked policy id:", policy.id);
    console.log("Client ID for this policy:", policy.client_id);
    console.log("Full policy object:", policy);
    setSelectedPolicy({
      policyId: policy.id,
      clientId: policy.client_id
    });
  };

  return (
    <>
      <div className="policy-table">
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
                    className="clickable-row"
                    onClick={() => handleRowClick(policy)}
                  >
                    <td>{policy.id}</td>
                    <td>{policy.policy_type}</td>
                    <td>{clientName}</td>
                    <td>{partner?.insurance_Name || "No Partner"}</td>
                    <td>{policy.policy_inception || "N/A"}</td>
                    <td>{policy.policy_expirty || "N/A"}</td>
                    <td>
                      <span
                        className={policy.policy_is_active ? "status-active" : "status-inactive"}
                        style={{
                          padding: "0.25rem 0.5rem",
                          borderRadius: "4px",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: policy.policy_is_active ? "#065f46" : "#991b1b",
                          backgroundColor: policy.policy_is_active ? "#d1fae5" : "#fee2e2",
                        }}
                      >
                        {policy.policy_is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      {computation
                        ? `Original: ${computation.original_Value}, Current: ${computation.current_Value}, Total Premium: ${computation.total_Premium}`
                        : "No Computation"}
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
      <ClientInfo
        selectedPolicy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </>
  );
}