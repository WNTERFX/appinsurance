import React from 'react';
import { useNavigate } from "react-router-dom";
import { BarChart } from '@mui/x-charts/BarChart';

export default function Dashboard() {
    
    const navigate = useNavigate();

    

    return (
        <div className="dashboard-container">
            
            <div className="dashboard-header">
                <p>Dashboard</p>
            </div>
            
            <div className="dashboard-content">

                <div className ="active-clients">
                    
                    <div className="active-clients-data">
                        <h2>Active Clients</h2>
                        
                        <p>150</p>
                    </div>
                </div>

                <div className ="due-clients">
                    
                    <div className="due-clients-data">
                        <h2>Due Clients</h2>
                        <p>50</p>
                    </div>
                </div>

                <div className="clients-list" 
                    onClick={() =>  navigate("/appinsurance/MainArea/Client")} 
                    style={{ cursor: "pointer" }}>  
     
                    
                    <div className="clients-list-data">
                        <h2>Clients List</h2>
                        
                        <div className="dashboard-table">
                        <table > 
                            <tr> 
                                <th>Policy Number</th>
                                <th>Agent</th>
                                <th>Policy Holder</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                            </tr> 
                            <tr>
                                 
                                <td>12345</td>
                                <td>Lily Bon</td>
                                <td>John Doe</td>
                                <td>2023-01-01</td>
                                <td>2023-12-31</td>
                            </tr>
                           
                         </table>    

                         </div> 
                         
                    </div>
                </div>

                <div className="undelivered-policy">
                    
                    <div className="undelivered-policy-data">
                        <h2>Undelivered Policy</h2>
                        <p>10</p>
                    </div>
                </div>

                <div className="delivered-policy">
                    
                    <div className="delivered-policy-data">
                        <h2>Delivered Policy</h2>
                        <p>140</p>
                    </div>
                </div>

                <div className="recent-policy">
                    
                    <div className="recent-policy-data">
                        <h2>Recent Policy</h2>
                         <div className="dashboard-table">
                         <table>
                            
                            <tbody>
                            <tr>
                                <td>1001</td>
                                <td>Jane Smith</td>
                                <td>2023-12-01</td>
                            </tr>
                           
                            </tbody>
                        </table>
                        </div>
                     </div>
                </div>

                <div className="monthly-data">
                    Monthly Data
                    <div className="monthly-data-chart">
                        <h2>Monthly Data</h2>
                        <BarChart
                           xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                           series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                           height={200}
                           width={1000}
                        />    
                    </div>
                </div>

            </div>
        </div>
    );
}