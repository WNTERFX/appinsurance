import InfoModal from "./InfoModal";
import { useState } from "react";

export default function ClientInfo() {
  const [selectedClient, setSelectedClient] = useState(null);

  const handleClose = () => {
    setSelectedClient(null);
  };


  const handleSelectClient = (client) => {
    setSelectedClient(client);
  };

  return (
    <div>
      
      
      <InfoModal
        isOpen={!!selectedClient}
        onClose={handleClose}
        title="Client Details"
      >
        {selectedClient && (
          <>
            <p><strong>ID:</strong> {selectedClient.id}</p>
            <p><strong>Name:</strong> {[
              selectedClient.prefix_Name, 
              selectedClient.first_Name, 
              selectedClient.middle_Name ? selectedClient.middle_Name.charAt(0) + "." : "", 
              selectedClient.family_Name, 
              selectedClient.suffix_Name
            ].filter(Boolean).join(" ")}</p>
            <p><strong>Address:</strong> {selectedClient.address}</p>
            <p><strong>Phone:</strong> {selectedClient.phone_Number}</p>
          </>
        )}
      </InfoModal>
    </div>
  );
}