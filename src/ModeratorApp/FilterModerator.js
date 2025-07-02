
import React, { useState } from "react";
export default function FilterModerator() {

     const [selectedValue, setSelectedValue] = useState("");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

    return (
        <div>
            <select id="company-select-moderator" value={selectedValue} onChange={handleChange}>
                        <option value="cocogen">COCOGEN</option>
                        <option value="stronghold">STRONGHOLD</option>
                        <option value="mercantile">MERCANTILE</option>
                        <option value="standard">STANDARD</option>
                    </select>
        </div>
    );
}

