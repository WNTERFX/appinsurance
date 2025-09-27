import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa"; 
import ScrollToTopButton from "../../ReusableComponents/ScrollToTop";
import { fetchDeliveries, archiveDelivery, markDeliveryAsDelivered } from "../AdminActions/DeliveryActions";
import "../styles/delivery-table-styles.css";

export default function DeliveryTable() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDeliveryID, setSelectedDeliveryID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15); 
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Filter logic
  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery.uid.toString().includes(searchTerm)
  );

  // 🔹 Load deliveries
  const loadDeliveries = async () => {
    const data = await fetchDeliveries();
    setDeliveries(data);
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const handleRowClick = (id) => setSelectedDeliveryID(id);

  const handleEditClick = (delivery) => {
    navigate("/appinsurance/MainArea/Delivery/EditDeliveryForm", {
      state: { delivery },
    });
  };

  const handleArchiveClick = async (deliveryId) => {
    const confirmArchive = window.confirm("Proceed to archive this delivery?");
    if (!confirmArchive) return;

    try {
      await archiveDelivery(deliveryId);
      setDeliveries((prev) => prev.filter((d) => d.uid !== deliveryId));
    } catch (error) {
      console.error("Error archiving delivery:", error);
    }
  };

  const handleMarkAsDelivered = async (deliveryId) => {
    const confirmMark = window.confirm("Mark this delivery as delivered?");
    if (!confirmMark) return;

    try {
      await markDeliveryAsDelivered(deliveryId);
      // Refresh the deliveries to show updated status
      await loadDeliveries();
    } catch (error) {
      console.error("Error marking delivery as delivered:", error);
      alert("Failed to mark delivery as delivered: " + error.message);
    }
  };

  const handleReset = async () => {
    setSearchTerm("");
    setCurrentPage(1);
    await loadDeliveries(); 
  };

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDeliveries.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <div className="delivery-table-container">
        <div className="delivery-table-header">
          <h2>Active Deliveries</h2>

          <div className="delivery-header-controls">
            <input
              type="text"
              placeholder="Search by Delivery ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="delivery-search-input"
            />

            <div className="rows-per-page-inline">
              <label htmlFor="rowsPerPage">Results:</label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <button onClick={handleReset} className="reset-btn-delivery">
              Refresh
            </button>
          </div>
        </div>

        <div className="delivery-table-wrapper">
          <div className="delivery-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Delivery ID</th>
                  <th>Policy ID</th>
                  <th>Policy Holder</th>
                  <th>Address</th>
                  <th>Date Created</th>
                  <th>Est. Delivery / Delivered Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentDeliveries.length > 0 ? (
                  currentDeliveries.map((delivery) => (
                    <tr
                      key={delivery.uid}
                      className={`delivery-table-clickable-row ${
                        delivery.delivered_at ? 'delivered' : 'not-delivered'
                      }`}
                      onClick={() => handleRowClick(delivery.uid)}
                    >
                      <td>{delivery.uid}</td>
                      <td>{delivery.policy_Id}</td>
                      <td>{delivery.policy_Holder || "Unknown"}</td>
                      <td>{delivery.address}</td>
                      <td>{delivery.created_At}</td>
                      <td>
                        {delivery.delivered_at ? (
                          <span style={{ fontWeight: "bold", color: "#2d9d4d" }}>
                            Delivered: {delivery.displayDate}
                          </span>
                        ) : (
                          <span>Est: {delivery.displayDate}</span>
                        )}
                      </td>
                    
                      <td className="delivery-table-actions">
                        {!delivery.delivered_at && (
                        <button
                          className="edit-btn-delivery"
                          title="Edit this delivery"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(delivery);
                          }}
                        >
                          <FaEdit /> Edit
                        </button>
                        )}
                        {!delivery.delivered_at && (
                          <button
                            className="delivered-btn-delivery"
                            title="Mark this delivery as delivered"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsDelivered(delivery.uid);
                            }}
                          >
                            Mark As Delivered
                          </button>
                        )}
                        
                        {delivery.delivered_at && (
                        <button
                          className="archive-btn-delivery"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveClick(delivery.uid);
                          }}
                        >
                          Archive
                        </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">No deliveries found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <ScrollToTopButton />
    </>
  );
}