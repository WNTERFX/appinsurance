import { useNavigate } from "react-router-dom";
import './styles/ListClient.css';

export default function ListClient() {
    const navigates = useNavigate();
    return (
        <div className="client-list-container">
        <h2>List Client</h2>
  
        <div className="client-list-box">
          <div className="edit-button-wrapper">
            <button className="edit-button" onClick={() => navigates("/appinsurance/MainArea/Policy/ListClient/EditClientForm")}>Edit</button>
          </div>
  
          <div className="client-list" >
            <table className="client-table"> 
              <tr> 
                <th>Policy Number</th>
                <th>Policy Holder</th>
                <th>Start Date</th>
                <th>End Date</th>
               
              </tr> 
              <tr>
                 
                <td>12345</td>
                <td>John Doe</td>
                <td>2023-01-01</td>
                <td>2023-12-31</td>
                <input type="checkbox" />
              </tr>
              <tr>
                <td>67890</td>
                <td>Jane Smith</td>
                <td>2023-02-01</td>
                <td>2023-11-30</td>
                <input type="checkbox" />
              </tr>
              <tr>
                <td>11223</td>
                <td>Bob Johnson</td>
                <td>2023-03-01</td>
                <td>2023-10-31</td>
                <input type="checkbox" />
              </tr>
            </table>
          </div>
      </div>
      </div>
    );
}