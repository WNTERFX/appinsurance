
import React from "react";

export default function CalculationsTab({ controller }) {
  return (
    <>
      <div className="admin-controller-header">
        {!controller.isCreatingCalc && (
          <button
            onClick={controller.showCreateCalcForm}
            className="admin-controller-btn admin-controller-btn-primary"
          >
            Add New Vehicle Type
          </button>
        )}
      </div>

      {controller.isCreatingCalc && (
        <form onSubmit={controller.handleCalcSubmit} className="admin-controller-form">
          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Vehicle Type:
              <input
                type="text"
                value={controller.vehicleType}
                onChange={(e) => controller.setVehicleType(e.target.value)}
                className="admin-controller-input"
                placeholder="e.g., Sedan, SUV, Truck"
                required
                disabled={controller.isEditingCalc}
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Bodily Injury:
              <input
                type="number"
                step="0.01"
                value={controller.bodilyInjury}
                onChange={(e) => controller.setBodilyInjury(e.target.value)}
                className="admin-controller-input"
                placeholder="Amount"
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Personal Accident:
              <input
                type="number"
                step="0.01"
                value={controller.personalAccident}
                onChange={(e) => controller.setPersonalAccident(e.target.value)}
                className="admin-controller-input"
                placeholder="Amount"
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Property Damage:
              <input
                type="number"
                step="0.01"
                value={controller.propertyDamage}
                onChange={(e) => controller.setPropertyDamage(e.target.value)}
                className="admin-controller-input"
                placeholder="Amount"
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Vehicle Rate:
              <input
                type="number"
                step="0.01"
                value={controller.vehicleRate}
                onChange={(e) => controller.setVehicleRate(e.target.value)}
                className="admin-controller-input"
                placeholder="Rate"
              />
            </label>
          </div>

          <h3 className="admin-controller-subtitle">Taxes & Fees</h3>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              VAT Tax:
              <input
                type="number"
                step="0.01"
                value={controller.vat}
                onChange={(e) => controller.setVat(e.target.value)}
                className="admin-controller-input"
                placeholder="Amount"
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Local Government Tax:
              <input
                type="number"
                step="0.01"
                value={controller.localTax}
                onChange={(e) => controller.setLocalTax(e.target.value)}
                className="admin-controller-input"
                placeholder="Amount"
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              Documentary Stamp:
              <input
                type="number"
                step="0.01"
                value={controller.docStamp}
                onChange={(e) => controller.setDocStamp(e.target.value)}
                className="admin-controller-input"
                placeholder="Amount"
              />
            </label>
          </div>

          <div className="admin-controller-form-group">
            <label className="admin-controller-label">
              AON:
              <input
                type="number"
                step="0.01"
                value={controller.aon}
                onChange={(e) => controller.setAon(e.target.value)}
                className="admin-controller-input"
                placeholder="Amount"
              />
            </label>
          </div>

          <div className="admin-controller-button-group">
            <button
              type="submit"
              className="admin-controller-btn admin-controller-btn-primary"
              disabled={controller.loadingCalc}
            >
              {controller.loadingCalc ? "Saving..." : controller.isEditingCalc ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={controller.resetCalcForm}
              className="admin-controller-btn admin-controller-btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="admin-controller-table-wrapper">
        <h3 className="admin-controller-subtitle">Vehicle Type Calculations</h3>
        <table className="admin-controller-table">
          <thead>
            <tr>
              <th>Vehicle Type</th>
              <th>Bodily Injury</th>
              <th>Personal Accident</th>
              <th>Property Damage</th>
              <th>Vehicle Rate</th>
              <th>VAT Tax</th>
              <th>Local Tax</th>
              <th>Doc Stamp</th>
              <th>AON</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {controller.calculations.length === 0 ? (
              <tr>
                <td colSpan="10" className="admin-controller-empty">
                  No calculations found. Click "Add New Vehicle Type" to create one.
                </td>
              </tr>
            ) : (
              controller.calculations.map((calc) => (
                <tr key={calc.id}>
                  <td><strong>{calc.vehicle_type}</strong></td>
                  <td>{calc.bodily_Injury}</td>
                  <td>{calc.personal_Accident}</td>
                  <td>{calc.property_Damage}</td>
                  <td>{calc.vehicle_Rate}</td>
                  <td>{calc.vat_Tax}</td>
                  <td>{calc.local_Gov_Tax}</td>
                  <td>{calc.docu_Stamp}</td>
                  <td>{calc.aon}</td>
                  <td>
                    <button
                      onClick={() => controller.handleEditCalc(calc)}
                      className="admin-controller-btn admin-controller-btn-edit"
                    >
                      Edit
                    </button>
                    {/*<button
                      onClick={() => controller.handleDeleteCalc(calc.id)}
                      className="admin-controller-btn admin-controller-btn-delete"
                    >
                      Delete
                    </button>*/}
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