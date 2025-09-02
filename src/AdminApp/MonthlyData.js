
import MonthlyDataPartners from './MonthlyDataPartners';
import MonthlyDataAgents from './MonthlyDataAgents';

import './styles/monthly-styles.css'; 
export default function MonthlyData({
    view,
    setView
}) {

    
    return (

        
        <div className="monthly-data-container">
            <div className="monthly-data-header">
                <p>Insurance Partner Records</p>
                    
             
                <input
                    type="text"
                    className="monthly-data-search"
                    placeholder="Search clients..."
                />

            </div>

            <div className="monthly-data-buttons">
                <button onClick={() => setView("partners")}>Monthly View</button>
                <button onClick={() => setView("agent")}>Agent View</button>
            </div>

            <div className='data-area'>
                 {view === "partners" ? <MonthlyDataPartners /> : <MonthlyDataAgents />}
            </div>
           

            <div className="graph-container">
                <p>List for Selected Partner</p>
                <div className="insurance-partner-list">
                    
                </div>
            </div>
        </div>
    );

}