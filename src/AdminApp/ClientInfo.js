import { useEffect, useState } from "react";
import InfoModal from "./InfoModal";
import { getClientInfo, getPolicyInfo, getVehicleInfo, getPolicyComputationInfo } from "./AdminActions/ModalActions";

export default function ClientInfo({ selectedPolicy, onClose }) {
  const [client, setClient] = useState(null);
  const [allPolicies, setAllPolicies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [computations, setComputations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Derived state - filter data for the selected policy
  const policy = allPolicies.find(p => p.id === selectedPolicy?.policyId) || null;
  const policyVehicles = vehicles.filter(v => v.policy_id === selectedPolicy?.policyId);
  const policyComputations = computations.filter(c => c.policy_id === selectedPolicy?.policyId);

  useEffect(() => {
    if (!selectedPolicy?.clientId) {
      resetState();
      return;
    }

    fetchClientData();
  }, [selectedPolicy?.clientId]);

  const resetState = () => {
    setClient(null);
    setAllPolicies([]);
    setVehicles([]);
    setComputations([]);
    setError(null);
  };

  const fetchClientData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch client info first
      const clientData = await getClientInfo(selectedPolicy.clientId);
      setClient(clientData || null);

      // Fetch all policies for the client
      const policyData = await getPolicyInfo(selectedPolicy.clientId);
      setAllPolicies(policyData || []);

      // Extract policy IDs for related data
      const policyIds = (policyData || []).map(p => p.id);

      // Fetch vehicles and computations for all policies (we'll filter later)
      if (policyIds.length > 0) {
        const [vehicleData, computationData] = await Promise.all([
          getVehicleInfo(policyIds),
          getPolicyComputationInfo(policyIds)
        ]);

        setVehicles(vehicleData || []);
        setComputations(computationData || []);
      } else {
        setVehicles([]);
        setComputations([]);
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err.message || 'Failed to load client information');
      resetState();
    } finally {
      setLoading(false);
    }
  };

  const formatClientName = (client) => {
    if (!client) return 'N/A';
    return [
      client.prefix,
      client.first_Name,
      client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
      client.family_Name,
      client.suffix,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const formatCurrency = (amount) => {
    return `₱${(amount || 0).toLocaleString()}`;
  };

  const InfoRow = ({ label, value, color }) => (
    <div style={{ display: "flex", justifyContent: "space-between", margin: "0.5rem 0" }}>
      <strong>{label}:</strong>
      <span style={color ? { color } : {}}>{value}</span>
    </div>
  );

  const Card = ({ children, style = {} }) => (
    <div style={{ 
      marginBottom: "1rem", 
      padding: "1.5rem", 
      border: "1px solid #e5e7eb", 
      borderRadius: "8px",
      backgroundColor: "#ffffff",
      ...style 
    }}>
      {children}
    </div>
  );

  return (
    <InfoModal isOpen={!!selectedPolicy} onClose={onClose} title="Policy Details">
      {loading && (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading policy information...</p>
        </div>
      )}
      
      {error && (
        <div style={{ 
          padding: "1rem", 
          marginBottom: "1rem",
          backgroundColor: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: "6px",
          color: "#dc2626"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {client && !loading && (
        <div style={{ display: "flex", gap: "2rem", minHeight: "500px" }}>
          {/* Left Column - Client Info and Policy */}
          <div style={{ flex: 1 }}>
            {/* Client Information */}
            <Card>
              <h3 style={{ margin: "0 0 1rem 0", color: "#1f2937", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
                Client Information
              </h3>
              <InfoRow label="Name" value={formatClientName(client)} />
              <InfoRow label="Agent" value={client.employee?.personnel_Name || 'N/A'} />
              <InfoRow label="Address" value={client.address || 'N/A'} />
              <InfoRow label="Email" value={client.email || 'N/A'} />
              <InfoRow label="Phone" value={client.phone_Number || 'N/A'} />
            </Card>

            {/* Selected Policy Information */}
            {policy && (
              <Card style={{ backgroundColor: "#f0f9ff", border: "2px solid #0ea5e9" }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#0c4a6e", borderBottom: "2px solid #0ea5e9", paddingBottom: "0.5rem" }}>
                  Selected Policy (ID: {policy.id})
                </h3>
                <InfoRow label="Type" value={policy.policy_type || 'N/A'} />
                <InfoRow label="Inception" value={policy.policy_inception || 'N/A'} />
                <InfoRow label="Expiry" value={policy.policy_expiry || 'N/A'} />
                <InfoRow 
                  label="Status" 
                  value={policy.policy_is_active ? "Active" : "Inactive"}
                  color={policy.policy_is_active ? '#22c55e' : '#ef4444'}
                />
                <InfoRow 
                  label="Insurance Partner" 
                  value={policy.insurance_Partners?.insurance_Name || 'N/A'} 
                />
                {policy.insurance_Partners?.insurance_Rate && (
                  <InfoRow 
                    label="Insurance Rate" 
                    value={`${policy.insurance_Partners.insurance_Rate}%`} 
                  />
                )}
              </Card>
            )}

            {/* Vehicles for Selected Policy */}
            <Card>
              <h3 style={{ margin: "0 0 1rem 0", color: "#1f2937", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
                Vehicles for This Policy ({policyVehicles.length})
              </h3>
              {policyVehicles.length > 0 ? (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {policyVehicles.map((vehicle) => (
                    <Card key={vehicle.id} style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                      <InfoRow label="Vehicle Name" value={vehicle.vehicle_name || 'N/A'} />
                      <InfoRow label="Year" value={vehicle.vehicle_year || 'N/A'} />
                      <InfoRow label="Color" value={vehicle.vehicle_color || 'N/A'} />
                      <InfoRow label="Plate Number" value={vehicle.plate_num || 'N/A'} />
                      <InfoRow label="VIN" value={vehicle.vin_num || 'N/A'} />
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: "2rem", 
                  textAlign: "center", 
                  color: "#6b7280", 
                  fontStyle: "italic",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px"
                }}>
                  No vehicles found for this policy
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Policy Computations */}
          <div style={{ flex: 1 }}>
            <Card style={{ height: "fit-content" }}>
              <h3 style={{ margin: "0 0 1rem 0", color: "#1f2937", borderBottom: "2px solid #e5e7eb", paddingBottom: "0.5rem" }}>
                Computations for This Policy ({policyComputations.length})
              </h3>
              {policyComputations.length > 0 ? (
                <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                  {policyComputations.map((comp, index) => (
                    <Card 
                      key={comp.id} 
                      style={{ 
                        backgroundColor: "#fef3c7", 
                        border: "2px solid #f59e0b",
                        marginBottom: "1.5rem"
                      }}
                    >
                      <h4 style={{ 
                        margin: "0 0 1rem 0", 
                        color: "#92400e", 
                        borderBottom: "1px solid #d97706", 
                        paddingBottom: "0.5rem" 
                      }}>
                        Computation #{index + 1}
                      </h4>
                      
                      <div style={{ display: "grid", gap: "0.5rem" }}>
                        <InfoRow 
                          label="Original Value" 
                          value={formatCurrency(comp.original_Value)} 
                        />
                        <InfoRow 
                          label="Current Value" 
                          value={formatCurrency(comp.current_Value)} 
                        />
                        <InfoRow 
                          label="AON Cost" 
                          value={formatCurrency(comp.aon_Cost)} 
                        />
                        <InfoRow 
                          label="Vehicle Rate Value" 
                          value={formatCurrency(comp.vehicle_Rate_Value)} 
                        />
                        <hr style={{ margin: "0.5rem 0", border: "none", borderTop: "1px solid #d97706" }} />
                        <InfoRow 
                          label="Total Premium" 
                          value={formatCurrency(comp.total_Premium)}
                          color="#059669"
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: "3rem", 
                  textAlign: "center", 
                  border: "2px dashed #d1d5db", 
                  borderRadius: "8px", 
                  backgroundColor: "#f9fafb" 
                }}>
                  <p style={{ color: "#6b7280", fontStyle: "italic", margin: 0, fontSize: "1.1rem" }}>
                    No computations found for this policy
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {!client && !loading && !error && selectedPolicy && (
        <div style={{ 
          padding: "3rem", 
          textAlign: "center", 
          color: "#6b7280" 
        }}>
          <p>No client data found for policy ID: {selectedPolicy.policyId}</p>
        </div>
      )}
    </InfoModal>
  );
}