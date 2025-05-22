
import ClientTable from "./ClientTable";
import Filter from "./Filter";
export default function Client() {
    return(
        <div className="Client-container">
            <div className="Client-header">
                <p2>Client</p2>
                <input
                type="text"
                className="client-search"
                placeholder="Search clients..."
                />

                <div className="filter-client">
                    <Filter />
                </div>   
            </div>

            <div className="Client-content">
                
                <div className="Agents">
                    Lily bon                    
                        <p>Total Client : ??</p>
                        <button className="view-all-client-button">View All</button>                    
                </div>
                <div className="Agents">
                    Sales Agent                  
                        <p>Total Client : ??</p>
                        <button className="view-all-client-button">View All</button>     
                </div>
                <div className="Agents">
                    Sales Agent                 
                        <p>Total Client : ??</p>
                        <button className="view-all-client-button">View All</button>     
                </div>
            </div>

            <div className="client-table-container"> 
                <ClientTable/>
            </div>
        </div>
    );
}