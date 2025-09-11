import "../styles/client-update-styles.css";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { editClient } from "../AdminActions/EditClientActions";

export default function ClientEditForm() {
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
      const result = await editClient(
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
    navigate("/appinsurance/MainArea/Client");

  } catch (error) {
    console.error("Update error:", error);
    alert("Error updating client.");
  }
  };

  return (
    <div className="client-update-container">
      <h2>Update Client Information</h2>
      <div className="form-card-client-update">
        <div className="form-grid-client-update">
          <div className="form-left-column-client-update">

            {/* Prefix */}
            <div className="form-group-client-update">
              <label>Prefix</label>
              <input type="text" value={originalData.prefix} readOnly className="original-value" />
              <input type="text" name="prefix" value={formData.prefix} onChange={handleChange} />
            </div>

            {/* First Name */}
            <div className="form-group-client-update">
              <label>First Name *</label>
              <input type="text" value={originalData.first_Name} readOnly className="original-value" />
              <input type="text" name="first_Name" value={formData.first_Name} onChange={handleChange} />
              {errors.first_Name && <p style={{ color: "red" }}>{errors.first_Name}</p>}
            </div>

            {/* Middle Name */}
            <div className="form-group-client-update">
              <label>Middle Name</label>
              <input type="text" value={originalData.middle_Name} readOnly className="original-value" />
              <input type="text" name="middle_Name" value={formData.middle_Name} onChange={handleChange} />
            </div>

            {/* Family Name */}
            <div className="form-group-client-update">
              <label>Family Name</label>
              <input type="text" value={originalData.family_Name} readOnly className="original-value" />
              <input type="text" name="family_Name" value={formData.family_Name} onChange={handleChange} />
            </div>

            {/* Address */}
            <div className="form-group-client-update">
              <label>Address *</label>
              <input type="text" value={originalData.address} readOnly className="original-value" />
              <input type="text" name="address" value={formData.address} onChange={handleChange} />
              {errors.address && <p style={{ color: "red" }}>{errors.address}</p>}
            </div>

            {/* Phone Number */}
            <div className="form-group-client-update">
              <label>Phone Number *</label>
              <input type="text" value={originalData.phone_Number} readOnly className="original-value" />
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
            <div className="form-group-client-update">
              <label>Email *</label>
              <input type="text" value={originalData.email} readOnly className="original-value" />
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

      <div className="client-update-controls">
        <button type="button" onClick={handleSubmit}>Update</button>
        <button className="cancel-btn" onClick={() => navigate("/appinsurance/MainArea/Client")}>Cancel</button>
      </div>
    </div>
  );
}