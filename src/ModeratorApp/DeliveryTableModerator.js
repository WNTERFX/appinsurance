import './moderator-styles/delivery-table-styles-moderator.css';
import FilterModerator from './FilterModerator';
export default function DeliveryTableModerator() {

    return(
     <div className="delivery-records-container-moderator">
            <div className="delivery-record-header-moderator">
                <p>Delivery</p>
                <input
                type="text"
                className="delivery-record-search-moderator"
                placeholder="Search clients..."
                />
                 <div className="filter-client-delivery-moderator">
                    <FilterModerator />
                </div>   
              
            </div>
            <div className="delivery-records-content-moderator">
            <div className="delivery-data-field-moderator">
                <div className="control-options-delivery-moderator">
                     <button className="disapprove-btn-delivery-moderator">Edit</button>
                     <button className="print-btn-delivery-moderator">Print</button>
                </div>
            
                <div className="delivery-table-moderator"> 
                <table>
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Client Name</th>
                            <th>Agent</th>
                            <th>Partner Company</th>
                            <th>Address</th>
                            <th>Phone Number</th>
                            <th>Set Delivery Date</th>
                            <th>Delivered Date</th>
                            <th>Remarks</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>Lily Bon</td>
                            <td>Cocogen</td>
                            <td>123 Main St, Quezon City</td>
                            <td>123-456-7890</td>
                            <td>2025-10-01</td>
                            <td>2025-12-01</td>
                            <td>Delivered</td>
                        </tr>
                    </tbody>
                </table>
                </div>     
            </div>
            
            </div>  
    </div>
    );
}