import React, { useState, useEffect } from 'react';
import { X, FileText, Trash2 } from 'lucide-react';
import { getClaimDocumentUrls, updateClaim, deleteClaimDocumentFromStorage } from '../AdminActions/ClaimsTableActions';
import '../styles/edit-claims-modal.css';

export default function EditClaimsModal({ claim, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type_of_incident: '',
    phone_number: '',
    estimate_amount: '',
    approved_amount: '',
    location_of_incident: '',
    description_of_incident: '',
    incident_date: '',
    claim_date: '',
    message: ''
  });

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const isFinalized = claim?.status === 'Approved' || claim?.status === 'Rejected';

  useEffect(() => {
    if (claim) {
      setFormData({
        type_of_incident: claim.type_of_incident || '',
        phone_number: claim.phone_number || '',
        estimate_amount: claim.estimate_amount || '',
        approved_amount: claim.approved_amount || '',
        //location_of_incident: claim.location_of_incident || '',
        //description_of_incident: claim.description_of_incident || '',
        incident_date: claim.incident_date ? new Date(claim.incident_date).toISOString().split('T')[0] : '',
        claim_date: claim.claim_date ? new Date(claim.claim_date).toISOString().split('T')[0] : '',
        message: claim.message || ''
      });

      loadDocuments();
    }
  }, [claim]);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    setError(null);
    setSuccessMessage(null);

    if (!claim?.documents || !Array.isArray(claim.documents)) {
      setDocuments([]);
      setLoadingDocs(false);
      console.log('No documents array found on claim (ID:', claim?.id, ')');
      return;
    }

    console.log('Raw documents from claim (ID:', claim?.id, '):', claim.documents);

    try {
      const docsWithUrls = await getClaimDocumentUrls(claim.documents);
      setDocuments(docsWithUrls);
      console.log('Documents loaded successfully:', docsWithUrls);
    } catch (err) {
      console.error('Error loading documents for claim (ID:', claim?.id, '):', err);
      setError('Failed to load documents. Please check console for details.');
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (type) => {
    setFormData(prev => ({ ...prev, type_of_incident: type }));
  };

  const handleDeleteDocument = (doc) => {
    setDeleteConfirm(doc);
    setError(null);
    setSuccessMessage(null);
  };

  const confirmDeleteDocument = async () => {
    if (deleteConfirm) {
      try {
        setError(null);
        setSuccessMessage(null);

        await deleteClaimDocumentFromStorage(deleteConfirm.path);

        const updatedDocs = documents.filter(d => d.path !== deleteConfirm.path);
        setDocuments(updatedDocs);

        const updatedData = {
          ...formData,
          incident_date: formData.incident_date ? new Date(formData.incident_date).toISOString() : null,
          claim_date: formData.claim_date ? new Date(formData.claim_date).toISOString() : null,
          approved_amount: formData.approved_amount === '' ? null : formData.approved_amount,
          documents: updatedDocs.map(doc => ({
            path: doc.path,
            name: doc.name,
            size: doc.size,
            type: doc.type,
            uploadedAt: doc.uploadedAt
          }))
        };

        await updateClaim(claim.id, updatedData);
        onSave(claim.id, updatedData);

        setSuccessMessage(`Document "${deleteConfirm.name}" deleted successfully.`);
        setDeleteConfirm(null);

        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error('Error confirming document deletion:', err);
        setError(`Failed to delete document: ${err.message}`);
        setDeleteConfirm(null);
      }
    }
  };

  const cancelDeleteDocument = () => {
    setDeleteConfirm(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccessMessage(null);

    const updatedData = {
      ...formData,
      incident_date: formData.incident_date ? new Date(formData.incident_date).toISOString() : null,
      claim_date: formData.claim_date ? new Date(formData.claim_date).toISOString() : null,
      approved_amount: formData.approved_amount === '' ? null : formData.approved_amount,
      documents: documents.map(doc => ({
        path: doc.path,
        name: doc.name,
        size: doc.size,
        type: doc.type,
        uploadedAt: doc.uploadedAt
      }))
    };

    try {
      await updateClaim(claim.id, updatedData);
      setSuccessMessage('Claim updated successfully!');
      onSave(claim.id, updatedData);

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error submitting claim update:', err);
      setError(`Failed to update claim: ${err.message}`);
    }
  };

  return (
    <div className="edit-claims-modal-overlay" onClick={onClose}>
      <div className="edit-claims-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="edit-claims-modal-header">
          <div>
            <h2>Edit Claims</h2>
            <p className="edit-claims-modal-subtitle">Submit an insurance claim with all required details</p>
          </div>
          <button className="edit-claims-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="edit-claims-modal-body">
          {error && (
            <div className="edit-claims-error-message">
              {error}
            </div>
          )}

          <div className="edit-claims-header-row">
            <div className="edit-claims-field">
              <label>Policy ID:</label>
              <input
                type="text"
                value={claim?.policy_Table?.internal_id || 'N/A'}
                disabled
              />
            </div>
            <div className="edit-claims-field">
              <label>Claim ID:</label>
              <input
                type="text"
                value={claim?.id || 'N/A'}
                disabled
              />
            </div>
          </div>

          <div className="edit-claims-grid">
            <div className="edit-claims-field edit-claims-type-of-incident">
              <label>Type of Incident:</label>
              <div className="edit-claims-checkboxes">
                <label className="edit-claims-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.type_of_incident === 'Own Damage'}
                    onChange={() => handleCheckboxChange('Own Damage')}
                    disabled={isFinalized}
                  />
                  Own Damage
                </label>
                <label className="edit-claims-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.type_of_incident === 'Third-party'}
                    onChange={() => handleCheckboxChange('Third-party')}
                    disabled={isFinalized}
                  />
                  Third-party
                </label>
              </div>
            </div>

           {/* <div className="edit-claims-field">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={isFinalized}
              />
            </div>*/}

            <div className="edit-claims-field">
              <label>Estimate Amount</label>
              <input
                type="number"
                name="estimate_amount"
                value={formData.estimate_amount}
                onChange={handleChange}
                disabled={isFinalized}
              />
            </div>

            <div className="edit-claims-field">
              <label>Incident Date</label>
              <input
                type="date"
                name="incident_date"
                value={formData.incident_date}
                onChange={handleChange}
                disabled={isFinalized}
              />
            </div>

            <div className="edit-claims-field">
              <label>Approved Amount</label>
              <input
                type="number"
                name="approved_amount"
                value={formData.approved_amount}
                onChange={handleChange}
                disabled={isFinalized}
              />
            </div>

            <div className="edit-claims-field">
              <label>Claim Date</label>
              <input
                type="date"
                name="claim_date"
                value={formData.claim_date}
                onChange={handleChange}
                disabled={isFinalized}
              />
            </div>

           {/*<div className="edit-claims-field edit-claims-full-width">
              <label>Location of Incident:</label>
              <textarea
                name="location_of_incident"
                value={formData.location_of_incident}
                onChange={handleChange}
                rows={3}
                disabled={isFinalized}
              />
            </div>

            <div className="edit-claims-field edit-claims-full-width">
              <label>Description of Incident:</label>
              <textarea
                name="description_of_incident"
                value={formData.description_of_incident}
                onChange={handleChange}
                rows={3}
                disabled={isFinalized}
              />
            </div>*/}

            <div className="edit-claims-field edit-claims-full-width">
              <label>Supporting Documents:</label>
              <div className="edit-claims-documents-list">
                {loadingDocs ? (
                  <p className="no-docs">Loading documents...</p>
                ) : documents.length === 0 ? (
                  <p className="no-docs">No documents attached</p>
                ) : (
                  documents.map((doc, index) => (
                    <div key={index} className="edit-claims-document-item">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="edit-claims-document-link"
                        title="Click to open document in new tab"
                        onClick={(e) => {
                          // Prevent any parent handlers
                          e.stopPropagation();
                        }}
                      >
                        <FileText size={16} />
                        <span>{doc.name}</span>
                      </a>
                      {(!isFinalized && claim?.status !== 'Approved' && claim?.status !== 'Rejected') && (
                        <button
                          className="edit-claims-delete-doc-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc);
                          }}
                          type="button"
                          title="Remove document"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="edit-claims-field edit-claims-full-width">
              <label>Message:</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                placeholder="Enter a message to send to the client (optional)"
              />
            </div>
          </div>
        </div>

        <div className="edit-claims-modal-footer">
          <button
            className="edit-claims-submit-btn"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>

        {deleteConfirm && (
          <div className="delete-confirm-overlay" onClick={cancelDeleteDocument}>
            <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Confirm</h3>
              <p>Are you sure you want to remove this attachment?</p>
              <div className="delete-confirm-actions">
                <button className="delete-confirm-cancel" onClick={cancelDeleteDocument}>
                  Cancel
                </button>
                <button className="delete-confirm-ok" onClick={confirmDeleteDocument}>
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}