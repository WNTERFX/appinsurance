// AdminControl.js
import React, { useState, useEffect } from "react";
import { 
  fetchAllCalculations, 
  createCalculation, 
  updateCalculation, 
  deleteCalculation 
} from "./AdminActions/AdminControlActions"
import "./styles/admin-control-styles.css"

export default function AdminControl() {
  const [calculations, setCalculations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Form fields
  const [vehicleType, setVehicleType] = useState("");
  const [bodilyInjury, setBodilyInjury] = useState("");
  const [personalAccident, setPersonalAccident] = useState("");
  const [propertyDamage, setPropertyDamage] = useState("");
  const [vehicleRate, setVehicleRate] = useState("");
  const [vat, setVat] = useState("");
  const [localTax, setLocalTax] = useState("");
  const [docStamp, setDocStamp] = useState("");
  const [aon, setAon] = useState("");

  // Fetch all calculations
  const loadCalculations = async () => {
    try {
      const data = await fetchAllCalculations();
      setCalculations(data);
    } catch (error) {
      console.error("Error fetching calculations:", error);
      showMessage("Error fetching data", "error");
    }
  };

  useEffect(() => {
    loadCalculations();
  }, []);

  // Show message
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  // Reset form
  const resetForm = () => {
    setVehicleType("");
    setBodilyInjury("");
    setPersonalAccident("");
    setPropertyDamage("");
    setVehicleRate("");
    setVat("");
    setLocalTax("");
    setDocStamp("");
    setAon("");
    setIsEditing(false);
    setIsCreating(false);
    setEditId(null);
  };

  // Show create form
  const showCreateForm = () => {
    resetForm();
    setIsCreating(true);
  };

  // Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vehicleType.trim()) {
      showMessage("Please enter a vehicle type", "error");
      return;
    }

    setLoading(true);

    const calculationData = {
      vehicle_type: vehicleType.trim(),
      bodily_Injury: parseFloat(bodilyInjury) || 0,
      personal_Accident: parseFloat(personalAccident) || 0,
      property_Damage: parseFloat(propertyDamage) || 0,
      vehicle_Rate: parseFloat(vehicleRate) || 0,
      vat_Tax: parseFloat(vat) || 0,
      local_Gov_Tax: parseFloat(localTax) || 0,
      docu_Stamp: parseFloat(docStamp) || 0,
      aon: parseFloat(aon) || 0,
    };

    try {
      if (isEditing) {
        await updateCalculation(editId, calculationData);
        showMessage("Calculation updated successfully", "success");
      } else {
        await createCalculation(calculationData);
        showMessage("Calculation created successfully", "success");
      }
      
      resetForm();
      loadCalculations();
    } catch (error) {
      console.error("Error saving calculation:", error);
      showMessage(error.message || "Error saving data", "error");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (calc) => {
    setIsEditing(true);
    setIsCreating(true);
    setEditId(calc.id);
    setVehicleType(calc.vehicle_type);
    setBodilyInjury(calc.bodily_Injury);
    setPersonalAccident(calc.personal_Accident);
    setPropertyDamage(calc.property_Damage);
    setVehicleRate(calc.vehicle_Rate);
    setVat(calc.vat_Tax);
    setLocalTax(calc.local_Gov_Tax);
    setDocStamp(calc.docu_Stamp);
    setAon(calc.aon);
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this calculation?")) {
      return;
    }

    try {
      await deleteCalculation(id);
      showMessage("Calculation deleted successfully", "success");
      loadCalculations();
    } catch (error) {
      console.error("Error deleting calculation:", error);
      showMessage("Error deleting data", "error");
    }
  };

  return (
    <div className="admin-controller-container">
      <div className="admin-controller-wrapper">
        <div className="admin-controller-header">
          <h2 className="admin-controller-title">Car Insurance Admin Control</h2>
          {!isCreating && (
            <button
              onClick={showCreateForm}
              className="admin-controller-btn admin-controller-btn-primary"
            >
              Add New Vehicle Type
            </button>
          )}
        </div>

        {message.text && (
          <div className={`admin-controller-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {isCreating && (
          <form onSubmit={handleSubmit} className="admin-controller-form">
            <div className="admin-controller-form-group">
              <label className="admin-controller-label">
                Vehicle Type:
                <input
                  type="text"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="admin-controller-input"
                  placeholder="e.g., Sedan, SUV, Truck"
                  required
                  disabled={isEditing}
                />
              </label>
            </div>

            <div className="admin-controller-form-group">
              <label className="admin-controller-label">
                Bodily Injury:
                <input
                  type="number"
                  step="0.01"
                  value={bodilyInjury}
                  onChange={(e) => setBodilyInjury(e.target.value)}
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
                  value={personalAccident}
                  onChange={(e) => setPersonalAccident(e.target.value)}
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
                  value={propertyDamage}
                  onChange={(e) => setPropertyDamage(e.target.value)}
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
                  value={vehicleRate}
                  onChange={(e) => setVehicleRate(e.target.value)}
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
                  value={vat}
                  onChange={(e) => setVat(e.target.value)}
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
                  value={localTax}
                  onChange={(e) => setLocalTax(e.target.value)}
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
                  value={docStamp}
                  onChange={(e) => setDocStamp(e.target.value)}
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
                  value={aon}
                  onChange={(e) => setAon(e.target.value)}
                  className="admin-controller-input"
                  placeholder="Amount"
                />
              </label>
            </div>

            <div className="admin-controller-button-group">
              <button
                type="submit"
                className="admin-controller-btn admin-controller-btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : isEditing ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
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
              {calculations.length === 0 ? (
                <tr>
                  <td colSpan="10" className="admin-controller-empty">
                    No calculations found. Click "Add New Vehicle Type" to create one.
                  </td>
                </tr>
              ) : (
                calculations.map((calc) => (
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
                        onClick={() => handleEdit(calc)}
                        className="admin-controller-btn admin-controller-btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(calc.id)}
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
      </div>
    </div>
  );
}