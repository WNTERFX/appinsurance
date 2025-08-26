import { useNavigate } from "react-router-dom";
import ClientTable from "./AdminTables/ClientTable";
import Filter from "./Filter";
export default function Policy() {
    const navigate = useNavigate();

    return(
        <div className="Policy-container">
            <div className="Policy-header">
                <p2>Policy</p2>
                <input
                type="text"
                className="policy-search"
                placeholder="Search clients..."
                />

                <div className="filter-client-policy">
                    <Filter />
                 </div>   
            </div>
            <div className="policy-data-field">
                <div className="control-options">
                    <button className="approve-btn-policy">Approve</button>
                    <button className="print-btn-policy">Print</button>
                </div>
                 <ClientTable/>
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