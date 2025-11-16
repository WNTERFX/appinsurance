import React, { useState, useEffect, useMemo } from 'react';
import { X, FileText } from 'lucide-react';
import { getClaimDocumentUrls, updateClaim } from '../AdminActions/ClaimsTableActions';
import '../styles/edit-claims-modal.css';

/* ---------- Helpers ---------- */
function toLocalISODateOnly(inputDate) {
  const d = inputDate ? new Date(inputDate) : new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().split('T')[0];
}

function parseIncidentTypes(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    const s = raw.trim();
    if (s.startsWith('[')) {
      try {
        const arr = JSON.parse(s);
        if (Array.isArray(arr)) return arr.filter(Boolean);
      } catch {}
    }
    return s.split(',').map(x => x.trim()).filter(Boolean);
  }
  return [];
}

function serializeIncidentTypes(arr) {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.filter(Boolean).join(', ');
}

const MONEY_RE = /^\d*\.?\d{0,2}$/;          // digits + optional '.' + up to 2 decimals

export default function EditClaimsModal({ claim, onClose, onSave }) {
  const [formData, setFormData] = useState({
    type_of_incident: [],
    estimate_amount: '',
    approved_amount: '',
    incident_date: '',
    claim_date: ''
  });

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [error, setError] = useState(null);
  const [approvedAmountError, setApprovedAmountError] = useState('');

  const isFinalized = ['Approved', 'Rejected', 'Completed'].includes(claim?.status);
  const todayLocal = useMemo(() => toLocalISODateOnly(), []);

  // Prevent closing via ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, []);

  useEffect(() => {
    if (!claim) return;

    setFormData({
      type_of_incident: parseIncidentTypes(claim.type_of_incident),
      estimate_amount: claim.estimate_amount ?? '',
      approved_amount: claim.approved_amount ?? '',
      incident_date: claim.incident_date ? toLocalISODateOnly(claim.incident_date) : '',
      claim_date: claim.claim_date ? toLocalISODateOnly(claim.claim_date) : ''
    });

    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claim]);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    setError(null);

    if (!claim?.documents || !Array.isArray(claim.documents)) {
      setDocuments([]);
      setLoadingDocs(false);
      return;
    }

    try {
      const docsWithUrls = await getClaimDocumentUrls(claim.documents);
      setDocuments(docsWithUrls);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents. Please check console for details.');
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // NOTE: approved_amount uses a stricter handler below
    if (name === 'approved_amount') return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /* ---- Approved Amount: numeric-only (optional '.' up to 2 decimals), cannot be 0 ---- */
  const handleApprovedAmountChange = (e) => {
    const raw = e.target.value.replace(/[^\d.]/g, ''); // strip anything not digit/dot
    if (raw === '' || MONEY_RE.test(raw)) {
      setFormData(prev => ({ ...prev, approved_amount: raw }));

      if (raw === '') {
        setApprovedAmountError('');
        return;
      }

      const val = parseFloat(raw);
      if (!Number.isFinite(val)) {
        setApprovedAmountError('Enter a valid number.');
      } else if (val === 0) {
        setApprovedAmountError('Approved amount cannot be 0.');
      } else {
        setApprovedAmountError('');
      }
    }
  };

  const handleApprovedAmountKeyDown = (e) => {
    const allow = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','Home','End'];
    const ctrl = (e.ctrlKey || e.metaKey) && ['a','c','v','x'].includes(e.key.toLowerCase());
    if (allow.includes(e.key) || ctrl) return;

    if (e.key === '.') {
      if (String(formData.approved_amount || '').includes('.')) e.preventDefault();
      return;
    }
    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const handleApprovedAmountPaste = (e) => {
    const text = (e.clipboardData.getData('text') || '').replace(/[^\d.]/g, '');
    if (!(text === '' || MONEY_RE.test(text))) e.preventDefault();
  };

  /* ---- Incident type toggles ---- */
  const toggleIncidentType = (type) => {
    if (isFinalized) return;
    setFormData(prev => {
      const has = prev.type_of_incident.includes(type);
      const next = has ? prev.type_of_incident.filter(t => t !== type) : [...prev.type_of_incident, type];
      return { ...prev, type_of_incident: next };
    });
  };

  const handleSubmit = async () => {
    setError(null);

    // Require at least one incident type
    if (!formData.type_of_incident.length) {
      setError('Select the applicable incident type to proceed.');
      return;
    }

    // Validate Approved Amount if present - only check if it's 0
    if (formData.approved_amount !== '') {
      const n = parseFloat(formData.approved_amount);
      if (!Number.isFinite(n) || n === 0) {
        setError('Approved amount cannot be 0.');
        return;
      }
    }

    const updatedData = {
      ...formData,
      type_of_incident: serializeIncidentTypes(formData.type_of_incident),
      incident_date: formData.incident_date ? new Date(formData.incident_date).toISOString() : null,
      claim_date: formData.claim_date ? new Date(formData.claim_date).toISOString() : null,
      approved_amount: formData.approved_amount === '' ? null : parseFloat(formData.approved_amount),
      estimate_amount: formData.estimate_amount === '' ? null : parseFloat(formData.estimate_amount),
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
      onSave(claim.id, updatedData);
      onClose();
    } catch (err) {
      console.error('Error submitting claim update:', err);
      setError(`Failed to update claim: ${err.message}`);
    }
  };

  return (
    <div className="edit-claims-modal-overlay" role="dialog" aria-modal="true">
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
          {error && <div className="edit-claims-error-message">{error}</div>}

          <div className="edit-claims-header-row">
            <div className="edit-claims-field">
              <label>Policy ID:</label>
              <input type="text" value={claim?.policy_Table?.internal_id || 'N/A'} disabled />
            </div>
            <div className="edit-claims-field">
              <label>Claim ID:</label>
              <input type="text" value={claim?.id || 'N/A'} disabled />
            </div>
          </div>

          <div className="edit-claims-grid">
            <div className="edit-claims-field edit-claims-type-of-incident">
              <label>Type of Incident:</label>
              <div className="edit-claims-checkboxes">
                <label className="edit-claims-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.type_of_incident.includes('Own Damage')}
                    onChange={() => toggleIncidentType('Own Damage')}
                    disabled={isFinalized}
                  />
                  Own Damage
                </label>
                <label className="edit-claims-checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.type_of_incident.includes('Third-party')}
                    onChange={() => toggleIncidentType('Third-party')}
                    disabled={isFinalized}
                  />
                  Third-party
                </label>
              </div>
            </div>

            <div className="edit-claims-field">
              <label>Estimate Amount</label>
              <input
                type="number"
                name="estimate_amount"
                value={formData.estimate_amount}
                onChange={handleChange}
                disabled
                min="0"
                step="0.01"
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
                max={todayLocal}
              />
            </div>

            <div className="edit-claims-field">
              <label>Approved Amount</label>
              <input
                type="text"
                inputMode="decimal"
                name="approved_amount"
                value={formData.approved_amount}
                onChange={handleApprovedAmountChange}
                onKeyDown={handleApprovedAmountKeyDown}
                onPaste={handleApprovedAmountPaste}
                disabled={isFinalized}
              />
              {approvedAmountError && (
                <span style={{ color: '#dc2626', fontSize: 12, marginTop: 4, display: 'block' }}>
                  {approvedAmountError}
                </span>
              )}
            </div>

            <div className="edit-claims-field">
              <label>Claim Date</label>
              <input type="date" name="claim_date" value={formData.claim_date} disabled />
            </div>

            <div className="edit-claims-field edit-claims-full-width">
              <label>Supporting Documents:</label>
              <div className="edit-claims-documents-list only-links-clickable">
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
                        title="Open document in new tab"
                      >
                        <FileText size={16} />
                        <span>{doc.name}</span>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="edit-claims-modal-footer">
          <button
            className="edit-claims-submit-btn"
            onClick={handleSubmit}
            disabled={!!approvedAmountError}
            style={{
              opacity: approvedAmountError ? 0.5 : 1,
              cursor: approvedAmountError ? 'not-allowed' : 'pointer'
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}