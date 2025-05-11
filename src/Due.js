import React from 'react';

import ClientTableDue from './ClientTableDue';

export default function Due() {
    return(
        <div className="Due-container">
            <div className="Due-header">
                <p2>Due</p2>
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