const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString();
};

export default function PartnersTab({ controller }) {
  return (
    <>
      <div className="admin-controller-header">
        {!controller.isCreatingPartner && (
          <button
            onClick={controller.showCreatePartnerForm}
            className="admin-controller-btn admin-controller-btn-primary"
          >
            Add New Insurer
          </button>
        )}
      </div>

      {controller.isCreatingPartner && (
        <form onSubmit={controller.handlePartnerSubmit} className="admin-controller-form">
          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Insurance Name:
              <input
                type="text"
                value={controller.insuranceName}
                onChange={(e) => controller.setInsuranceName(e.target.value)}
                className="admin-controller-input"
                placeholder="e.g., ABC Insurance Corp"
                required
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Address:
              <input
                type="text"
                value={controller.address}
                onChange={(e) => controller.setAddress(e.target.value)}
                className="admin-controller-input"
                placeholder="Company address"
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Contact:
              <textarea
                value={controller.contact}
                onChange={(e) => controller.setContact(e.target.value)}
                className="admin-controller-input"
                placeholder="Phone, email, or other contact information"
                rows="3"
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Insurance Rate:
              <input
                type="number"
                step="0.01"
                value={controller.insuranceRate}
                onChange={(e) => controller.setInsuranceRate(e.target.value)}
                className="admin-controller-input"
                placeholder="Rate percentage or amount"
              />
            </label>
          </div>
          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Initials:
              <input
                type="text"
                value={controller.initials}
                onChange={(e) => controller.setInitials(e.target.value)}
                className="admin-controller-input"
                placeholder="e.g., AIC"
                maxLength="5"
              />
            </label>
          </div>

          <div className="admin-controller-button-group">
            <button
              type="submit"
              className="admin-controller-btn admin-controller-btn-primary"
              disabled={controller.loadingPartner}
            >
              {controller.loadingPartner ? "Saving..." : controller.isEditingPartner ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={controller.resetPartnerForm}
              className="admin-controller-btn admin-controller-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-controller-table-wrapper">
        <h3 className="admin-controller-subtitle">Insurance Partners</h3>
        <table className="admin-controller-table">
          <thead>
            <tr>
              <th>Insurance Name</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Initials</th> 
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {controller.partners.length === 0 ? (
              <tr>
                <td colSpan="7" className="admin-controller-empty">
                  No insurance partners found. Click "Add New Insurance Partner" to create one.
                </td>
              </tr>
            ) : (
              controller.partners.map((partner) => (
                <tr key={partner.id}>
                  <td><strong>{partner.insurance_Name}</strong></td>
                  <td>{partner.address || "N/A"}</td>
                  <td>{partner.contact || "N/A"}</td>
                  <td>{partner.initials || "N/A"}</td> {/* ✅ Display initials */}
                  <td>{formatDate(partner.created_at)}</td>
                  <td>
                    <button
                      onClick={() => controller.handleEditPartner(partner)}
                      className="admin-controller-btn admin-controller-btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => controller.handleDeletePartner(partner.id)}
                      className="admin-controller-btn admin-controller-btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
