import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../moderator-styles/client-creation-moderator-styles.css";

export default function ModeratorClientCreationForm({ clientData, onChange, onSubmit, onCancel }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  //  Helper to update fields
  const updateField = (name, value) => {
    onChange(name, value);
  };

  //  Phone number logic
  const handlePhoneChange = (e) => {
    let input = e.target.value.replace(/\D/g, ""); // only digits
    if (input.length > 11) input = input.slice(0, 11);
    updateField("phoneNumber", input);

    setErrors((prev) => ({
      ...prev,
      phoneNumber:
        input.length === 0 ? "Phone number is required" :
        input.length !== 11 ? "Phone number must be 11 digits" : ""
    }));
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!clientData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!clientData.homeAddress.trim()) newErrors.homeAddress = "Home Address is required";
    if (!clientData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!clientData.phoneNumber.trim() || clientData.phoneNumber.length !== 11) {
      newErrors.phoneNumber = "Phone number must be 11 digits";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(clientData); //  send validated data to controller
    } else {
      alert(" Please fix validation errors.");
    }
  };

  return (
    <div className="client-creation-moderator-container">
      
      <div className="form-card-client-moderator-creation">
        <h2>Client Creation Form</h2>
        <div className="form-grid-client-moderator-creation">
          <div className="form-left-column-client-moderator-creation">
            {/* Prefix */}
            <div className="form-group-client-moderator-creation">
              <label>Prefix</label>
              <input
                type="text"
                value={clientData.prefix}
                onChange={(e) => updateField("prefix", e.target.value)}
              />
            </div>

            {/* First Name */}
            <div className="form-group-client-moderator-creation">
              <label>First Name *</label>
              <input
                type="text"
                value={clientData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
              {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}
            </div>

            {/* Middle Name */}
            <div className="form-group-client-moderator-creation">
              <label>Middle Name</label>
              <input
                type="text"
                value={clientData.middleName}
                onChange={(e) => updateField("middleName", e.target.value)}
              />
            </div>

            {/* Last/Family Name */}
            <div className="form-group-client-moderator-creation">
              <label>Last/Family Name</label>
              <input
                type="text"
                value={clientData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </div>

            {/* Suffix */}
            <div className="form-group-client-moderator-creation">
              <label>Suffix</label>
              <input
                type="text"
                value={clientData.suffix}
                onChange={(e) => updateField("suffix", e.target.value)}
              />
            </div>

            {/* Phone Number */}
            <div className="form-group-client-moderator-creation">
              <label>Phone Number *</label>
              <input
                type="text"
                value={clientData.phoneNumber}
                onChange={handlePhoneChange}
                placeholder="0xxxxxxxxxx"
              />
              {errors.phoneNumber && <p style={{ color: "red" }}>{errors.phoneNumber}</p>}
            </div>

            {/* Home Address */}
            <div className="form-group-client-moderator-creation">
              <label>Home Address *</label>
              <input
                type="text"
                value={clientData.homeAddress}
                onChange={(e) => updateField("homeAddress", e.target.value)}
              />
              {errors.homeAddress && <p style={{ color: "red" }}>{errors.homeAddress}</p>}
            </div>

            {/* Email Address */}
            <div className="form-group-client-moderator-creation">
              <label>Email Address *</label>
              <input
                type="email"
                value={clientData.email}
                onChange={(e) => updateField("email", e.target.value)}
              />
              {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
            </div>
          </div>
        </div>
             <div className="client-creation-moderator-controls">

          <button
          className="cancel-btn-Moderatorclientform"
          type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="submit-btn-Moderatorclientform"type="button" onClick={handleSubmit}>Submit</button>
       
      </div>
      </div>

 
    </div>
  );
}
