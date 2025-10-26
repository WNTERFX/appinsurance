import React, { useEffect, useState } from "react";
import InfoModal from "./InfoModal";
import './styles/client-info-modal-styles.css';
import { getClientInfo, getPolicyInfo, getVehicleInfo, getPolicyComputationInfo, getCalculationDataForPolicies } from "./AdminActions/ModalActions";

// Import React Icons
import { FaUser, FaFileAlt, FaCar, FaCalculator } from 'react-icons/fa';

export default function ClientInfo({ selectedPolicy, onClose }) {
  const [client, setClient] = useState(null);
  const [allPolicies, setAllPolicies] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [computations, setComputations] = useState([]);
  const [calculationData, setCalculationData] = useState([]);
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
    setCalculationData([]);
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
        const [vehicleData, computationData, calcData] = await Promise.all([
          getVehicleInfo(policyIds),
          getPolicyComputationInfo(policyIds),
          getCalculationDataForPolicies(policyIds)
        ]);
        setVehicles(vehicleData || []);
        setComputations(computationData || []);
        setCalculationData(calcData || []);
      } else {
        setVehicles([]);
        setComputations([]);
        setCalculationData([]);
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

  // Format currency to match picture: no decimal places, comma separated
  const formatCurrency = (amount) => `₱${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  // Calculate amount from percentage
  const calculateFromPercentage = (percentage, baseAmount) => {
    return (percentage / 100) * baseAmount;
  };

  // Component for grid layout within cards (Client, Policy, Vehicle)
  const InfoGrid = ({ children }) => (
    <div className="info-grid">
      {children}
    </div>
  );

  // Individual label and value for InfoGrid items
  const InfoItem = ({ label, value, className = "" }) => (
    <>
      <span className="info-label">{label}:</span>
      <span className={`info-value ${className}`}>{value}</span>
    </>
  );

  // Card wrapper component
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
          <Card className="client-information-card">
            <h3><FaUser className="icon-style" /> Client Information</h3>
            <hr className="section-header-separator" />
            <InfoGrid>
              <InfoItem label="Name" value={formatClientName(client)} />
              <InfoItem label="Address" value={client.address || 'N/A'} />
              <InfoItem label="Phone" value={client.phone_Number || 'N/A'} />
              <InfoItem label="Email" value={client.email || 'N/A'} />
              <InfoItem label="Agent" value={client.employee?.personnel_Name || 'N/A'} />
            </InfoGrid>
          </Card>

          {policy && (
            <Card className="policy-information-card">
              <h3><FaFileAlt className="icon-style" /> Policy Information (ID: {policy.id})</h3>
              <hr className="section-header-separator" />
              <InfoGrid>
                <InfoItem label="Type" value={policy.policy_type || 'N/A'} />
                <InfoItem label="Status"
                  value={policy.policy_is_active ? "Active" : "Inactive"}
                  className={policy.policy_is_active ? "status-active" : "status-inactive"}
                />
                <InfoItem label="Inception" value={policy.policy_inception || 'N/A'} />
                <InfoItem label="Expiry" value={policy.policy_expiry || 'N/A'} />
                <InfoItem label="Insurance Partner" value={policy.insurance_Partners?.insurance_Name || 'N/A'} />
                {policy.insurance_Partners?.insurance_Rate && (
                  <InfoItem label="Insurance Rate" value={`${policy.insurance_Partners.insurance_Rate}%`} />
                )}
              </InfoGrid>
            </Card>
          )}

          <Card className="computation-summary-card">
            <h3><FaCalculator className="icon-style" /> Computation Summary</h3>
            <hr className="section-header-separator" />
            {policyComputations.length > 0 ? (
              <div className="computation-items-container">
                {policyComputations.map((c) => {
                  // Find the calculation data for this policy
                  const policyCalcData = calculationData.find(cd => cd.policy_id === c.policy_id);
                  const calcData = policyCalcData?.calculation_Table;
                  
                  return (
                    <React.Fragment key={c.id}>
                      <div className="computation-info-item">
                        <span className="info-label">VAT</span>
                        <span className="info-value">
                          {formatCurrency(calculateFromPercentage(calcData?.vat_Tax || 0, c.total_Premium || 0))}
                        </span>
                      </div>
                      <div className="computation-info-item">
                        <span className="info-label">Documentation Stamp</span>
                        <span className="info-value">
                          {formatCurrency(calculateFromPercentage(calcData?.docu_Stamp || 0, c.total_Premium || 0))}
                        </span>
                      </div>
                      <div className="computation-info-item">
                        <span className="info-label">Local Tax</span>
                        <span className="info-value">
                          {formatCurrency(calculateFromPercentage(calcData?.local_Gov_Tax || 0, c.total_Premium || 0))}
                        </span>
                      </div>
                      <hr className="total-premium-separator" />
                      <div className="total-premium-item">
                        <span className="info-label">Premium</span>
                        <span className="info-value">{formatCurrency(c.total_Premium)}</span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">No computations found for this policy</div>
            )}
          </Card>

          <Card className="vehicle-information-card">
            <h3><FaCar className="icon-style" /> Vehicle Information</h3>
            <hr className="section-header-separator" />
            {policyVehicles.length > 0 ? (
              <div className="vehicle-list-container">
                {policyVehicles.map((v) => (
                  <InfoGrid key={v.id}>
                    <InfoItem label="Model Make" value={v.vehicle_maker || 'N/A'} />
                    <InfoItem label="Vehicle Name" value={v.vehicle_name || 'N/A'} />
                    <InfoItem label="Year" value={v.vehicle_year || 'N/A'} />
                    <InfoItem label="Color" value={v.vehicle_color || 'N/A'} />
                    <InfoItem label="Plate Number" value={v.plate_num || 'N/A'} />
                    <InfoItem label="Engine Serial Number" value={v.engine_serial_no || 'N/A'} />
                    <InfoItem label="VIN Number" value={v.vin_num || 'N/A'} />
                  </InfoGrid>
                ))}
              </div>
            ) : (
              <div className="empty-state">No vehicles found for this policy</div>
            )}
          </Card>
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