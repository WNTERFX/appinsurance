import { useEffect, useState } from "react";
import { fetchPolicies } from "../AdminActions/PolicyActions";
import ClientInfo from "../ClientInfo";
import "../styles/policy-table-styles.css";

export default function PolicyTable() {
  const [policies, setPolicies] = useState([]);
  const [selectedClientID, setSelectedClientID] = useState(null);

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
    setSelectedClientID(policy.client_id);
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
            </tr>
          </thead>
          <tbody>
            {policies.length > 0 ? (
              policies.map((policy) => (
                <tr
                  key={policy.id}
                  className="clickable-row"
                  onClick={() => handleRowClick(policy)}
                >
                  <td>{policy.id}</td>
                  <td>{policy.policy_type}</td>
                  <td>
                    {policy.clients_Table ? 
                      [
                        policy.clients_Table.prefix,
                        policy.clients_Table.first_Name,
                        policy.clients_Table.middle_Name ? policy.clients_Table.middle_Name.charAt(0) + "." : "",
                        policy.clients_Table.family_Name,
                        policy.clients_Table.suffix,
                      ]
                        .filter(Boolean)
                        .join(" ") 
                      : "Unknown Client"
                    }
                  </td>
                  <td>{policy.insurance_Partners?.insurance_Name || "No Partner"}</td>
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
                        backgroundColor: policy.policy_is_active ? "#d1fae5" : "#fee2e2"
                      }}
                    >
                      {policy.policy_is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">No policies found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ClientInfo
        clientID={selectedClientID}
        onClose={() => setSelectedClientID(null)}
      />
    </>
  );
}