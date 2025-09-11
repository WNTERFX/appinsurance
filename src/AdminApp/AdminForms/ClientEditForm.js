import "../styles/client-update-styles.css"



export default function ClientEditForm() {

    // temporary values for now
    const originalData = {
    prefix: "Mr.",
    firstName: "John",
    middleName: "M.",
    lastName: "Doe",
    homeAddress: "123 Elm Street",
    phoneNumber: "09123456789",
    email: "john.doe@email.com"
  };

  const updatedData = {
    prefix: "",
    firstName: "",
    middleName: "",
    lastName: "",
    homeAddress: "",
    phoneNumber: "",
    email: ""
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
            <input
              type="text"
              value={originalData?.prefix || ""}
              readOnly
              className="original-value"
            />
            <input
              type="text"
              name="prefix"
              value={updatedData?.prefix || ""}
              onChange={onChange}
            />
          </div>

          {/* First Name */}
          <div className="form-group-client-update">
            <label>First Name *</label>
            <input
              type="text"
              value={originalData?.firstName || ""}
              readOnly
              className="original-value"
            />
            <input
              type="text"
              name="firstName"
              value={updatedData?.firstName || ""}
              onChange={handleFirstNameChange}
            />
            {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}
          </div>

          {/* Middle Name */}
          <div className="form-group-client-update">
            <label>Middle Name</label>
            <input
              type="text"
              value={originalData?.middleName || ""}
              readOnly
              className="original-value"
            />
            <input
              type="text"
              name="middleName"
              value={updatedData?.middleName || ""}
              onChange={onChange}
            />
          </div>

          {/* Last Name */}
          <div className="form-group-client-update">
            <label>Last/Family Name</label>
            <input
              type="text"
              value={originalData?.lastName || ""}
              readOnly
              className="original-value"
            />
            <input
              type="text"
              name="lastName"
              value={updatedData?.lastName || ""}
              onChange={onChange}
            />
          </div>

          {/* Home Address */}
          <div className="form-group-client-update">
            <label>Home Address *</label>
            <input
              type="text"
              value={originalData?.homeAddress || ""}
              readOnly
              className="original-value"
            />
            <input
              type="text"
              name="homeAddress"
              value={updatedData?.homeAddress || ""}
              onChange={handleHomeAddressChange}
            />
            {errors.homeAddress && <p style={{ color: "red" }}>{errors.homeAddress}</p>}
          </div>

          {/* Phone Number */}
          <div className="form-group-client-update">
            <label>Phone Number *</label>
            <input
              type="text"
              value={originalData?.phoneNumber || ""}
              readOnly
              className="original-value"
            />
            <input
              type="text"
              name="phoneNumber"
              value={updatedData?.phoneNumber || ""}
              onChange={handlePhoneChange}
              onBlur={handlePhoneBlur}
              placeholder="0xxxxxxxxxx"
            />
            {errors.phoneNumber && <p style={{ color: "red" }}>{errors.phoneNumber}</p>}
          </div>

          {/* Email */}
          <div className="form-group-client-update">
            <label>Email Address *</label>
            <input
              type="text"
              value={originalData?.email || ""}
              readOnly
              className="original-value"
            />
            <input
              type="email"
              name="email"
              value={updatedData?.email || ""}
              onChange={handleEmailChange}
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