import './styles/claims-table-styles.css';
import Filter from './Filter';
export default function ClaimTable() {

    return(
     <div className="claims-records-container">
            <div className="claims-record-header">
                <p>Claims</p>
                <input
                type="text"
                className="claims-record-search"
                placeholder="Search clients..."
                />

                 <div className="filter-client-claims">
                    <Filter />
                 </div>   
              
            </div>
            <div className="claims-records-content">
            <div className="claims-data-field">
                <div className="control-options-claims">
                    <button className="approve-btn-claims">Approve</button>
                    <button className="disapprove-btn-claims">Edit</button>
                    <button className="print-btn-claims">Print</button>
                </div>
            
                <div className="claims-table"> 
                <table>
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Client Name</th>
                            <th>Agent</th>
                            <th>Partner Company</th>
                            <th>Incident Date</th>
                            <th>Claim Date</th>
                            <th>Claim Amount</th>
                            <th>Approved Amount</th>
                            <th>Remarks</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>Lily Bon</td>
                            <td>Cocogen</td>
                            <td>2025-20-01</td>
                            <td>2025-21-01</td>
                            <td>PHP 20000</td>
                            <td>PHP 20000</td>
                            <td>Approved</td>
                        </tr>
                          <tr>
                            <td>2</td>
                            <td>Jane Doe</td>
                            <td>Lily Bon</td>
                            <td>Cocogen</td>
                            <td>-------</td>
                            <td>-------</td>
                            <td>PHP 0</td>
                            <td>PHP 0</td>
                            <td>Pending</td>
                        </tr>
                    </tbody>
                </table>
                </div>     
            </div>
            
            </div>  
    </div>
    );
}