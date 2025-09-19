import "../moderator-styles/client-update-styles-moderator.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { editClientModerator } from "../ModeratorActions/ModeratorEditClientActions";

export default function ModeratorClientEditForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // client data passed from table
  const client = location.state?.client;

  // original data from Supabase
  const originalData = {
    uid: client?.uid || "",
    prefix: client?.prefix || "",
    first_Name: client?.first_Name || "",
    middle_Name: client?.middle_Name || "",
    family_Name: client?.family_Name || "",
    address: client?.address || "",
    phone_Number: client?.phone_Number || "",
    email: client?.email || "",
  };

  const [formData, setFormData] = useState({ ...originalData });
  const [errors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async () => {
 
    console.log("Submitting UID:", formData.uid); 

    try {
      const result = await editClientModerator(
        formData.uid,
        formData.prefix,
        formData.first_Name,
        formData.middle_Name,
        formData.family_Name,
        formData.address,
        formData.phone_Number,
        formData.email
      );

      //  update success
    alert("Client updated successfully!");
    navigate("/appinsurance/MainAreaModerator/ClientModerator");

  } catch (error) {
    console.error("Update error:", error);
    alert("Error updating client.");
  }
  };

  return (
    <div className="client-update-container-moderator">
      <h2>Update Client Information</h2>
      <div className="form-card-client-update-moderator">
        <div className="form-grid-client-update-moderator">
          <div className="form-left-column-client-update-moderator">

            {/* Prefix */}
            <div className="form-group-client-update-moderator">
              <label>Prefix</label>
              <input type="text" value={originalData.prefix} readOnly className="original-value-moderator" />
              <input type="text" name="prefix" value={formData.prefix} onChange={handleChange} />
            </div>

            {/* First Name */}
            <div className="form-group-client-update-moderator">
              <label>First Name *</label>
              <input type="text" value={originalData.first_Name} readOnly className="original-value-moderator" />
              <input type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} />
              {errors.first_Name && <p style={{ color: "red" }}>{errors.first_Name}</p>}
            </div>

            {/* Middle Name */}
            <div className="form-group-client-update-moderator">
              <label>Middle Name</label>
              <input type="text" value={originalData.middle_Name} readOnly className="original-value-moderator" />
              <input type="text" name="middle_Name" value={formData.middle_Name} onChange={handleChange} />
            </div>

            {/* Family Name */}
            <div className="form-group-client-update-moderator">
              <label>Family Name</label>
              <input type="text" value={originalData.family_Name} readOnly className="original-value-moderator" />
              <input type="text" name="family_Name" value={formData.family_Name} onChange={handleChange} />
            </div>

            {/* Address */}
            <div className="form-group-client-update-moderator">
              <label>Address *</label>
              <input type="text" value={originalData.address} readOnly className="original-value-moderator" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
              {errors.address && <p style={{ color: "red" }}>{errors.address}</p>}
            </div>

            {/* Phone Number */}
            <div className="form-group-client-update-moderator">
              <label>Phone Number *</label>
              <input type="text" value={originalData.phone_Number} readOnly className="original-value-moderator" />
              <input
                type="text"
                name="phone_Number"
                value={formData.phone_Number}
                onChange={handleChange}
                placeholder="0xxxxxxxxxx"
              />
              {errors.phone_Number && <p style={{ color: "red" }}>{errors.phone_Number}</p>}
            </div>

            {/* Email */}
            <div className="form-group-client-update-moderator">
              <label>Email *</label>
              <input type="text" value={originalData.email} readOnly className="original-value-moderator" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
              />
              {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
            </div>

          </div>
        </div>
      </div>

      <div className="client-update-controls-moderator">
        <button type="button" onClick={handleSubmit}>Update</button>
        <button className="cancel-btn-moderator" onClick={() => navigate("/appinsurance/MainAreaModerator/ClientModerator")}>Cancel</button>
      </div>
    </div>
  );
}
