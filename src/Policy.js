import { useNavigate } from "react-router-dom";

export default function Policy() {
    const navigate = useNavigate();

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
                    <button className="policy-btn" onClick={() => navigate("/appinsurance/MainArea/Policy/NewClient")}>Create new</button>
                    <button className="policy-btn" onClick={() => navigate("/appinsurance/MainArea/Policy/ListClient")}>Edit</button>
                </div>                  
            </div>
        </div>
    );
}