import { useEffect, useState } from "react";
import InfoModal from "./InfoModal";
import { getClientInfo, getComputationInfo } from "./AdminActions/ModalActions";

export default function ClientInfo({ clientID, onClose }) {
  const [client, setClient] = useState(null);
  const [computationInfo, setComputationInfo] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clientID) {
      setClient(null);
      setComputationInfo([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const clientData = await getClientInfo(clientID); 
        const compData = await getComputationInfo(clientID); 

        setClient(clientData || null);
        setComputationInfo(compData || []);
      } catch (err) {
        console.error(err);
        setClient(null);
        setComputationInfo([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientID]);

  return (
    <InfoModal isOpen={!!clientID} onClose={onClose} title="Client Details">
    {loading && <p>Loading...</p>}

      {client && !loading && (
        <div style={{ display: "flex", gap: "2rem" }}>
        
          <div style={{ flex: 1 }}>
            <div className="client-info-modal">
              <h4>Client Info:</h4>
              <p>
                <strong>Client Name:</strong>{" "}
                <span>
                  {[
                    client.prefix_Name,
                    client.first_Name,
                    client.middle_Name
                      ? client.middle_Name.charAt(0) + "."
                      : "",
                    client.family_Name,
                    client.suffix_Name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              </p>
              <p>
                <strong>Agent:</strong>{" "}
                <span>{client.employee?.personnel_Name}</span>
              </p>
              <p>
                <strong>Insurance Partner:</strong>{" "}
                {client.partner?.insurance_Name}
              </p>
              <p>
                <strong>Vehicle Model:</strong> {client.vehicle_Model}
              </p>
              <p>
                <strong>Vehicle Type:</strong> {client.vehicle?.vehicle_Type}
              </p>
              <p>
                <strong>Address:</strong> {client.address}
              </p>
              <p>
                <strong>Phone:</strong> {client.phone_Number}
              </p>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="computation-value-modal">
              <h4>Computation Info:</h4>
              {computationInfo.length > 0 ? (
                computationInfo.map((c, index) => (
                  <div key={index}>
                    <p>
                      <strong>Vehicle Year:</strong> {c.vehicle_Year}
                    </p>
                    <p>
                      <strong>Original Value:</strong>{" "}
                      <span>
                        ₱ {c.original_Value.toLocaleString("en-PH")}
                      </span>
                    </p>
                    <p>
                      <strong>Current Value:</strong>{" "}
                      <span>
                        ₱ {c.current_Value.toLocaleString("en-PH")}
                      </span>
                    </p>
                    <p>
                      <strong>AoN:</strong>{" "}
                      {c.aon_Cost > 0
                        ? `₱ ${c.aon_Cost.toLocaleString("en-PH")}`
                        : "No"}
                    </p>
                    <p>
                      <strong>Vehicle Rate:</strong>{" "}
                      <span>
                        ₱ {c.vehicle_Rate_Value.toLocaleString("en-PH")}
                      </span>
                    </p>
                    <hr />
                    <p>
                      <strong>Total Premium:</strong>{" "}
                      <span>
                        ₱ {c.total_Premium.toLocaleString("en-PH")}
                      </span>
                    </p>
                  </div>
                ))
              ) : (
                <p>No computation info available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </InfoModal>
  );
}