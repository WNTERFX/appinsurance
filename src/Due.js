

import ClientTableDue from './ClientTableDue';
import Filter from './Filter';
export default function Due() {
    return(
        <div className="Due-container">
            <div className="Due-header">
                <p2>Due</p2>
                <input
                type="text"
                className="due-search"
                placeholder="Search clients..."
                />
                <div className="filter-client-due">
                    <Filter />
                </div>   
            </div>

            <div className="Due-content">
                
                <div className="Due-total">
                    Lily bon                    
                        <p>Total Due : ??</p>
                        <button className="view-all-client-button">View All</button>                        
                </div>
                <div className="Due-total">
                    Sales Agent                  
                        <p>Total Due : ??</p>
                        <button className="view-all-client-button">View All</button>    
                </div>
                <div className="Due-total">
                    Sales Agent                  
                        <p>Total Due : ??</p>
                        <button className="view-all-client-button">View All</button>    
                </div>


            </div>

            <div className="client-table-container"> 
                <ClientTableDue/>        
            </div>
        </div>
    );
}