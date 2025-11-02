import { usePartners } from "./AdminActions/FilterActions";
import React, { useState } from "react";
export default function Filter() {


  
     
  const { partners, loading, selected, selectPartner } = usePartners();
  const [selectedValue, setSelectedValue] = React.useState("");

  


  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

    return (
      <select
        id="company-select"
        value={selected}
        onChange={(e) => selectPartner(e.target.value)}
      >
        <option value="">-- Select a Partner --</option>
        {partners.map((p, i) => (
          <option key={i} value={p.insurance_Name}>
            {p.insurance_Name}
          </option>
        ))}
      </select>
  );
}

