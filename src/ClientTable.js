import React from 'react';
import './styles/client-table-styles.css';

export default function ClientTable() {

    return(
        <div className="client-table"> 
            <table>
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>Client Name</th>
                        <th>Partner Company</th>
                        <th>Client Status</th>
                        <th>Client Registered</th>

                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>John Doe</td>
                        <td>Cocogen</td>
                        <td>Active</td>
                        <td>2025-10-01</td>
                    </tr>
                </tbody>
            </table>                        
        </div>
    );
}