import { useEffect, useState } from "react";
import InfoModal from "./InfoModal";
import './styles/client-info-modal-styles.css';
import { getClientInfo, getPolicyInfo, getVehicleInfo, getPolicyComputationInfo } from "./AdminActions/ModalActions";

export default function ClientInfo({ selectedPolicy, onClose }) {
  const [client, setClient] = useState(null);
  const [allPolicies, setAllPolicies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [computations, setComputations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const policy = allPolicies.find(p => p.id === selectedPolicy?.policyId) || null;
  const selectedPolicyId = selectedPolicy?.id || selectedPolicy?.policyId;
  const policyVehicles = vehicles.filter(v => v.policy_id === selectedPolicyId);
  const policyComputations = computations.filter(c => c.policy_id === selectedPolicyId);

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
      const clientData = await getClientInfo(selectedPolicy.clientId);
      setClient(clientData || null);

      const policyData = await getPolicyInfo(selectedPolicy.clientId);
      setAllPolicies(policyData || []);

      const policyIds = (policyData || []).map(p => p.id);
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
    ].filter(Boolean).join(" ");
  };

  const formatCurrency = (amount) => `₱${(amount || 0).toLocaleString()}`;

  const InfoRow = ({ label, value, color }) => (
    <div className={`info-row ${color ? 'highlight' : ''}`}>
      <strong>{label}:</strong>
      <span>{value}</span>
    </div>
  );

  const Card = ({ children, className = "" }) => (
    <div className={`client-info-card ${className}`}>
      {children}
    </div>
  );

  return (
    <InfoModal isOpen={!!selectedPolicy} onClose={onClose} title="Policy Details">
      {loading && <div className="loading-state"><p>Loading policy information...</p></div>}
      {error && <div className="error-banner"><strong>Error:</strong> {error}</div>}

      {client && !loading && (
        <div className="client-info-container">
          {/* Left Column */}
          <div style={{ flex: 1 }}>
            <Card>
              <h3>Client Information</h3>
              <InfoRow label="Name" value={formatClientName(client)} />
              <InfoRow label="Agent" value={client.employee?.personnel_Name || 'N/A'} />
              <InfoRow label="Address" value={client.address || 'N/A'} />
              <InfoRow label="Email" value={client.email || 'N/A'} />
              <InfoRow label="Phone" value={client.phone_Number || 'N/A'} />
            </Card>

            {policy && (
              <Card className="policy-card">
                <h3>Selected Policy (ID: {policy.id})</h3>
                <InfoRow label="Type" value={policy.policy_type || 'N/A'} />
                <InfoRow label="Inception" value={policy.policy_inception || 'N/A'} />
                <InfoRow label="Expiry" value={policy.policy_expiry || 'N/A'} />
                <InfoRow 
                  label="Status" 
                  value={policy.policy_is_active ? "Active" : "Inactive"} 
                  color={policy.policy_is_active ? '#22c55e' : '#ef4444'} 
                />
                <InfoRow label="Insurance Partner" value={policy.insurance_Partners?.insurance_Name || 'N/A'} />
                {policy.insurance_Partners?.insurance_Rate && (
                  <InfoRow label="Insurance Rate" value={`${policy.insurance_Partners.insurance_Rate}%`} />
                )}
              </Card>
            )}

            <Card>
              <h3>Vehicles for This Policy ({policyVehicles.length})</h3>
              {policyVehicles.length > 0 ? (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {policyVehicles.map((v) => (
                    <Card key={v.id} className="vehicle-card">
                      <InfoRow label="Vehicle Name" value={v.vehicle_maker || 'N/A'} />
                      <InfoRow label="Vehicle Name" value={v.vehicle_name || 'N/A'} />
                      <InfoRow label="Year" value={v.vehicle_year || 'N/A'} />
                      <InfoRow label="Color" value={v.vehicle_color || 'N/A'} />
                      <InfoRow label="Plate Number" value={v.plate_num || 'N/A'} />
                      <InfoRow label="VIN" value={v.vin_num || 'N/A'} />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No vehicles found for this policy</div>
              )}
            </Card>
          </div>

          {/* Right Column */}
          <div style={{ flex: 1 }}>
            <Card className="computation-card">
              <h3>Computations for This Policy ({policyComputations.length})</h3>
              {policyComputations.length > 0 ? (
                <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                  {policyComputations.map((c, i) => (
                    <Card key={c.id} className="computation-card">
                      <h4>Computation #{i + 1}</h4>
                      <InfoRow label="Original Value" value={formatCurrency(c.original_Value)} />
                      <InfoRow label="Current Value" value={formatCurrency(c.current_Value)} />
                      <InfoRow label="AON Cost" value={formatCurrency(c.aon_Cost)} />
                      <InfoRow label="Vehicle Rate Value" value={formatCurrency(c.vehicle_Rate_Value)} />
                      <hr />
                      <InfoRow label="Total Premium" value={formatCurrency(c.total_Premium)} color="#059669" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No computations found for this policy</div>
              )}
            </Card>
          </div>
        </div>
      )}

      {!client && !loading && !error && selectedPolicy && (
        <div className="empty-state">
          <p>No client data found for policy ID: {selectedPolicy.policyId}</p>
        </div>
      )}
    </InfoModal>
  );
}
