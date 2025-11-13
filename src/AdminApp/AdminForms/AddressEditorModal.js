// src/AdminForms/AddressEditorModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import "../styles/address-picker.css";
import {
  createClientAddress,
  updateClientAddress,
} from "../AdminActions/ClientAddressActions";
import {
  fetchRegions,
  fetchProvinces,
  fetchCities,
  fetchBarangays,
  fetchCitiesForNCR,
} from "../AdminActions/PhilippineAddressAPI";

export default function AddressEditorModal({
  isOpen,
  clientUid,
  initial,   // null => add, object => edit
  onClose,
}) {
  const isEdit = !!(initial && initial.id);

  const [form, setForm] = useState({
    street_address: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    zip_code: "",
    is_delivered_address: false,
  });

  // lists
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);

  // PSGC codes bound to the selects
  const [regionCode, setRegionCode] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [cityCode, setCityCode] = useState("");

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    (async () => setRegions(await fetchRegions()))();
  }, [isOpen]);

  // load form from initial
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) {
      setForm({
        street_address: initial.street_address || "",
        region: initial.region || "",
        province: initial.province || "",
        city: initial.city || "",
        barangay: initial.barangay || "",
        zip_code: initial.zip_code ?? "",
        is_delivered_address: !!initial.is_delivered_address,
      });
    } else {
      setForm({
        street_address: "",
        region: "",
        province: "",
        city: "",
        barangay: "",
        zip_code: "",
        is_delivered_address: false,
      });
    }
    setRegionCode("");
    setProvinceCode("");
    setCityCode("");
  }, [isOpen, isEdit, initial]);

  const selectedRegion = useMemo(
    () => regions.find((r) => r.name === form.region || r.code === regionCode),
    [regions, form.region, regionCode]
  );
  const isNCR =
    selectedRegion?.name?.toLowerCase().includes("national capital region") ||
    selectedRegion?.code === "130000000";

  // ------- PRELOAD CODES ON EDIT (names -> PSGC codes) -------
  useEffect(() => {
    if (!isOpen || !isEdit) return;
    if (!regions.length) return;
    (async () => {
      // Region
      const r = regions.find(
        (x) => x.name.trim().toLowerCase() === (initial.region || "").trim().toLowerCase()
      );
      if (!r) return;
      setRegionCode(r.code);

      if (r.code === "130000000") {
        // NCR has no province layer
        const cList = await fetchCitiesForNCR();
        setCities(cList);
        const c = cList.find(
          (x) => x.name.trim().toLowerCase() === (initial.city || "").trim().toLowerCase()
        );
        if (c) {
          setCityCode(c.code);
          const bList = await fetchBarangays(c.code);
          setBarangays(bList);
        }
        return;
      }

      // Non-NCR: province -> city -> barangay
      const pList = await fetchProvinces(r.code);
      setProvinces(pList);
      const p = pList.find(
        (x) => x.name.trim().toLowerCase() === (initial.province || "").trim().toLowerCase()
      );
      if (!p) return;
      setProvinceCode(p.code);

      const cList = await fetchCities(p.code);
      setCities(cList);
      const c = cList.find(
        (x) => x.name.trim().toLowerCase() === (initial.city || "").trim().toLowerCase()
      );
      if (!c) return;
      setCityCode(c.code);

      const bList = await fetchBarangays(c.code);
      setBarangays(bList);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isEdit, regions]);

  // react to region selection (when adding)
  useEffect(() => {
    (async () => {
      if (!regionCode) {
        setProvinces([]); setCities([]); setBarangays([]); return;
      }
      if (isNCR) {
        setProvinces([]);
        setCities(await fetchCitiesForNCR());
      } else {
        setProvinces(await fetchProvinces(regionCode));
        setCities([]); setBarangays([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionCode]);

  // province -> cities (adding)
  useEffect(() => {
    (async () => {
      if (!provinceCode || isNCR) return;
      setCities(await fetchCities(provinceCode));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceCode]);

  // city -> barangays (adding)
  useEffect(() => {
    (async () => {
      if (!cityCode) { setBarangays([]); return; }
      setBarangays(await fetchBarangays(cityCode));
    })();
  }, [cityCode]);

  if (!isOpen) return null;

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const submit = async () => {
    // validation
    const req = ["street_address", "region", "city", "barangay"];
    if (!isNCR) req.splice(1, 0, "province");
    for (const k of req) {
      if (!String(form[k] || "").trim()) {
        alert(`Please fill in: ${k.replaceAll("_", " ")}`);
        return;
      }
    }
    if (form.zip_code && !/^\d{4}$/.test(String(form.zip_code))) {
      alert("ZIP Code must be 4 digits");
      return;
    }

    setBusy(true);
    try {
      if (isEdit) {
        await updateClientAddress(initial.id, form);
      } else {
        await createClientAddress(clientUid, form);
      }
      onClose(true);
    } catch (e) {
      alert("Failed to save address: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="addrpkr-overlay nested" onClick={() => onClose(false)}>
      <div className="addrpkr-editor" onClick={(e) => e.stopPropagation()}>
        <button className="addrpkr-close" onClick={() => onClose(false)}>✕</button>
        <h3 className="addrpkr-subtitle">{isEdit ? "Edit Address" : "Add Address"}</h3>

        <div className="addrpkr-grid">
          <label>Street Address/ Unit No.</label>
          <input
            value={form.street_address}
            onChange={(e) => setField("street_address", e.target.value)}
          />

          <label>Region</label>
          <select
            value={regionCode || ""}
            onChange={(e) => {
              setRegionCode(e.target.value);
              const picked = regions.find((r) => r.code === e.target.value);
              setField("region", picked?.name || "");
              setField("province", ""); setField("city", ""); setField("barangay", "");
              setProvinceCode(""); setCityCode("");
            }}
          >
            <option value="">Select Region</option>
            {regions.map((r) => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>

          {!isNCR && (
            <>
              <label>Province</label>
              <select
                value={provinceCode || ""}
                onChange={(e) => {
                  setProvinceCode(e.target.value);
                  const picked = provinces.find((p) => p.code === e.target.value);
                  setField("province", picked?.name || "");
                  setField("city", ""); setField("barangay", "");
                  setCityCode("");
                }}
                disabled={!regionCode}
              >
                <option value="">Select Province</option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </>
          )}

          <label>Municipality</label>
          <select
            value={cityCode || ""}
            onChange={(e) => {
              setCityCode(e.target.value);
              const picked = cities.find((c) => c.code === e.target.value);
              setField("city", picked?.name || "");
              setField("barangay", "");
            }}
            disabled={(!isNCR && !provinceCode) || !regionCode}
          >
            <option value="">Select City/Municipality</option>
            {cities.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>

          <label>Barangay</label>
          <select
            value={form.barangay}
            onChange={(e) => setField("barangay", e.target.value)}
            disabled={!cityCode}
          >
            <option value="">Select Barangay</option>
            {barangays.map((b) => (
              <option key={b.code} value={b.name}>{b.name}</option>
            ))}
          </select>

          <label>ZIP Code</label>
          <input
            value={form.zip_code ?? ""}
            onChange={(e) => setField("zip_code", e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="e.g., 1106"
          />

         {/* {!isEdit && (
            <label className="addrpkr-checkbox">
              <input
                type="checkbox"
                checked={!!form.is_delivered_address}
                onChange={(e) => setField("is_delivered_address", e.target.checked)}
              />
              Set as delivered Address
            </label>
          )}*/}
        </div>

        <div className="addrpkr-footer">
          <button className="addrpkr-cancel" onClick={() => onClose(false)}>Cancel</button>
          <button className="addrpkr-submit" onClick={submit} disabled={busy}>
            {busy ? "Saving…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
