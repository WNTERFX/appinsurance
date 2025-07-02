import './moderator-styles/claims-table-styles-moderator.css';
import FilterModerator from './FilterModerator';
export default function ClaimTable() {

    return(
     <div className="claims-records-container-moderator">
            <div className="claims-record-header-moderator">
                <p>Claims</p>
                <input
                type="text"
                className="claims-record-search-moderator"
                placeholder="Search clients..."
                />

                 <div className="filter-client-claims-moderator">
                    <FilterModerator />
                 </div>   
              
            </div>
            <div className="claims-records-content-moderator">
            <div className="claims-data-field-moderator">
                <div className="control-options-claims-moderator">
                    <button className="print-btn-claims-moderator">Print</button>
                </div>
            
                <div className="claims-table-moderator"> 
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