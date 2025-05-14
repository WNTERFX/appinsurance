import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import './styles/monthly-styles.css'; 
export default function MonthlyData() {
    return (


        <div className="monthly-data-container">
            <p>Montly Data</p>

            <div className="client-counter-container">
                <div className="total-clients">
                    <h2>Total Clients</h2>
                    <p>100</p>
                </div>
                <div className="partner-item">
                    <h2>COCOGEN INSURANCE CO.</h2>
                    <div className="partner-info">
                        <p>50 🟩</p>
                        
                    </div>   
                    
                </div>
                <div className="partner-item">
                    <h2>STRONGHOLD CO.</h2>
                      <div className="partner-info">
                        <p>50 🟦</p>
                        
                    </div>   
                </div>
                <div className="partner-item">
                    <h2>THE MERCANTILE INSURANCE CO.</h2>
                      <div className="partner-info">
                        <p>50 🟪</p>

                    </div>   
                </div>
                <div className="partner-item">
                    <h2>STANDARD INSURANCE CO.</h2>
                      <div className="partner-info">
                        <p>50 🟥</p>

                    </div>   
                </div>
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