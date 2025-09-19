import { useEffect, useState } from "react";
import { db } from "../../dbServer";
import { fetchModeratorPolicies } from "../ModeratorActions/ModeratorPolicyActions";
import ClientInfo from "../../AdminApp/ClientInfo";
import "../moderator-styles/policy-table-styles-moderator.css";

export default function PolicyTableModerator() {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
  const loadPolicies = async () => {
      //  Get the currently logged-in moderator
      const { data: { user } } = await db.auth.getUser();
      if (!user) return;

      //  Fetch policies where the linked client belongs to this moderator
      const data = await fetchModeratorPolicies(user.id);
      setPolicies(data);
    };

    loadPolicies();
  }, []);

  const handleRowClick = (policy) => {
    setSelectedPolicy({
      policyId: policy.id,
      clientId: policy.client_id,
    });
  };

  return (
    <div className="policy-table-container-moderator">
      <h2>Current Policies</h2>
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
                      className="policy-table-clickable-row-moderator"
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
                              ? "policy-status-active-moderator"
                              : "policy-status-inactive-moderator"
                          }
                        >
                          {policy.policy_is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {computation
                          ? `${computation.total_Premium}`
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
      </div>

      <ClientInfo
        selectedPolicy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  );
}
