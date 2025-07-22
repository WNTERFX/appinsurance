import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';

export default function Dashboard() {
    
    return (
        <div className="dashboard-container">
            
            <div className="dashboard-header">
                <p>Dashboard</p>
            </div>

            <div className="dashboard-content">

                <div className ="active-clients">
                    Active Clients
                    <div className="active-clients-data">
                        <h2>Active Clients</h2>
                        <p>Number of active clients: 150</p>
                    </div>
                </div>

                <div className ="due-clients">
                    Due Clients
                    <div className="due-clients-data">
                        <h2>Due Clients</h2>
                        <p>Number of due clients: 50</p>
                    </div>
                </div>

                <div className="clients-list">  
                    Clients List
                    <div className="clients-list-data">
                        <h2>Clients List</h2>
                        <ul>
                            <li>Client 1</li>
                            <li>Client 2</li>
                            <li>Client 3</li>
                            <li>Client 4</li>
                            <li>Client 5</li>
                        </ul>
                    </div>
                </div>

                <div className="undelivered-policy">
                    Undelivered Policy
                    <div className="undelivered-policy-data">
                        <h2>Undelivered Policy</h2>
                        <p>Number of undelivered policies: 10</p>
                    </div>
                </div>

                <div className="delivered-policy">
                    Delivered Policy
                    <div className="delivered-policy-data">
                        <h2>Delivered Policy</h2>
                        <p>Number of delivered policies: 140</p>
                    </div>
                </div>

                <div className="recent-policy">
                    Recent Policy
                    <div className="recent-policy-data">
                        <h2>Recent Policy</h2>
                        <ul>
                            <li>Policy 1</li>
                            <li>Policy 2</li>
                            <li>Policy 3</li>
                            <li>Policy 4</li>
                            <li>Policy 5</li>
                        </ul>
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