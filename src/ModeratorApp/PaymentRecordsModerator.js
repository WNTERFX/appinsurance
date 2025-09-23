
import './moderator-styles/payment-records-styles-moderator.css';
import FilterModerator from './FilterModerator';

export default function PaymentRecordsModerator() {

    return (
        <div className="payment-records-container-moderator">
              <div className="payment-record-header-moderator">
                <p>Payment Records</p>
                <input
                type="text"
                className="record-search-moderator"
                placeholder="Search clients..."
                />

                    <div className="filter-client-payment-moderator">
                       <FilterModerator />
                    </div>   
            </div>

            <div className="payment-records-content-moderator">
                <div className="policy-data-field-moderator">
                    <div className="control-options-moderator">
                        <button className="disapprove-btn-policy-moderator">Edit</button>
                        <button className="print-btn-policy-moderator">Print</button>
                    </div>
                <div className="client-payment-table-moderator"> 
                <table>
                    <thead>
                        <tr>
                            <th>Client ID</th>
                            <th>Client Name</th>
                            <th>Partner Company</th>
                            <th>Client Registered</th>
                            <th>Month</th>
                            <th>Client Payment Status</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>Cocogen</td>
                            <td>2025-10-01</td>
                            <td>January</td>
                            <td>Paid</td>
                        </tr>
                          <tr>
                            <td>2</td>
                            <td>Jane</td>
                            <td>Cocogen</td>
                            <td>2025-10-01</td>
                            <td>January</td>
                            <td>Not Paid</td>
                        </tr>
                    </tbody>
                </table>                        
            </div>
            </div>
             
            </div>
        </div>
    );
} 