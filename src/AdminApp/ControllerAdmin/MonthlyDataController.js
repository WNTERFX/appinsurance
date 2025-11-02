import { useState } from "react";
import MonthlyData from "../MonthlyData";

export default function MonthlyDataController() {

    const [view, setView] = useState("partners");
    
    return (
        <MonthlyData 
        view={view} 
        setView={setView} 
        />
    );
}