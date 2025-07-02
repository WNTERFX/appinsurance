
import ClientTableModerator from "./ClientTableModerator";
import FilterModerator from "./FilterModerator"; 
import './moderator-styles/client-styles-moderator.css';

export default function ClientModerator() {
    return(
        <div className="Client-container-moderator ">
            <div className="Client-header-moderator ">
                <p2>Client</p2>
                <input
                type="text"
                className="client-search-moderator "
                placeholder="Search clients..."
                />

                <div className="filter-client-moderator ">
                   <FilterModerator />
                </div>   
            </div>


           
            <div className="Client-content-moderator">
                
                <div className="Agents-moderator">
                    Lily bon                    
                        <p>Total Client</p>
                        <p>Client_Count</p>
                </div>
              
             
            </div>

            <div className="client-table-container-moderator "> 
                <ClientTableModerator />
            </div>
        </div>
    );
}