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
import CustomConfirmModal from "./CustomConfirmModal";

export default function ClientEditForm({
  originalData,
  formData,
  errors = {},
  onChange,
  onSubmit,
  onClose,
  isSubmitting = false,
}) {
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  const [selectedRegionCode, setSelectedRegionCode] = useState("");
  const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
  const [selectedCityCode, setSelectedCityCode] = useState("");

  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Add state for modal
  const [showModal, setShowModal] = useState(false);

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

  const mergedErrors = { ...(errors || {}), ...(localErrors || {}) };
  const phoneRef = useRef(null);

  // Load regions only once on mount
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

  // Initialize form data based on existing address - only run once when regions are loaded
  useEffect(() => {
    if (regions.length === 0 || isInitialized) return;

    const initializeAddress = async () => {
      if (!formData.region_address) return;

      const region = regions.find((r) => r.name === formData.region_address);
      if (!region) return;

      setSelectedRegionCode(region.code);

      const isNCR =
        region.name?.toLowerCase().includes("national capital region") ||
        region.code === "130000000";

      try {
        if (isNCR) {
          const citiesData = await fetchCitiesForNCR(region.code);
          setCities(citiesData || []);
          setProvinces([]);

          if (formData.city_address) {
            const city = citiesData?.find((c) => c.name === formData.city_address);
            if (city) {
              setSelectedCityCode(city.code);
              const barangaysData = await fetchBarangays(city.code);
              setBarangays(barangaysData || []);
            }
          }
        } else {
          const provincesData = await fetchProvinces(region.code);
          setProvinces(provincesData || []);
          setCities([]);

          if (formData.province_address) {
            const province = provincesData?.find((p) => p.name === formData.province_address);
            if (province) {
              setSelectedProvinceCode(province.code);
              const citiesData = await fetchCities(province.code);
              setCities(citiesData || []);

              if (formData.city_address) {
                const city = citiesData?.find((c) => c.name === formData.city_address);
                if (city) {
                  setSelectedCityCode(city.code);
                  const barangaysData = await fetchBarangays(city.code);
                  setBarangays(barangaysData || []);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error initializing address data:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAddress();
  }, [regions, formData.region_address, formData.province_address, formData.city_address, isInitialized]);

  // Load provinces or cities when region changes (user interaction)
  useEffect(() => {
    if (!isInitialized) return;

    const loadRegionData = async () => {
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
  }, [selectedRegionCode, regions, isInitialized]);

  // Load cities for non-NCR provinces (user interaction)
  useEffect(() => {
    if (!isInitialized) return;

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
  }, [selectedProvinceCode, selectedRegionCode, regions, isInitialized]);

  // Load barangays when city changes (user interaction)
  useEffect(() => {
    if (!isInitialized) return;

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
  }, [selectedCityCode, isInitialized]);

  const selectedRegion = regions.find((r) => r.code === selectedRegionCode);
  const isNCR =
    selectedRegion?.name?.toLowerCase().includes("national capital region") ||
    selectedRegionCode === "130000000";

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
    if (!/^\d*$/.test(raw)) return;
    if (raw.length > 11) raw = raw.slice(0, 11);
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

  const handleRegionSelect = (e) => {
    const regionCode = e.target.value;
    const selectedRegionObj = regions.find((r) => r.code === regionCode);

    setSelectedRegionCode(regionCode);
    setSelectedProvinceCode("");
    setSelectedCityCode("");
    setBarangays([]);
    onChange({ target: { name: "region_address", value: selectedRegionObj?.name || "" } });
    onChange({ target: { name: "province_address", value: "" } });
    onChange({ target: { name: "city_address", value: "" } });
    onChange({ target: { name: "barangay_address", value: "" } });

    setLocalErrors((p) => ({ ...p, region_address: regionCode ? "" : "Region required" }));
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

  // Modified: This now just validates and shows the modal
  const handleUpdateClick = () => {
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

    setLocalErrors((p) => ({ ...p, ...newErr }));

    const hasLocalErrors = Object.values({ ...localErrors, ...newErr }).some(Boolean);
    if (hasLocalErrors) return;

    // Show the modal instead of submitting directly
    setShowModal(true);
  };

  // New: Handle modal confirmation
  const handleModalConfirm = async () => {
    await onSubmit();
    // Modal will close automatically via onClose in CustomConfirmModal
  };

  // New: Handle modal cancel
  const handleModalCancel = () => {
    setShowModal(false);
  };

  const hasErrors = Object.values(mergedErrors).some(Boolean);
  const requiredMissing =
    !formData.first_Name?.trim() ||
    !formData.family_Name?.trim() ||
    !formData.phone_Number?.trim() ||
    !formData.address?.trim() ||
    !formData.email?.trim();

  return (
    <>
      <div className="client-update-container">
        <div className="form-card-client-update">
          <h2>Update Client Information</h2>

          <div className="form-grid-client-update">
            <div className="form-left-column-client-update">
              {[
                ["Prefix (optional)", "prefix"],
                ["First Name", "first_Name", true],
                ["Middle Name (optional)", "middle_Name"],
                ["Last Name *", "family_Name", true],
                ["Suffix (optional)", "suffix"],
              ].map(([label, field, required]) => (
                <div className="form-group-client-update" key={field}>
                  <label>{label}</label>
                  <input
                    type="text"
                    value={originalData[field] ?? ""}
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
                    disabled={isSubmitting}
                  />
                  {required && mergedErrors[field] && (
                    <p style={{ color: "red" }}>{mergedErrors[field]}</p>
                  )}
                </div>
              ))}

              <div className="form-group-client-update">
                <label>Phone Number</label>
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
                  disabled={isSubmitting}
                />
                {mergedErrors.phoneExists && <p style={{ color: "red" }}>Phone number already exists</p>}
                {mergedErrors.phone_Number && <p style={{ color: "red" }}>{mergedErrors.phone_Number}</p>}
              </div>

              <div className="form-group-client-update">
                <label>Email</label>
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
                  disabled={isSubmitting}
                />
                {mergedErrors.emailExists && <p style={{ color: "red" }}>Email already exists</p>}
                {mergedErrors.email && <p style={{ color: "red" }}>{mergedErrors.email}</p>}
              </div>

              <div className="form-group-client-update">
                <label>Street Address / Unit No.</label>
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
                  disabled={isSubmitting}
                />
                {mergedErrors.address && <p style={{ color: "red" }}>{mergedErrors.address}</p>}
              </div>

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
                  disabled={loadingRegions || isSubmitting}
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
                    disabled={!selectedRegionCode || loadingProvinces || isSubmitting}
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
                  disabled={loadingCities || (!isNCR && !selectedProvinceCode) || isSubmitting}
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
                  disabled={!selectedCityCode || loadingBarangays || isSubmitting}
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
                  disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              className="submit-btn-client-update"
              type="button"
              onClick={handleUpdateClick}
              disabled={hasErrors || requiredMissing || isSubmitting}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>

      {/* Add the modal */}
      <CustomConfirmModal
        isOpen={showModal}
        onClose={handleModalCancel}
        onConfirm={handleModalConfirm}
        title="Identity Verification"
        message="I have verified this client's identity and has authorized me to proceed"
      />
    </>
  );
}