
import './styles/payment-records-styles.css';
import Filter from './Filter';
export default function PaymentRecords() {

    return (
        <div className="payment-records-container">
              <div className="payment-record-header">
                <p>Payment Records</p>
                <input
                type="text"
                className="record-search"
                placeholder="Search clients..."
                />

                    <div className="filter-client-payment">
                       <Filter />
                    </div>   
            </div>

            <div className="payment-records-content">
                <div className="policy-data-field">
                    <div className="control-options">
                        <button className="approve-btn-policy">Approve</button>
                        <button className="disapprove-btn-policy">Edit</button>
                        <button className="print-btn-policy">Print</button>
                    </div>
                <div className="client-payment-table"> 
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