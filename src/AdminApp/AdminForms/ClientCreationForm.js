import "../styles/client-creation-styles.css";

export default function ClientCreationForm({ clientData, onChange, onSubmit }) {
  return (
    <div className="client-creation-container">
      <h2>Client Creation Form</h2>
      <div className="form-card-client-creation">
        <div className="form-grid-client-creation">
          <div className="form-left-column-client-creation">
           
            <div className="form-group-client-creation">
              <label>Prefix</label>
              <input
                type="text"
                name="prefix"
                value={clientData?.prefix || ""}
                onChange={onChange}
              />
            </div>
            <div className="form-group-client-creation">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={clientData?.firstName || ""}
                onChange={onChange}
              />
            </div>
            <div className="form-group-client-creation">
              <label>Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={clientData?.middleName || ""}
                onChange={onChange}
              />
            </div>
            <div className="form-group-client-creation">
              <label>Last/Family Name</label>
              <input
                type="text"
                name="lastName"
                value={clientData?.lastName || ""}
                onChange={onChange}
              />
            </div>
            <div className="form-group-client-creation">
              <label>Suffix</label>
              <input
                type="text"
                name="suffix"
                value={clientData?.suffix || ""}
                onChange={onChange}
              />
            </div>
            <div className="form-group-client-creation">
              <label>Home Address</label>
              <input
                type="text"
                name="homeAddress"
                value={clientData?.homeAddress || ""}
                onChange={onChange}
              />
            </div>
            <div className="form-group-client-creation">
              <label>Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={clientData?.phoneNumber || ""}
                onChange={onChange}
              />
            </div>
            <div className="form-group-client-creation">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={clientData?.email || ""}
                onChange={onChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="client-creation-controls">
        <button type="button" onClick={onSubmit}>Submit</button>
        <button type="button">Cancel</button>
      </div>
    </div>
  );
}