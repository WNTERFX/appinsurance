import { useEffect, useState } from "react";
import InfoModal from "./InfoModal";
import { getClientInfo, getPolicyInfo, getVehicleInfo, getPolicyComputationInfo } from "./AdminActions/ModalActions";

export default function ClientInfo({ clientID, onClose }) {
  const [client, setClient] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [computations, setComputations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientID) {
      setClient(null);
      setPolicies([]);
      setVehicles([]);
      setComputations([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const clientData = await getClientInfo(clientID);
        const policyData = await getPolicyInfo(clientID);
        const vehicleData = await getVehicleInfo(policyData.map(p => p.id));
        const computationData = await getPolicyComputationInfo(clientID);

        setClient(clientData || null);
        setPolicies(policyData || []);
        setVehicles(vehicleData || []);
        setComputations(computationData || []);
      } catch (err) {
        console.error(err);
        setClient(null);
        setPolicies([]);
        setVehicles([]);
        setComputations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientID]);

  return (
    <InfoModal isOpen={!!clientID} onClose={onClose} title="Client Details">
      {loading && <p>Loading...</p>}
      {client && !loading && (
        <div style={{ display: "flex", gap: "2rem" }}>
          {/* Left Column - All Details */}
          <div style={{ flex: 1 }}>
            {/* Client Info */}
            <div className="client-info-modal">
              <h4>Client Information</h4>
              <p>
                <strong>Name:</strong>
                <span>
                  {[
                    client.prefix,
                    client.first_Name,
                    client.middle_Name ? client.middle_Name.charAt(0) + "." : "",
                    client.family_Name,
                    client.suffix,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              </p>
              <p>
                <strong>Agent:</strong>
                <span>{client.employee?.personnel_Name || 'N/A'}</span>
              </p>
              <p>
                <strong>Address:</strong>
                <span>{client.address}</span>
              </p>
              <p>
                <strong>Email:</strong>
                <span>{client.email}</span>
              </p>
              <p>
                <strong>Phone:</strong>
                <span>{client.phone_Number}</span>
              </p>
            </div>

            {/* Policies */}
            <div style={{ marginTop: "1.5rem" }}>
              <h4>Policies</h4>
              {policies.length > 0 ? (
                policies.map((policy, index) => (
                  <div key={policy.id} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #eee", borderRadius: "6px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>Type:</strong>
                        <span>{policy.policy_type}</span>
                      </p>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>Inception:</strong>
                        <span>{policy.policy_inception || 'N/A'}</span>
                      </p>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>Expiry:</strong>
                        <span>{policy.policy_expirty || 'N/A'}</span>
                      </p>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>Status:</strong>
                        <span style={{ color: policy.policy_is_active ? '#22c55e' : '#ef4444' }}>
                          {policy.policy_is_active ? "Active" : "Inactive"}
                        </span>
                      </p>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>Partner:</strong>
                        <span>{policy.insurance_Partners?.insurance_Name || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#666", fontStyle: "italic" }}>No policies found</p>
              )}
            </div>

            {/* Vehicles */}
            <div style={{ marginTop: "1.5rem" }}>
              <h4>Vehicles</h4>
              {vehicles.length > 0 ? (
                vehicles.map((vehicle, index) => (
                  <div key={vehicle.id} style={{ marginBottom: "1rem", padding: "1rem", border: "1px solid #eee", borderRadius: "6px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>Name:</strong>
                        <span>{vehicle.vehicle_name}</span>
                      </p>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>Year:</strong>
                        <span>{vehicle.vehicle_year}</span>
                      </p>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>Color:</strong>
                        <span>{vehicle.vehicle_color}</span>
                      </p>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>Plate #:</strong>
                        <span>{vehicle.plate_num}</span>
                      </p>
                      <p style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                        <strong>VIN:</strong>
                        <span>{vehicle.vin_num}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "#666", fontStyle: "italic" }}>No vehicles found</p>
              )}
            </div>
          </div>

          {/* Right Column - Computations */}
          <div style={{ flex: 1 }}>
            <div className="computation-value-modal">
              <h4>Policy Computations</h4>
              {computations.length > 0 ? (
                computations.map((comp, index) => (
                  <div key={comp.id} style={{ marginBottom: "1.5rem", padding: "1.5rem", border: "2px solid #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
                    <h5 style={{ margin: "0 0 1rem 0", color: "#374151", borderBottom: "1px solid #d1d5db", paddingBottom: "0.5rem" }}>
                      Computation 
                    </h5>
                    <p>
                      <strong>Original Value:</strong>
                      <span>₱{comp.original_Value?.toLocaleString() || '0'}</span>
                    </p>
                    <p>
                      <strong>Current Value:</strong>
                      <span>₱{comp.current_Value?.toLocaleString() || '0'}</span>
                    </p>
                
                    <p>
                      <strong>AON Cost:</strong>
                      <span>₱{comp.aon_Cost?.toLocaleString() || '0'}</span>
                    </p>
                    <p>
                      <strong>Vehicle Rate Value:</strong>
                      <span>₱{comp.vehicle_Rate_Value?.toLocaleString() || '0'}</span>
                    </p>

                    <p>
                      <strong>Total Premium:</strong>
                      <span style={{ color: "#059669", fontWeight: "600" }}>₱{comp.total_Premium?.toLocaleString() || '0'}</span>
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ padding: "2rem", textAlign: "center", border: "2px dashed #d1d5db", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
                  <p style={{ color: "#6b7280", fontStyle: "italic", margin: 0 }}>No policy computations available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </InfoModal>
  );
}