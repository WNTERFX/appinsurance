import "../styles/client-creation-styles.css";
import { useState } from "react";
import { checkIfEmailExists, checkIfPhoneExists } from "../AdminActions/NewClientActions";

export default function ClientCreationForm({ clientData, onChange, onSubmit, onCancel }) {
  const [errors, setErrors] = useState({
    phoneNumber: "",
    email: "",
    firstName: "",
    familyName: "",
    address: "",
  });

  // ✅ Phone number validation
  const handlePhoneChange = (e) => {
    let input = e.target.value;
    if (!/^\d*$/.test(input)) return; // digits only
    if (input.length > 11) input = input.slice(0, 11);
    onChange({ target: { name: "phoneNumber", value: input } });

    setErrors((prev) => ({
      ...prev,
      phoneNumber:
        input.length === 0
          ? "Phone number is required"
          : input.length !== 11
          ? "Phone number must be 11 digits"
          : "",
    }));
  };

  const handlePhoneBlur = async () => {
    const input = clientData.phoneNumber?.trim();
    if (!input || input.length !== 11) return;

    const exists = await checkIfPhoneExists(input);
    if (exists) {
      setErrors((prev) => ({
        ...prev,
        phoneNumber: "This phone number is already registered",
      }));
    }
  };

  // ✅ Email validation and duplicate check
  const handleEmailChange = (e) => {
    const value = e.target.value;
    onChange(e);

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
    } else {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleEmailBlur = async () => {
    const input = clientData.email?.trim();
    if (!input) return;

    const exists = await checkIfEmailExists(input);
    if (exists) {
      setErrors((prev) => ({
        ...prev,
        email: "This email is already registered",
      }));
    }
  };

  // ✅ Other field handlers (unchanged)
  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    onChange(e);
    setErrors((prev) => ({
      ...prev,
      firstName: !value.trim() ? "First Name is required" : "",
    }));
  };

  const handleFamilyNameChange = (e) => {
    const value = e.target.value;
    onChange(e);
    setErrors((prev) => ({
      ...prev,
      familyName: !value.trim() ? "Last Name is required" : "",
    }));
  };

  const handleHomeAddressChange = (e) => {
    const value = e.target.value;
    onChange(e);
    setErrors((prev) => ({
      ...prev,
      address: !value.trim() ? "Home Address is required" : "",
    }));
  };

  // ✅ Final submit validation
  const handleSubmit = () => {
    const newErrors = { ...errors };
    if (!clientData?.firstName?.trim()) newErrors.firstName = "First Name is required";
    if (!clientData?.familyName?.trim()) newErrors.familyName = "Last Name is required";
    if (!clientData?.email?.trim()) newErrors.email = "Email is required";
    if (!clientData?.address?.trim()) newErrors.address = "Home Address is required";
    if (!clientData?.phoneNumber?.trim() || clientData.phoneNumber.length !== 11)
      newErrors.phoneNumber = "Phone number must be 11 digits";

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => err);
    if (!hasErrors) {
      onSubmit();
    } else {
      alert("Please fix validation errors before submitting.");
    }
  };

  return (
    <div className="client-creation-container">
      <div className="form-card-client-creation">
        <h2>Client Creation Form</h2>
        <div className="form-grid-client-creation">
          <div className="form-left-column-creation">
            <div className="form-group-client-creation">
              <label>Prefix</label>
              <input
                type="text"
                name="prefix"
                value={clientData?.prefix}
                onChange={onChange}
              />
            </div>

            <div className="form-group-client-creation">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={clientData?.firstName}
                onChange={handleFirstNameChange}
              />
              {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}
            </div>

            <div className="form-group-client-creation">
              <label>Middle Name</label>
              <input
                type="text"
                name="middleName"
                value={clientData?.middleName}
                onChange={onChange}
              />
            </div>

            <div className="form-group-client-creation">
              <label>Last Name *</label>
              <input
                type="text"
                name="familyName"
                value={clientData?.familyName}
                onChange={handleFamilyNameChange}
              />
              {errors.familyName && <p style={{ color: "red" }}>{errors.familyName}</p>}
            </div>

            <div className="form-group-client-creation">
              <label>Suffix</label>
              <input
                type="text"
                name="suffix"
                value={clientData?.suffix}
                onChange={onChange}
              />
            </div>

            <div className="form-group-client-creation">
              <label>Phone Number *</label>
              <input
                type="text"
                name="phoneNumber"
                value={clientData?.phoneNumber}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                placeholder="0xxxxxxxxxx"
              />
              {errors.phoneNumber && <p style={{ color: "red" }}>{errors.phoneNumber}</p>}
            </div>

            <div className="form-group-client-creation">
              <label>Home Address *</label>
              <input
                type="text"
                name="address"
                value={clientData?.address}
                onChange={handleHomeAddressChange}
              />
              {errors.address && <p style={{ color: "red" }}>{errors.address}</p>}
            </div>

            <div className="form-group-client-creation">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={clientData?.email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="example@email.com"
              />
              {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
            </div>
          </div>
        </div>

        <div className="client-creation-controls">
          <button className="client-creation-cancel-btn" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="client-creation-submit-btn"
            type="button"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
