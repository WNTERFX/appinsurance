export default function Policy() {
    return(
        <div className="Policy-container">
            <div className="Policy-header">
                <p2>Policy</p2>
            </div>
            <div className="policy-data-field">
                    <table className="policy-table">
                        <thead>
                            <tr>
                                <th>Policy Number</th>
                                <th>Policy Holder</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>12345</td>
                                <td>John Doe</td>
                                <td>2023-01-01</td>
                                <td>2023-12-31</td>
                            </tr>
                            <tr>
                                <td>67890</td>
                                <td>Jane Smith</td>
                                <td>2023-02-01</td>
                                <td>2023-11-30</td>
                            </tr>
                        </tbody>
                    </table>

                </div>
            <div className="Policy-content">
               
                <div className="button-grid">
                    <button className="policy-btn">Create new</button>
                    <button className="policy-btn">Edit</button>
                </div>                  
            </div>
        </div>
    );
}