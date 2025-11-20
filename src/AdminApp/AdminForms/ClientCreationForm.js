// ClientCreationForm.jsx
import "../styles/client-creation-styles.css";
import React, { useState, useEffect, useRef } from "react";
import { checkIfEmailExists, checkIfPhoneExists } from "../AdminActions/NewClientActions";
import {
  fetchRegions,
  fetchProvinces,
  fetchCities,
  fetchBarangays,
  fetchCitiesForNCR,
} from "../AdminActions/PhilippineAddressAPI";
import CustomAlertModal from "./CustomAlertModal";

export default function ClientCreationForm({ clientData, onChange, onSubmit, onCancel }) {
  // --- Modal state ---
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", title: "Alert" });

  // --- Errors ---
  const [errors, setErrors] = useState({
    phoneNumber: "",
    email: "",
    firstName: "",
    familyName: "",
    streetAddress: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
  });

  // --- Address data ---
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // --- Selected codes for cascading selects ---
  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  // --- Loading flags ---
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // --- Refs (for phone input caret control) ---
  const phoneRef = useRef(null);

  // Helper to show alert modal
  const showAlert = (message, title = "Alert") => {
    setAlertModal({ isOpen: true, message, title });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, message: "", title: "Alert" });
  };

  // ---------------------------
  // Load regions on mount
  // ---------------------------
  useEffect(() => {
    let mounted = true;
    const loadRegions = async () => {
      try {
        setLoadingRegions(true);
        const data = await fetchRegions();
        if (!mounted) return;
        setRegions(data || []);
      } catch (err) {
        console.error("Failed to load regions", err);
      } finally {
        if (mounted) setLoadingRegions(false);
      }
    };
    loadRegions();
    return () => {
      mounted = false;
    };
  }, []);

  // ---------------------------
  // When region changes -> provinces OR NCR cities
  // ---------------------------
  useEffect(() => {
    const loadRegionData = async () => {
      setSelectedProvinceCode("");
      setSelectedCityCode("");
      setBarangays([]);
      onChange({ target: { name: "province", value: "" } });
      onChange({ target: { name: "city", value: "" } });
      onChange({ target: { name: "barangay", value: "" } });

      if (!selectedRegionCode) {
        setProvinces([]);
        setCities([]);
        return;
      }

      const selectedRegion = regions.find((r) => r.code === selectedRegionCode);
      const isNCR =
        selectedRegion?.name?.toLowerCase().includes("national capital region") ||
        selectedRegionCode === "130000000";

      if (isNCR) {
        try {
          setLoadingCities(true);
          const data = await fetchCitiesForNCR(selectedRegionCode);
          setCities(data || []);
          setProvinces([]);
        } catch (err) {
          console.error("Failed to load NCR cities", err);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      } else {
        try {
          setLoadingProvinces(true);
          const data = await fetchProvinces(selectedRegionCode);
          setProvinces(data || []);
          setCities([]);
        } catch (err) {
          console.error("Failed to load provinces", err);
          setProvinces([]);
        } finally {
          setLoadingProvinces(false);
        }
      }
    };

    loadRegionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRegionCode, regions]);

  // ---------------------------
  // When province changes -> load cities (non-NCR)
  // ---------------------------
  useEffect(() => {
    const selectedRegion = regions.find((r) => r.code === selectedRegionCode);
    const isNCR =
      selectedRegion?.name?.toLowerCase().includes("national capital region") ||
      selectedRegionCode === "130000000";

    if (!isNCR && selectedProvinceCode) {
      const loadCities = async () => {
        try {
          setLoadingCities(true);
          const data = await fetchCities(selectedProvinceCode);
          setCities(data || []);
        } catch (err) {
          console.error("Failed to load cities", err);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      };
      loadCities();

      setSelectedCityCode("");
      setBarangays([]);
      onChange({ target: { name: "city", value: "" } });
      onChange({ target: { name: "barangay", value: "" } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvinceCode]);

  // ---------------------------
  // When city changes -> load barangays
  // ---------------------------
  useEffect(() => {
    if (!selectedCityCode) {
      setBarangays([]);
      return;
    }

    const loadBarangays = async () => {
      try {
        setLoadingBarangays(true);
        const data = await fetchBarangays(selectedCityCode);
        setBarangays(data || []);
      } catch (err) {
        console.error("Failed to load barangays", err);
        setBarangays([]);
      } finally {
        setLoadingBarangays(false);
      }
    };
    loadBarangays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityCode]);

  // ---------------------------
  // Derived helper: is selected region NCR?
  // ---------------------------
  const selectedRegion = regions.find((r) => r.code === selectedRegionCode);
  const isNCR =
    selectedRegion?.name?.toLowerCase().includes("national capital region") ||
    selectedRegionCode === "130000000";

  // ---------------------------
  // Handlers: Address selection with validation updates
  // ---------------------------
  const handleRegionChange = (e) => {
    const code = e.target.value;
    setSelectedRegionCode(code);
    const regionObj = regions.find((r) => r.code === code);
    onChange({ target: { name: "region", value: regionObj?.name || "" } });
    setErrors((prev) => ({ ...prev, region: code ? "" : "Region is required" }));
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    const provinceObj = provinces.find((p) => p.code === code);
    onChange({ target: { name: "province", value: provinceObj?.name || "" } });
    setErrors((prev) => ({ ...prev, province: code ? "" : "Province is required" }));
  };

  const handleCityChange = (e) => {
    const code = e.target.value;
    setSelectedCityCode(code);
    const cityObj = cities.find((c) => c.code === code);
    onChange({ target: { name: "city", value: cityObj?.name || "" } });
    setErrors((prev) => ({ ...prev, city: code ? "" : "City is required" }));
  };

  const handleBarangayChange = (e) => {
    const value = e.target.value;
    onChange({ target: { name: "barangay", value } });
    setErrors((prev) => ({ ...prev, barangay: value ? "" : "Barangay is required" }));
  };

  // ---------------------------
  // Street, names, email handlers with inline validation
  // ---------------------------
  const handleStreetAddressChange = (e) => {
    const value = e.target.value;
    onChange(e);
    setErrors((prev) => ({ ...prev, streetAddress: value.trim() ? "" : "Street Address is required" }));
  };

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    onChange(e);
    setErrors((prev) => ({ ...prev, firstName: value.trim() ? "" : "First Name is required" }));
  };

  const handleFamilyNameChange = (e) => {
    const value = e.target.value;
    onChange(e);
    setErrors((prev) => ({ ...prev, familyName: value.trim() ? "" : "Last Name is required" }));
  };

  // ---------------------------
  // Email validation & uniqueness check
  // ---------------------------
  const handleEmailChange = (e) => {
    const value = e.target.value;
    onChange(e);

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
  };

  const handleEmailBlur = async () => {
    const val = clientData.email?.trim();
    if (!val) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return;
    try {
      const exists = await checkIfEmailExists(val);
      if (exists) setErrors((prev) => ({ ...prev, email: "This email is already registered" }));
    } catch (err) {
      console.error("checkIfEmailExists failed", err);
    }
  };

  // ---------------------------
  // PHONE: enforce "09" prefix and block deleting prefix
  // ---------------------------
  const sanitizePhone = (raw) => {
    if (!raw) return "09";
    let digits = raw.replace(/\D/g, "");
    if (!digits.startsWith("09")) {
      if (digits.startsWith("9")) digits = "0" + digits;
      else digits = "09" + digits.replace(/^0+/, "");
    }
    digits = digits.slice(0, 11);
    return digits;
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const sanitized = sanitizePhone(raw);
    onChange({ target: { name: "phoneNumber", value: sanitized } });

    let err = "";
    if (!/^09\d{9}$/.test(sanitized)) err = "Phone must be 11 digits and start with 09";
    setErrors((prev) => ({ ...prev, phoneNumber: err }));
  };

  const handlePhoneFocus = (e) => {
    let current = clientData.phoneNumber || "";
    if (!current || !current.startsWith("09")) {
      const prefixed = sanitizePhone(current);
      onChange({ target: { name: "phoneNumber", value: prefixed } });
      setTimeout(() => {
        const input = phoneRef.current;
        if (input && input.setSelectionRange) {
          const pos = Math.max(2, input.value.length);
          input.setSelectionRange(pos, pos);
        }
      }, 0);
    } else {
      setTimeout(() => {
        const input = phoneRef.current;
        if (input && input.selectionStart < 2) {
          input.setSelectionRange(2, 2);
        }
      }, 0);
    }
  };

  const handlePhoneKeyDown = (e) => {
    const input = phoneRef.current;
    if (!input) return;
    const selStart = input.selectionStart;
    const selEnd = input.selectionEnd;

    if (selStart < 2) {
      if (e.key === "Backspace") {
        if (selStart === selEnd) {
          e.preventDefault();
          setTimeout(() => input.setSelectionRange(2, 2), 0);
        } else {
          if (selEnd > 2) {
            e.preventDefault();
            setTimeout(() => input.setSelectionRange(2, 2), 0);
          }
        }
      }
      if (e.key === "Delete") {
        if (selStart < 2) {
          e.preventDefault();
          setTimeout(() => input.setSelectionRange(2, 2), 0);
        }
      }
    }

    if (e.key.length === 1 && !/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePhoneBlur = async () => {
    const val = clientData.phoneNumber?.trim();
    if (!val) return;
    if (!/^09\d{9}$/.test(val)) return;
    try {
      const exists = await checkIfPhoneExists(val);
      if (exists) setErrors((prev) => ({ ...prev, phoneNumber: "This phone number is already registered" }));
    } catch (err) {
      console.error("checkIfPhoneExists failed", err);
    }
  };

  // ---------------------------
  // Submit: final validation
  // ---------------------------
  const handleSubmit = async () => {
    const newErrors = {};

    if (!clientData?.firstName?.trim()) newErrors.firstName = "First Name is required";
    if (!clientData?.familyName?.trim()) newErrors.familyName = "Last Name is required";
    if (!clientData?.streetAddress?.trim()) newErrors.streetAddress = "Street Address is required";

    if (!clientData?.region) newErrors.region = "Region is required";
    const regionObj = regions.find((r) => r.code === selectedRegionCode);
    const regionIsNCR =
      regionObj?.name?.toLowerCase().includes("national capital region") ||
      selectedRegionCode === "130000000";
    if (!regionIsNCR && !clientData?.province) newErrors.province = "Province is required";
    if (!clientData?.city) newErrors.city = "City is required";
    if (!clientData?.barangay) newErrors.barangay = "Barangay is required";

    if (!clientData?.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^09\d{9}$/.test(clientData.phoneNumber)) {
      newErrors.phoneNumber = "Phone must be 11 digits and start with 09";
    }

    if (!clientData?.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) newErrors.email = "Invalid email address";

    setErrors((prev) => ({ ...prev, ...newErrors }));

    const hasErrors = Object.values(newErrors).some(Boolean);
    if (hasErrors) {
      return;
    }

    await onSubmit();
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <>
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        message={alertModal.message}
        title={alertModal.title}
      />

      <div className="client-creation-container">
        <div className="form-card-client-creation">
          <h2>Client Creation Form</h2>
          <div className="form-grid-client-creation">
            <div className="form-left-column-creation">
              {/* Prefix */}
              <div className="form-group-client-creation">
                <label>Prefix (optional)</label>
                <input type="text" name="prefix" value={clientData?.prefix || ""} onChange={onChange} />
              </div>

              {/* First Name */}
              <div className="form-group-client-creation">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={clientData?.firstName || ""}
                  onChange={handleFirstNameChange}
                />
                {errors.firstName && <p style={{ color: "red" }}>{errors.firstName}</p>}
              </div>

              {/* Middle Name */}
              <div className="form-group-client-creation">
                <label>Middle Name (optional)</label>
                <input type="text" name="middleName" value={clientData?.middleName || ""} onChange={onChange} />
              </div>

              {/* Last Name */}
              <div className="form-group-client-creation">
                <label>Last Name</label>
                <input
                  type="text"
                  name="familyName"
                  value={clientData?.familyName || ""}
                  onChange={handleFamilyNameChange}
                />
                {errors.familyName && <p style={{ color: "red" }}>{errors.familyName}</p>}
              </div>

              {/* Suffix */}
              <div className="form-group-client-creation">
                <label>Suffix (optional)</label>
                <input type="text" name="suffix" value={clientData?.suffix || ""} onChange={onChange} />
              </div>

              {/* Phone */}
              <div className="form-group-client-creation">
                <label>Phone Number</label>
                <input
                  ref={phoneRef}
                  type="tel"
                  name="phoneNumber"
                  value={clientData?.phoneNumber || ""}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  onFocus={handlePhoneFocus}
                  onKeyDown={handlePhoneKeyDown}
                  placeholder="09XXXXXXXXX"
                  maxLength={11}
                  inputMode="numeric"
                />
                {errors.phoneNumber && <p style={{ color: "red" }}>{errors.phoneNumber}</p>}
              </div>

              {/* Email */}
              <div className="form-group-client-creation">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={clientData?.email || ""}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  placeholder="example@email.com"
                />
                {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
              </div>

              {/* Street Address */}
              <div className="form-group-client-creation">
                <label>Street Address / Unit No.</label>
                <input
                  type="text"
                  name="streetAddress"
                  value={clientData?.streetAddress || ""}
                  onChange={handleStreetAddressChange}
                />
                {errors.streetAddress && <p style={{ color: "red" }}>{errors.streetAddress}</p>}
              </div>

              {/* Region */}
              <div className="form-group-client-creation">
                <label>Region</label>
                <select
                  value={selectedRegionCode}
                  onChange={handleRegionChange}
                  disabled={loadingRegions}
                  name="regionSelect"
                >
                  <option value="">{loadingRegions ? "Loading regions..." : "Select Region"}</option>
                  {regions.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </select>
                {errors.region && <p style={{ color: "red" }}>{errors.region}</p>}
              </div>

              {/* Province (hidden when NCR) */}
              {!isNCR && (
                <div className="form-group-client-creation">
                  <label>Province</label>
                  <select
                    value={selectedProvinceCode}
                    onChange={handleProvinceChange}
                    disabled={!selectedRegionCode || loadingProvinces}
                    name="provinceSelect"
                  >
                    <option value="">{loadingProvinces ? "Loading provinces..." : "Select Province"}</option>
                    {provinces.map((prov) => (
                      <option key={prov.code} value={prov.code}>
                        {prov.name}
                      </option>
                    ))}
                  </select>
                  {errors.province && <p style={{ color: "red" }}>{errors.province}</p>}
                </div>
              )}

              {/* City / Municipality */}
              <div className="form-group-client-creation">
                <label>City / Municipality</label>
                <select
                  value={selectedCityCode}
                  onChange={handleCityChange}
                  disabled={(!isNCR && !selectedProvinceCode) || loadingCities}
                  name="citySelect"
                >
                  <option value="">{loadingCities ? "Loading cities..." : "Select City/Municipality"}</option>
                  {cities.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>
                {errors.city && <p style={{ color: "red" }}>{errors.city}</p>}
              </div>

              {/* Barangay */}
              <div className="form-group-client-creation">
                <label>Barangay</label>
                <select
                  value={clientData?.barangay || ""}
                  onChange={handleBarangayChange}
                  disabled={!selectedCityCode || loadingBarangays}
                  name="barangaySelect"
                >
                  <option value="">{loadingBarangays ? "Loading barangays..." : "Select Barangay"}</option>
                  {barangays.map((b) => (
                    <option key={b.code} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.barangay && <p style={{ color: "red" }}>{errors.barangay}</p>}
              </div>

              {/* Zip Code (optional) */}
              <div className="form-group-client-creation">
                <label>Zip Code</label>
                <input
                  type="tel"
                  name="zipCode"
                  value={clientData?.zipCode || ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                    onChange({ target: { name: "zipCode", value: raw } });
                  }}
                  placeholder="e.g., 1000"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          <div className="client-creation-controls">
            <button className="client-creation-cancel-btn" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button className="client-creation-submit-btn" type="button" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}