import { useNavigate } from "react-router-dom";
import ClientTableModerator from "./ClientTableModerator";
import FilterModerator from "./FilterModerator";
import './moderator-styles/policy-styles-moderator.css';
export default function PolicyModerator() {

    const navigate = useNavigate();

    return(
        <div className="Policy-container-moderator">
            <div className="Policy-header-moderator">
                <p2>Policy</p2>
                <input
                type="text"
                className="policy-search-moderator"
                placeholder="Search clients..."
                />

                <div className="filter-client-policy-moderator">
                    <FilterModerator />
                 </div>   
            </div>
            <div className="policy-data-field-moderator">
                <div className="control-options-moderator">
                   
                    <button className="print-btn-policy-moderator">Print</button>
                </div>
                 <ClientTableModerator/>
            </div>
            <div className="Policy-content-moderator">
               
                <div className="button-container-moderator">
                    <button className="policy-btn-moderator" onClick={() => navigate("/appinsurance/MainAreaModerator/PolicyModerator/NewClientModerator")}>Create new</button>
                   
                </div>                  
            </div>
        </div>
    );
}