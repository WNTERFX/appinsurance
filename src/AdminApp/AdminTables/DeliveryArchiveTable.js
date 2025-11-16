import { useEffect, useState } from "react";
import {
  fetchArchivedDeliveries,
  unarchiveDelivery,
  deleteDelivery,
} from "../AdminActions/DeliveryArchiveActions"; 
import CustomConfirmModal from "../AdminForms/CustomConfirmModal";
import "../styles/delivery-archive-table.css";

export default function DeliveryArchiveTable() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDeliveryID, setSelectedDeliveryID] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: "",
    title: "Confirm",
    onConfirm: null
  });

  // Load archived deliveries
  const loadDeliveries = async () => {
    try {
      const data = await fetchArchivedDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error("Error loading archived deliveries:", error);
      setDeliveries([]);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  // 🔍 Filter deliveries by search
  const filteredDeliveries = deliveries.filter((delivery) => {
    const deliveryInfo = [
      delivery.uid,
      delivery.policy_id,
      delivery.policy_Holder,
      delivery.address,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return deliveryInfo.includes(searchQuery.toLowerCase());
  });

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDeliveries.length / rowsPerPage);

  const handleRowClick = (delivery) => {
    setSelectedDeliveryID(delivery.uid);
  };

  const handleUnarchiveClick = (deliveryId) => {
    setConfirmModal({
      isOpen: true,
      message: "Proceed to unarchive this delivery?",
      title: "Unarchive Delivery",
      onConfirm: async () => {
        try {
          await unarchiveDelivery(deliveryId);
          setDeliveries((prev) => prev.filter((d) => d.uid !== deliveryId));
        } catch (error) {
          console.error("Error unarchiving delivery:", error);
        }
      }
    });
  };

  const handleDelete = (deliveryId) => {
    setConfirmModal({
      isOpen: true,
      message: "This will permanently delete the delivery record. Continue?",
      title: "Delete Delivery",
      onConfirm: async () => {
        try {
          await deleteDelivery(deliveryId);
          setDeliveries((prev) => prev.filter((d) => d.uid !== deliveryId));
        } catch (err) {
          console.error("Error deleting delivery:", err.message);
        }
      }
    });
  };

  // Close confirm modal
  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      message: "",
      title: "Confirm",
      onConfirm: null
    });
  };

  return (
    <div className="delivery-archive-table-container">
      {/* Header */}
      <div className="delivery-archive-table-header">
        <h2>Archived Deliveries</h2>
        <div className="delivery-archive-header-controls">
          <input
            type="text"
            className="delivery-archive-search-input"
            placeholder="Search deliveries..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <button className="reset-btn-archive" onClick={loadDeliveries}>
            Refresh
          </button>
          <div className="rows-per-page-inline">
            <label>Rows per page:</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="delivery-archive-table-wrapper">
        <div className="delivery-archive-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Delivery ID</th>
                <th>Policy ID</th>
                <th>Policy Holder</th>
                <th>Address</th>
                <th>Created At</th>
                <th>Delivery Date</th>
                <th>Archival Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentDeliveries.length > 0 ? (
                currentDeliveries.map((delivery) => (
                  <tr
                    key={delivery.uid}
                    className="delivery-archive-table-clickable-row"
                    onClick={() => handleRowClick(delivery)}
                  >
                    <td>{delivery.uid}</td>
                    <td>{delivery.policy_id}</td>
                    <td>{delivery.policy_Holder || "Unknown"}</td>
                    <td>{delivery.address}</td>
                    <td>{delivery.created_at || "N/A"}</td>
                    <td>{delivery.delivery_date || "N/A"}</td>
                    <td>{delivery.archival_date || "N/A"}</td>
                    <td className="delivery-archive-table-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnarchiveClick(delivery.uid);
                        }}
                      >
                        Unarchive
                      </button>
                      {/*<button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(delivery.uid);
                        }}
                      >
                        Delete
                      </button>*/}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">No archived deliveries found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages || 1}
        </span>
        <button
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* Confirm Modal */}
      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        title={confirmModal.title}
      />
    </div>
  );
}