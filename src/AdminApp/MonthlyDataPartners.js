import './styles/monthly-data-partners-styles.css';
import { useEffect, useState } from "react";
import { fetchPartners } from "./AdminActions/MonthlyDataPartnersActions"


export default function MonthlyPartnerData() {
   const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPartners() {
      const data = await fetchPartners();
      setPartners(data);
      setLoading(false);
    }
    loadPartners();
  }, []);

  if (loading) return <p>Loading partners...</p>;

  return (
    <div className="client-counter-container">
      <div className="total-clients">
        <h2>Total Clients</h2>
        <p>—</p> 
      </div>

        {partners.map((partner) => (
        <div key={partner.id} className="partner-item">
            <h2>{partner.insurance_Name}</h2>  
            <div className="partner-info">
            <p>random number</p>  
            </div>
        </div>
        ))}
    </div>
  );
}
