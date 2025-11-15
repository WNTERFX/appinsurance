import React, { useState, useEffect, useRef } from "react";
import "../styles/client-update-styles.css";
import { checkIfEmailExists, checkIfPhoneExists } from "../AdminActions/NewClientActions";
import {
  fetchRegions,
  fetchProvinces,
  fetchCities,
  fetchBarangays,
  fetchCitiesForNCR,
} from "../AdminActions/PhilippineAddressAPI";

export default function ClientEditForm({
  originalData,
  formData,
  errors = {},
  onChange,
  onSubmit,
  onClose,
}) {
  // --- Address Dropdown State ---
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // --- Selected Codes for Cascading ---
  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  // --- Loading States ---
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // --- Local validation state (keeps parent errors intact) ---
  const [localErrors, setLocalErrors] = useState({
    phone_Number: "",
    email: "",
    first_Name: "",
    family_Name: "",
    address: "",
    region_address: "",
    province_address: "",
    city_address: "",
    barangay_address: "",
    zip_code: "",
  });

  // merged view of errors (parent + local). Use this to show messages.
  const mergedErrors = { ...(errors || {}), ...(localErrors || {}) };

  // phone ref (we keep for caret behavior if needed)
  const phoneRef = useRef(null);

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
        if (mounted) setRegions([]);
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
  // Load provinces OR cities when region changes
  // ---------------------------
  useEffect(() => {
    const loadRegionData = async () => {
      if (!selectedRegionCode) {
        setProvinces([]);
        setCities([]);
        return; // Guard clause
      }

      const selectedRegion = regions.find((r) => r.code === selectedRegionCode);
      const isNCR =
        selectedRegion?.name?.toLowerCase().includes("national capital region") ||
        selectedRegionCode === "130000000";

      if (isNCR) {
        setLoadingCities(true);
        try {
          const data = await fetchCitiesForNCR(selectedRegionCode);
          setCities(data || []);
          setProvinces([]);
        } catch (error) {
          console.error("Failed to load NCR cities:", error);
          setCities([]);
        } finally {
          setLoadingCities(false);
        }
      } else {
        setLoadingProvinces(true);
        try {
          const data = await fetchProvinces(selectedRegionCode);
          setProvinces(data || []);
          setCities([]);
        } catch (error) {
          console.error("Failed to load provinces:", error);
          setProvinces([]);
        } finally {
          setLoadingProvinces(false);
        }
      }
    };

    loadRegionData();
  }, [selectedRegionCode, regions]);

  // ---------------------------
  // Load cities for non-NCR provinces
  // ---------------------------
  useEffect(() => {
    const selectedRegion = regions.find((r) => r.code === selectedRegionCode);
    const isNCR =
      selectedRegion?.name?.toLowerCase().includes("national capital region") ||
      selectedRegionCode === "130000000";

    if (!isNCR && selectedProvinceCode) {
      const loadCities = async () => {
        setLoadingCities(true);
        try {
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
    }
  }, [selectedProvinceCode, selectedRegionCode, regions]);

  // ---------------------------
  // Load barangays when city changes
  // ---------------------------
  useEffect(() => {
    if (selectedCityCode) {
      const loadBarangays = async () => {
        setLoadingBarangays(true);
        try {
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
    } else {
      setBarangays([]);
    }
  }, [selectedCityCode]);

  // ---------------------------
  // Initialization from incoming formData (map names to codes)
  // ---------------------------
  useEffect(() => {
    if (regions.length > 0 && formData.region_address) {
      const region = regions.find((r) => r.name === formData.region_address);
      if (region) setSelectedRegionCode(region.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, formData.region_address]);

  useEffect(() => {
    if (provinces.length > 0 && formData.province_address) {
      const province = provinces.find((p) => p.name === formData.province_address);
      if (province) setSelectedProvinceCode(province.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinces, formData.province_address]);

  useEffect(() => {
    if (cities.length > 0 && formData.city_address) {
      const city = cities.find((c) => c.name === formData.city_address);
      if (city) setSelectedCityCode(city.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities, formData.city_address]);

  // ---------------------------
  // Derived: is selected region NCR?
  // ---------------------------
  const selectedRegion = regions.find((r) => r.code === selectedRegionCode);
  const isNCR =
    selectedRegion?.name?.toLowerCase().includes("national capital region") ||
    selectedRegionCode === "130000000";

  // ---------------------------
  // Validation helpers (kept minimal & non-invasive)
  // ---------------------------
  const validateRequired = (name, value) => {
    if (!value || !String(value).trim()) {
      setLocalErrors((prev) => ({ ...prev, [name]: "This field is required" }));
    } else {
      setLocalErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ---------------------------
  // Email handlers (format + uniqueness)
  // ---------------------------
  const handleEmailChange = (e) => {
    onChange(e);
    const v = e.target.value || "";
    if (!v.trim()) {
      setLocalErrors((p) => ({ ...p, email: "Email is required" }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setLocalErrors((p) => ({ ...p, email: "Invalid email address" }));
      return;
    }
    setLocalErrors((p) => ({ ...p, email: "" }));
  };

  const handleEmailBlur = async () => {
    const v = formData.email?.trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return;
    
    // Skip uniqueness check if email hasn't changed
    if (v === originalData.email?.trim()) {
      setLocalErrors((p) => ({ ...p, email: "" }));
      return;
    }
    
    try {
      const exists = await checkIfEmailExists(v);
      if (exists) setLocalErrors((p) => ({ ...p, email: "Email already exists" }));
    } catch (err) {
      console.error("checkIfEmailExists failed", err);
    }
  };

  // ---------------------------
  // Phone handlers (sanitize + uniqueness)
  // ---------------------------
  const sanitizePhone = (raw) => {
    if (!raw) return "09";
    let digits = String(raw).replace(/\D/g, "");
    if (!digits.startsWith("09")) {
      if (digits.startsWith("9")) digits = "0" + digits;
      else digits = "09" + digits.replace(/^0+/, "");
    }
    return digits.slice(0, 11);
  };

  const handlePhoneChange = (e) => {
    let raw = e.target.value || "";
    // allow only digits in edit field (we will sanitize into 09... form)
    if (!/^\d*$/.test(raw)) return;
    if (raw.length > 11) raw = raw.slice(0, 11);
    // we accept both raw partial digits and sanitized for final validation
    const sanitized = sanitizePhone(raw);
    onChange({ target: { name: "phone_Number", value: sanitized } });
    setLocalErrors((p) => ({
      ...p,
      phone_Number: /^09\d{9}$/.test(sanitized) ? "" : "Must be 11 digits and start with 09",
    }));
  };

  const handlePhoneBlur = async () => {
    const v = formData.phone_Number?.trim();
    if (!v || !/^09\d{9}$/.test(v)) return;
    
    // Skip uniqueness check if phone hasn't changed
    if (v === originalData.phone_Number?.trim()) {
      setLocalErrors((p) => ({ ...p, phone_Number: "" }));
      return;
    }
    
    try {
      const exists = await checkIfPhoneExists(v);
      if (exists)
        setLocalErrors((p) => ({ ...p, phone_Number: "Phone number already exists" }));
    } catch (err) {
      console.error("checkIfPhoneExists failed", err);
    }
  };

  // ---------------------------
  // Address select handlers (call onChange and validate locally)
  // ---------------------------
  const handleRegionSelect = (e) => {
    const regionCode = e.target.value;
    const selectedRegionObj = regions.find((r) => r.code === regionCode);
    const isRegionNCR =
      selectedRegionObj?.name?.toLowerCase().includes("national capital region") ||
      regionCode === "130000000";

    setSelectedRegionCode(regionCode);
    setSelectedProvinceCode("");
    setSelectedCityCode("");
    setBarangays([]);
    onChange({ target: { name: "region_address", value: selectedRegionObj?.name || "" } });
    onChange({ target: { name: "province_address", value: "" } });
    onChange({ target: { name: "city_address", value: "" } });
    onChange({ target: { name: "barangay_address", value: "" } });

    setLocalErrors((p) => ({ ...p, region_address: regionCode ? "" : "Region required" }));

    // load NCR cities if needed
    if (isRegionNCR) {
      setLoadingCities(true);
      fetchCitiesForNCR(regionCode)
        .then((data) => {
          setCities(data || []);
          setProvinces([]);
        })
        .catch((err) => {
          console.error("Failed to load NCR cities", err);
          setCities([]);
        })
        .finally(() => setLoadingCities(false));
    } else {
      // when region changed to non-NCR, attempt load provinces via effect above
      setProvinces([]);
      setCities([]);
    }
  };

  const handleProvinceSelect = (e) => {
    const code = e.target.value;
    const province = provinces.find((p) => p.code === code);
    setSelectedProvinceCode(code);
    setSelectedCityCode("");
    setBarangays([]);
    onChange({ target: { name: "province_address", value: province?.name || "" } });
    onChange({ target: { name: "city_address", value: "" } });
    onChange({ target: { name: "barangay_address", value: "" } });

    setLocalErrors((p) => ({ ...p, province_address: code ? "" : "Province required" }));
  };

  const handleCitySelect = (e) => {
    const code = e.target.value;
    const city = cities.find((c) => c.code === code);
    setSelectedCityCode(code);
    setBarangays([]);
    onChange({ target: { name: "city_address", value: city?.name || "" } });
    onChange({ target: { name: "barangay_address", value: "" } });
    setLocalErrors((p) => ({ ...p, city_address: code ? "" : "City required" }));
  };

  const handleBarangaySelect = (e) => {
    const val = e.target.value;
    onChange({ target: { name: "barangay_address", value: val } });
    setLocalErrors((p) => ({ ...p, barangay_address: val ? "" : "Barangay required" }));
  };

  // ---------------------------
  // Other simple field validators (names, street, zip)
  // ---------------------------
  const handleNameChange = (e) => {
    onChange(e);
    const name = e.target.name;
    const val = e.target.value;
    if (name === "first_Name" || name === "family_Name") {
      setLocalErrors((p) => ({ ...p, [name]: val?.trim() ? "" : "This field is required" }));
    }
  };

  const handleAddressChange = (e) => {
    onChange(e);
    const v = e.target.value;
    setLocalErrors((p) => ({ ...p, address: v?.trim() ? "" : "Street Address is required" }));
  };

  const handleZipChange = (e) => {
    let input = e.target.value || "";
    if (!/^\d*$/.test(input)) return;
    if (input.length > 4) input = input.slice(0, 4);
    onChange({ target: { name: "zip_code", value: input } });
    setLocalErrors((p) => ({ ...p, zip_code: "" }));
  };

  // ---------------------------
  // Final submit validation before calling parent onSubmit
  // ---------------------------
  const handleSubmit = async () => {
    const newErr = {};

    if (!formData.first_Name?.trim()) newErr.first_Name = "First Name is required";
    if (!formData.family_Name?.trim()) newErr.family_Name = "Last Name is required";
    if (!formData.address?.trim()) newErr.address = "Street Address is required";

    if (!formData.region_address) newErr.region_address = "Region is required";
    const regionObj = regions.find((r) => r.code === selectedRegionCode);
    const regionIsNCR =
      regionObj?.name?.toLowerCase().includes("national capital region") ||
      selectedRegionCode === "130000000";
    if (!regionIsNCR && !formData.province_address) newErr.province_address = "Province is required";
    if (!formData.city_address) newErr.city_address = "City is required";
    if (!formData.barangay_address) newErr.barangay_address = "Barangay is required";

    if (!formData.phone_Number?.trim()) newErr.phone_Number = "Phone number is required";
    else if (!/^09\d{9}$/.test(formData.phone_Number)) newErr.phone_Number = "Phone must be 11 digits and start with 09";

    if (!formData.email?.trim()) newErr.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErr.email = "Invalid email address";

    // merge into local state
    setLocalErrors((p) => ({ ...p, ...newErr }));

    const hasLocalErrors = Object.values({ ...localErrors, ...newErr }).some(Boolean);
    if (hasLocalErrors) return;

    // Email uniqueness check in handleSubmit
    try {
      if (formData.email && 
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
          formData.email.trim() !== originalData.email?.trim()) {
        const eExists = await checkIfEmailExists(formData.email.trim());
        if (eExists) {
          setLocalErrors((p) => ({ ...p, email: "Email already exists" }));
          return;
        }
      }
    } catch (err) {
      console.error("checkIfEmailExists failed", err);
    }

    // Phone uniqueness check in handleSubmit
    try {
      if (formData.phone_Number && 
          /^09\d{9}$/.test(formData.phone_Number) &&
          formData.phone_Number.trim() !== originalData.phone_Number?.trim()) {
        const pExists = await checkIfPhoneExists(formData.phone_Number.trim());
        if (pExists) {
          setLocalErrors((p) => ({ ...p, phone_Number: "Phone number already exists" }));
          return;
        }
      }
    } catch (err) {
      console.error("checkIfPhoneExists failed", err);
    }

    // All clear — call parent onSubmit
    await onSubmit();
  };

  // ---------------------------
  // Button disabled state uses mergedErrors + required fields
  // ---------------------------
  const hasErrors = Object.values(mergedErrors).some(Boolean);
  const requiredMissing =
    !formData.first_Name?.trim() ||
    !formData.family_Name?.trim() ||
    !formData.phone_Number?.trim() ||
    !formData.address?.trim() ||
    !formData.email?.trim();

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="client-update-container">
      <div className="form-card-client-update">
        <h2>Update Client Information</h2>

        <div className="form-grid-client-update">
          <div className="form-left-column-client-update">
            {/* --- Personal Info --- */}
            {[
              ["Prefix", "prefix"],
              ["First Name *", "first_Name", true],
              ["Middle Name", "middle_Name"],
              ["Last Name *", "family_Name", true],
              ["Suffix", "suffix"],
            ].map(([label, field, required]) => (
              <div className="form-group-client-update" key={field}>
                <label>{label}</label>
                <input
                  type="text"
                  value={originalData[field] ?? ""} // Use ?? "" for null/undefined
                  readOnly
                  className="original-value"
                  disabled
                />
                <input
                  type="text"
                  name={field}
                  value={formData[field] ?? ""}
                  onChange={
                    field === "first_Name" || field === "family_Name"
                      ? handleNameChange
                      : onChange
                  }
                />
                {required && mergedErrors[field] && (
                  <p style={{ color: "red" }}>{mergedErrors[field]}</p>
                )}
              </div>
            ))}

            {/* --- Contact Info --- */}
            <div className="form-group-client-update">
              <label>Phone Number *</label>
              <input
                type="text"
                value={originalData.phone_Number ?? ""}
                readOnly
                className="original-value"
                disabled
              />
              <input
                type="text"
                name="phone_Number"
                ref={phoneRef}
                value={formData.phone_Number ?? ""}
                onChange={handlePhoneChange}
                onBlur={handlePhoneBlur}
                placeholder="09XXXXXXXXX"
              />
              {mergedErrors.phoneExists && <p style={{ color: "red" }}>Phone number already exists</p>}
              {mergedErrors.phone_Number && <p style={{ color: "red" }}>{mergedErrors.phone_Number}</p>}
            </div>

            <div className="form-group-client-update">
              <label>Email *</label>
              <input
                type="text"
                value={originalData.email ?? ""}
                readOnly
                className="original-value"
                disabled
              />
              <input
                type="email"
                name="email"
                value={formData.email ?? ""}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
              />
              {mergedErrors.emailExists && <p style={{ color: "red" }}>Email already exists</p>}
              {mergedErrors.email && <p style={{ color: "red" }}>{mergedErrors.email}</p>}
            </div>

            {/* --- Address --- */}
            <div className="form-group-client-update">
              <label>Street Address / Unit No. *</label>
              <input
                type="text"
                value={originalData.address ?? ""}
                readOnly
                className="original-value"
                disabled
              />
              <input
                type="text"
                name="address"
                value={formData.address ?? ""}
                onChange={handleAddressChange}
              />
              {mergedErrors.address && <p style={{ color: "red" }}>{mergedErrors.address}</p>}
            </div>

            {/* --- Region --- */}
            <div className="form-group-client-update">
              <label>Region</label>
              <input
                type="text"
                value={originalData.region_address ?? ""}
                readOnly
                className="original-value"
                disabled
              />
              <select
                value={selectedRegionCode}
                onChange={handleRegionSelect}
                disabled={loadingRegions}
              >
                <option value="">
                  {loadingRegions ? "Loading..." : "Select Region"}
                </option>
                {regions.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
              {mergedErrors.region_address && <p style={{ color: "red" }}>{mergedErrors.region_address}</p>}
            </div>

            {/* --- Province (hidden for NCR) --- */}
            {!isNCR && (
              <div className="form-group-client-update">
                <label>Province</label>
                <input
                  type="text"
                  value={originalData.province_address ?? ""}
                  readOnly
                  className="original-value"
                  disabled
                />
                <select
                  value={selectedProvinceCode}
                  onChange={handleProvinceSelect}
                  disabled={!selectedRegionCode || loadingProvinces}
                >
                  <option value="">
                    {loadingProvinces ? "Loading..." : "Select Province"}
                  </option>
                  {provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {mergedErrors.province_address && <p style={{ color: "red" }}>{mergedErrors.province_address}</p>}
              </div>
            )}

            {/* --- City --- */}
            <div className="form-group-client-update">
              <label>City / Municipality</label>
              <input
                type="text"
                value={originalData.city_address ?? ""}
                readOnly
                className="original-value"
                disabled
              />
              <select
                value={selectedCityCode}
                onChange={handleCitySelect}
                disabled={loadingCities || (!isNCR && !selectedProvinceCode)}
              >
                <option value="">
                  {loadingCities ? "Loading..." : "Select City / Municipality"}
                </option>
                {cities.map((city) => (
                  <option key={city.code} value={city.code}>
                    {city.name}
                  </option>
                ))}
              </select>
              {mergedErrors.city_address && <p style={{ color: "red" }}>{mergedErrors.city_address}</p>}
            </div>

            {/* --- Barangay --- */}
            <div className="form-group-client-update">
              <label>Barangay</label>
              <input
                type="text"
                value={originalData.barangay_address ?? ""}
                readOnly
                className="original-value"
                disabled
              />
              <select
                value={formData.barangay_address ?? ""}
                onChange={handleBarangaySelect}
                disabled={!selectedCityCode || loadingBarangays}
              >
                <option value="">
                  {loadingBarangays ? "Loading..." : "Select Barangay"}
                </option>
                {barangays.map((b) => (
                  <option key={b.code} value={b.name}>
                    {b.name}
                  </option>
                ))}
              </select>
              {mergedErrors.barangay_address && <p style={{ color: "red" }}>{mergedErrors.barangay_address}</p>}
            </div>

            {/* Zip Code */}
            <div className="form-group-client-update">
              <label>Zip Code</label>
              <input
                type="text"
                value={originalData.zip_code ?? ""}
                readOnly
                className="original-value"
                disabled
              />
              <input
                type="tel"
                name="zip_code"
                value={formData.zip_code ?? ""}
                onChange={handleZipChange}
                placeholder="e.g., 1000"
                maxLength="4"
              />
              {mergedErrors.zip_code && <p style={{ color: "red" }}>{mergedErrors.zip_code}</p>}
            </div>

          </div>
        </div>

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
            onClick={handleSubmit}
            disabled={hasErrors || requiredMissing}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
