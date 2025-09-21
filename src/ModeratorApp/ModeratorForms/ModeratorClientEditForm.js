import "../moderator-styles/client-update-styles-moderator.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
//import { editClientModerator } from "../ModeratorActions/ModeratorEditClientActions";

export default function ModeratorClientEditForm({originalData,formData,errors,onChange,onSubmit,onClose}) {
  return (
    <div className="client-update-container-moderator">
      <div className="form-card-client-update-moderator">
        <h2>Update Client Information</h2>

        <div className="form-grid-client-update-moderator">
          <div className="form-left-column-client-update-moderator">

            {/* Prefix */}
            <div className="form-group-client-update-moderator">
              <label>Prefix</label>
              <input
                type="text"
                value={originalData.prefix}
                readOnly
                className="original-value-moderator" disabled
              />
              <input
                type="text"
                name="prefix"
                value={formData.prefix}
                onChange={onChange}
              />
            </div>

            {/* First Name */}
            <div className="form-group-client-update-moderator">
              <label>First Name *</label>
              <input
                type="text"
                value={originalData.first_Name}
                readOnly
                className="original-value-moderator" disabled
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
            <div className="form-group-client-update-moderator">
              <label>Middle Name</label>
              <input
                type="text"
                value={originalData.middle_Name}
                readOnly
                className="original-value-moderator" disabled
              />
              <input
                type="text"
                name="middle_Name"
                value={formData.middle_Name}
                onChange={onChange}
              />
            </div>

            {/* Family Name */}
            <div className="form-group-client-update-moderator">
              <label>Family Name</label>
              <input
                type="text"
                value={originalData.family_Name}
                readOnly
                className="original-value-moderator" disabled
              />
              <input
                type="text"
                name="family_Name"
                value={formData.family_Name}
                onChange={onChange}
              />
            </div>

            {/* Phone Number */}
            <div className="form-group-client-update-moderator">
              <label>Phone Number *</label>
              <input
                type="text"
                value={originalData.phone_Number}
                readOnly
                className="original-value-moderator" disabled
              />
              <input
                type="text"
                name="phone_Number"
                value={formData.phone_Number}
                onChange={onChange}
                placeholder="0xxxxxxxxxx"
              />
              {errors.phone_Number && (
                <p style={{ color: "red" }}>{errors.phone_Number}</p>
              )}
            </div>

            {/* Address */}
            <div className="form-group-client-update-moderator">
              <label>Address *</label>
              <input
                type="text"
                value={originalData.address}
                readOnly
                className="original-value-moderator" disabled
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
            <div className="form-group-client-update-moderator">
              <label>Email *</label>
              <input
                type="text"
                value={originalData.email}
                readOnly
                className="original-value-moderator" disabled
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
            <div className="client-update-controls-moderator">
              <button
                className="cancel-btn-Moderatorclientform"
                type="button"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="submit-btn-Moderatorclientform"
                type="button"
                onClick={onSubmit}
              >
                Update
              </button>
            </div>
      </div>
    </div>
  );
}