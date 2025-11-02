import FilterModerator from './FilterModerator';
import ClientTableDueModerator from './ClientTableDueModerator';
import './moderator-styles/due-styles-moderator.css';

export default function DueModerator() {
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
                    <FilterModerator />
                </div>   
            </div>

            <div className="Due-content">
                
                <div className="Due-total">
                    Lily bon                    
                        <p>Total Due</p>
                        <p>Client_Count</p>              
                </div>

            </div>

            <div className="client-table-container"> 
                <ClientTableDueModerator />    
            </div>
        </div>
    );
}