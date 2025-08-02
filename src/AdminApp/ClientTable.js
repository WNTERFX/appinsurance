import React from 'react';
import './styles/client-table-styles.css';

export default function ClientTable() {


    // this should be a function that handles the click event for the row
    // for now, it will just pop-up an alert message
    const handleClick = () => {
    alert('Row Test Clicked!');
    };

    return(
        <div className="client-table"> 
            <table>
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>Client Name</th>
                        <th>Agent</th>
                        <th>Insurance Partner</th>
                        <th>Address</th>
                        <th>Phone Number</th>
                        <th>Vehicle</th>
                        <th>Client Status</th>
                        <th>Client Registered</th>
                        <th>Policy Exception </th>
                        <th>Policy Expiration</th>
                        <th>Remarks</th>

                    </tr>
                </thead>
                <tbody>
                    <tr onClick={handleClick} style={{ cursor: 'pointer' }}>
                        // When the row is clicked, it should display an overlay with more details of the client
                        <td>1</td>
                        <td>John Doe</td>
                        <td>Lily Bon</td>
                        <td>Cocogen</td>
                        <td>123 Main St, Quezon City</td>
                        <td>123-456-7890</td>
                        <td>Toyota Vios</td>
                        <td>Active</td>
                        <td>2025-10-01</td>
                        <td>2025-10-01</td>
                        <td>2026-10-01</td>
                        <td>Approved</td>
                    </tr>
                </tbody>

                  <tbody>
                    <tr>
                        <td>2</td>
                        <td>Jane Doe</td>
                        <td>Lily Bon</td>
                        <td>Cocogen</td>
                        <td>123 Main St, Quezon City</td>
                        <td>123-456-7890</td>
                        <td>Toyota Vios</td>
                        <td>Active</td>
                        <td>2025-10-01</td>
                        <td>-------</td>
                        <td>-------</td>
                        <td>Pending</td>
                    </tr>
                </tbody>
            </table>                        
        </div>
    );
}