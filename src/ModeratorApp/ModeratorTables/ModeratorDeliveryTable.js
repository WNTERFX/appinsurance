// src/ModeratorApp/ModeratorTables/ModeratorDeliveryTable.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import ScrollToTopButton from "../../ReusableComponents/ScrollToTop";
import {
  fetchModeratorDeliveries,
  archiveModeratorDelivery,
  markModeratorDeliveryAsDelivered,
} from "../ModeratorActions/ModeratorDeliveryActions";
import "../moderator-styles/delivery-table-styles-moderator.css";

export default function ModeratorDeliveryTable({ currentUser }) {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDeliveryID, setSelectedDeliveryID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");

  // 🔹 Load deliveries
const loadDeliveries = async () => {
  if (!currentUser?.id) {
    //console.warn(" No id in currentUser");
    return;
  }

  console.log("Moderator agentId:", currentUser.id);

  const data = await fetchModeratorDeliveries(currentUser.id);
  console.log("Deliveries fetched:", data);
  setDeliveries(data);
};

  useEffect(() => {
    loadDeliveries();
  }, [currentUser]);

  const handleRowClick = (id) => setSelectedDeliveryID(id);

  // 🔹 Filter logic (by ID or Policy Holder)
  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.uid.toString().includes(searchTerm) ||
      delivery.policy_Holder?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditClick = (delivery) => {
    navigate("/appinsurance/ModeratorArea/Delivery/EditDeliveryForm", {
      state: { delivery },
    });
  };

  const handleArchiveClick = async (deliveryId) => {
    if (!window.confirm("Proceed to archive this delivery?")) return;
    try {
      await archiveModeratorDelivery(deliveryId);
      setDeliveries((prev) => prev.filter((d) => d.uid !== deliveryId));
    } catch (error) {
      console.error("Error archiving delivery:", error);
    }
  };

  const handleMarkAsDelivered = async (deliveryId) => {
    if (!window.confirm("Mark this delivery as delivered?")) return;
    try {
      await markModeratorDeliveryAsDelivered(deliveryId);
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

  // 🔹 Pagination logic
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
      <div className="delivery-table-container-moderator">
        <div className="delivery-table-header-moderator">
          <h2>Active Deliveries</h2>

          <div className="delivery-header-controls-moderator">
            <input
              type="text"
              placeholder="Search by Delivery ID or Policy Holder..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="delivery-search-input-moderator"
            />

            <div className="rows-per-page-inline-moderator">
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

            <button
              onClick={handleReset}
              className="reset-btn-delivery-moderator"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="delivery-table-wrapper-moderator">
          <div className="delivery-table-scroll-moderator">
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
                      className={`delivery-table-clickable-row-moderator ${
                        delivery.delivered_at ? "delivered" : "not-delivered"
                      }`}
                      onClick={() => handleRowClick(delivery.uid)}
                    >
                      <td>{delivery.uid}</td>
                      <td>{delivery.policy_Id}</td>
                      <td>{delivery.policy_Holder}</td>
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
                      <td className="delivery-table-actions-moderator">
                        {!delivery.delivered_at && (
                        <button
                          className="edit-btn-delivery-moderator"
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
                            className="delivered-btn-delivery-moderator"
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
                          className="archive-btn-delivery-moderator"
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
            <div className="pagination-controls-moderator">
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
