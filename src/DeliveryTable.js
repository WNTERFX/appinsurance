import './styles/delivery-table-styles.css';
import Filter from './Filter';
export default function DeliveryTable() {

    return(
     <div className="delivery-records-container">
            <div className="delivery-record-header">
                <p>Delivery</p>
                <input
                type="text"
                className="delivery-record-search"
                placeholder="Search clients..."
                />
                 <div className="filter-client-delivery">
                    <Filter />
                </div>   
              
            </div>
            <div className="delivery-records-content">
            <div className="delivery-data-field">
                <div className="control-options-delivery">
                    <button className="approve-btn-delivery">Approve</button>
                    <button className="disapprove-btn-delivery">Edit</button>
                     <button className="print-btn-delivery">Print</button>
                </div>
            
                <div className="delivery-table"> 
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