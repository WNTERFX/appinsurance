import "../styles/client-update-styles.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
//import { editClient } from "../AdminActions/EditClientActions";

export default function ClientEditForm({originalData,formData,errors,onChange,onSubmit,onClose}) {

  return (
    <div className="client-update-container">
      <div className="form-card-client-update">
        <h2>Update Client Information</h2>

        <div className="form-grid-client-update">
          <div className="form-left-column-client-update">

            {/* Prefix */}
            <div className="form-group-client-update">
              <label>Prefix</label>
              <input
                type="text"
                value={originalData.prefix}
                readOnly
                className="original-value" disabled
              />
              <input
                type="text"
                name="prefix"
                value={formData.prefix}
                onChange={onChange}
              />
            </div>

            {/* First Name */}
            <div className="form-group-client-update">
              <label>First Name *</label>
              <input
                type="text"
                value={originalData.first_Name}
                readOnly
                className="original-value" disabled
              />
              <input
                type="text"
                name="first_Name"
                value={formData.first_Name}
                onChange={onChange}
              />
              {errors.first_Name && (
                <p style={{ color: "red" }}>{errors.first_Name}</p>
              )}
            </div>

            {/* Middle Name */}
            <div className="form-group-client-update">
              <label>Middle Name</label>
              <input
                type="text"
                value={originalData.middle_Name}
                readOnly
                className="original-value" disabled
              />
              <input
                type="text"
                name="middle_Name"
                value={formData.middle_Name}
                onChange={onChange}
              />
            </div>

            {/* Family Name */}
            <div className="form-group-client-update">
              <label>Last Name *</label>
              <input
                type="text"
                value={originalData.family_Name}
                readOnly
                className="original-value" disabled
              />
              <input
                type="text"
                name="family_Name"
                value={formData.family_Name}
                onChange={onChange}
              />
              {errors.family_Name && (
                <p style={{ color: "red" }}>{errors.family_Name}</p>
              )}
            </div>

            {/* Suffix */}
            <div className="form-group-client-update">
              <label>Suffix</label>
              <input
                type="text"
                value={originalData.suffix}
                readOnly
                className="original-value" disabled
              />
              <input
                type="text"
                name="suffix"
                value={formData.suffix}
                onChange={onChange}
              />

            </div>

            {/* Phone Number */}
            <div className="form-group-client-update">
              <label>Phone Number *</label>
              <input
                type="text"
                value={originalData.phone_Number}
                readOnly
                className="original-value" disabled
              />
              <input
                type="text"
                name="phone_Number"
                value={formData.phone_Number}
                onChange={(e) => {
                  let input = e.target.value;
                  if (!/^\d*$/.test(input)) return;
                  if (input.length > 11) input = input.slice(0, 11);
                  onChange({ target: { name: "phone_Number", value: input } });
                }}
                placeholder="0xxxxxxxxxx"
              />
              {errors.phone_Number && (
                <p style={{ color: "red" }}>{errors.phone_Number}</p>
              )}
            </div>

            {/* Address */}
            <div className="form-group-client-update">
              <label>Address *</label>
              <input
                type="text"
                value={originalData.address}
                readOnly
                className="original-value" disabled
              />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={onChange}
              />
              {errors.address && (
                <p style={{ color: "red" }}>{errors.address}</p>
              )}
            </div>

            {/* Email */}
            <div className="form-group-client-update">
              <label>Email *</label>
              <input
                type="text"
                value={originalData.email}
                readOnly
                className="original-value" disabled
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p style={{ color: "red" }}>{errors.email}</p>
              )}
            </div>



          </div>

        </div>
                   {/* Buttons */}
            <div className="client-update-controls">
              <button
                className="cancel-btn-client-update"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="submit-btn-client-update"
                type="button"
                onClick={onSubmit}
                disabled={
                  errors.first_Name ||
                  errors.family_Name ||
                  errors.phone_Number ||
                  errors.address ||
                  errors.email ||
                  !formData.first_Name?.trim() ||
                  !formData.family_Name?.trim() ||
                  !formData.phone_Number?.trim() ||
                  !formData.address?.trim() ||
                  !formData.email?.trim()
                }
              >
                Update
              </button>
            </div>
      </div>
    </div>
  );
}