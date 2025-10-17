import { useState, useEffect } from "react";
import "../styles/view-claim-modal-styles.css";

export default function ViewClaimModal({ policy, claims, onClose }) {
  const [documentUrls, setDocumentUrls] = useState([]);

  useEffect(() => {
    // If you need to fetch signed URLs for documents, do it here
    // For now, we'll just use the documents array as-is
  }, [claims]);

  const formatCurrency = (amount) => {
    if (!amount) return "₱0.00";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (!policy || !claims || claims.length === 0) {
    return null;
  }

  // Get client information from policy
  const client = policy.clients_Table;
  const clientName = client
    ? [client.prefix, client.first_Name, client.middle_Name ? client.middle_Name.charAt(0) + "." : "", client.family_Name, client.suffix]
        .filter(Boolean)
        .join(" ")
    : "Unknown Client";

  // Get partner company name
  const partnerCompany = policy.policy_Table?.insurance_Partners?.insurance_Name || "N/A";

  // For simplicity, we'll display the first claim's details
  // You can modify this to show all claims or allow selection
  const claim = claims[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="view-claim-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <span className="modal-icon">📋</span>
            <h2>Claims Details</h2>
          </div>
          <button className="close-modal-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Policy and Claim IDs */}
          <div className="ids-section">
            <div className="id-item">
              <label>Policy ID:</label>
              <span>{policy.internal_id}</span>
            </div>
            <div className="id-item">
              <label>Claim ID:</label>
              <span>{claim.id}</span>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="details-grid">
            {/* Client Information */}
            <div className="info-card">
              <h3>Client Information</h3>
              <div className="info-row">
                <div className="info-item">
                  <label>Name:</label>
                  <span>{clientName}</span>
                </div>
                <div className="info-item">
                  <label>Partner Company:</label>
                  <span>{partnerCompany}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <label>Contact Number:</label>
                  <span>{claim.phone_number || "N/A"}</span>
                </div>
                <div className="info-item">
                  <label>Estimate Amount:</label>
                  <span>{formatCurrency(claim.estimate_amount)}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item full-width">
                  <label>Location:</label>
                  <span>{claim.location_of_incident || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Vehicle Information */}
            <div className="info-card">
              <h3>Vehicle Information</h3>
              <div className="info-row">
                <div className="info-item">
                  <label>Type of Claim:</label>
                  <span>{policy.policy_Table?.policy_type || "Comprehensive"}</span>
                </div>
                <div className="info-item">
                  <label>Type of Incident:</label>
                  <span>{claim.type_of_incident || "Own Damage"}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item">
                  <label>Incident Date:</label>
                  <span>{formatDate(claim.incident_date)}</span>
                </div>
                <div className="info-item">
                  <label>Claim Date:</label>
                  <span>{formatDate(claim.claim_date)}</span>
                </div>
              </div>
              <div className="info-row">
                <div className="info-item full-width">
                  <label>Description:</label>
                  <span>{claim.description_of_incident || "Bumper crash at parking lot"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="documents-section">
            <h3>Supporting Documents:</h3>
            <div className="documents-list">
              {claim.documents && Array.isArray(claim.documents) && claim.documents.length > 0 ? (
                claim.documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <span className="doc-icon">📄</span>
                    <span className="doc-name">{doc.name || doc.path || `Document ${index + 1}`}</span>
                  </div>
                ))
              ) : (
                <p className="no-documents">No documents uploaded</p>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}