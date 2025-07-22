import React, { useState } from "react";
import { BarChart } from '@mui/x-charts/BarChart';
import Filter from './Filter';
import MonthlyDataPartners from './MonthlyDataPartners';
import MonthlyDataAgents from './MonthlyDataAgents';

import './styles/monthly-styles.css'; 
export default function MonthlyData() {

    const [view, setView] = useState("partners");
    return (

        <div className="monthly-data-container">
            <div className="monthly-data-header">
                <p>Monthly Data</p>
                <input
                    type="text"
                    className="monthly-data-search"
                    placeholder="Search clients..."
                />

                <div>
                   <Filter />
                </div>
            </div>

            <div className="monthly-data-buttons">
                <button onClick={() => setView("partners")}>Monthly View</button>
                <button onClick={() => setView("agent")}>Agent View</button>
            </div>

            <div className='data-area'>
                 {view === "partners" ? <MonthlyDataPartners /> : <MonthlyDataAgents />}
            </div>
           

            <div className="graph-container">
                <p>Insurance</p>
                <div className="graph">
                   <BarChart
                           xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                           series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                           height={200}
                           width={1000}
                        />    
                </div>
            </div>
        </div>
    );

}