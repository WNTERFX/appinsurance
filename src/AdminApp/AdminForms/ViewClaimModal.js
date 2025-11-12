import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { getClaimDocumentUrls } from "../AdminActions/ClaimsTableActions";
import "../styles/view-claim-modal-styles.css";

export default function ViewClaimModal({ policy, claims, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [claims]);

  const loadDocuments = async () => {
    if (!claims || claims.length === 0 || !claims[0].documents) {
      setDocuments([]);
      setLoadingDocs(false);
      return;
    }

    try {
      const docsWithUrls = await getClaimDocumentUrls(claims[0].documents);
      setDocuments(docsWithUrls);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

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
                  <label>Insurer:</label>
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
                  <span>{claim.description_of_incident || "No description provided"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supporting Documents */}
          <div className="documents-section">
            <h3>Supporting Documents:</h3>
            <div className="documents-list">
              {loadingDocs ? (
                <p className="no-documents">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="no-documents">No documents uploaded</p>
              ) : (
                documents.map((doc, index) => (
                  <div key={index} className="document-item">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="doc-icon"></span>
                      <span className="doc-name">{doc.name || doc.path || `Document ${index + 1}`}</span>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}