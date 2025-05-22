import './styles/monthly-data-partners-styles.css';
export default function MonthlyPartnerData() {
    return ( 
            <div className="client-counter-container">
                <div className="total-clients">
                    <h2>Total Clients</h2>
                    <p>100</p>
                </div>
                <div className="partner-item">
                    <h2>COCOGEN INSURANCE CO.</h2>
                    <div className="partner-info">
                        <p>50 🟩</p>
                        
                    </div>   
                    
                </div>
                <div className="partner-item">
                    <h2>STRONGHOLD CO.</h2>
                      <div className="partner-info">
                        <p>50 🟦</p>
                        
                    </div>   
                </div>
                <div className="partner-item">
                    <h2>THE MERCANTILE INSURANCE CO.</h2>
                      <div className="partner-info">
                        <p>50 🟪</p>

                    </div>   
                </div>
                <div className="partner-item">
                    <h2>STANDARD INSURANCE CO.</h2>
                      <div className="partner-info">
                        <p>50 🟥</p>

                    </div>   
                </div>
            </div>
            );
}