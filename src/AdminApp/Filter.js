
import React, { useState } from "react";
export default function Filter() {

     const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

    return (
        <div>
            <select id="company-select" value={selectedValue} onChange={handleChange}>
                        <option value="cocogen">COCOGEN</option>
                        <option value="stronghold">STRONGHOLD</option>
                        <option value="mercantile">MERCANTILE</option>
                        <option value="standard">STANDARD</option>
                    </select>
        </div>
    );
}

