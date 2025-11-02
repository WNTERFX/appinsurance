
import './moderator-styles/client-table-due-styles-moderator.css';

export default function ClientTableDueModerator() {

    return( 
        
        <div className="client-table-moderator"> 
            <table>
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>Client Name</th>
                        <th>Agent</th>
                        <th>Partner Company</th>
                        <th>Client Registered</th>
                        <th>Client Due</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1</td>
                        <td>John Doe</td>
                        <td>Lily Bon</td>
                        <td>Cocogen</td>
                        <td>2025-10-01</td>
                        <td>2025-11-01</td>
                    </tr>

                       <tr>
                        <td>2</td>
                        <td>Jane Doe</td>
                        <td>Lily Bon</td>
                        <td>Cocogen</td>
                        <td>2025-10-01</td>
                        <td>2025-11-01</td>
                    </tr>
                </tbody>
            </table>                        
        </div>
    );
}