import { useEffect, useState } from "react";
import {
  fetchModeratorArchivedDeliveries,
  unarchiveModeratorDelivery,
  deleteModeratorDelivery,
} from "../ModeratorActions/ModeratorDeliveryArchiveActions";
import "../moderator-styles/delivery-archive-table-moderator.css";

export default function ModeratorDeliveryArchiveTable() {
  const [deliveries, setDeliveries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeliveryID, setSelectedDeliveryID] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const loadDeliveries = async () => {
    const data = await fetchModeratorArchivedDeliveries();
    setDeliveries(data);
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  // Filter by search query
  const filteredDeliveries = deliveries.filter((delivery) => {
    const info = [
      delivery.uid,
      delivery.policy_Id,
      delivery.policy_Holder,
      delivery.address,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return info.includes(searchQuery.toLowerCase());
  });

  // Pagination
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentDeliveries = filteredDeliveries.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDeliveries.length / rowsPerPage);

    const handleRowClick = (delivery) => {
    setSelectedDeliveryID(delivery.uid);
  };

  const handleUnarchive = async (deliveryId) => {
    if (!window.confirm("Unarchive this delivery?")) return;
    try {
      await unarchiveModeratorDelivery(deliveryId);
      setDeliveries((prev) => prev.filter((d) => d.uid !== deliveryId));
    } catch (err) {
      console.error("Error unarchiving:", err);
    }
  };

  const handleDelete = async (deliveryId) => {
    if (!window.confirm("This will permanently delete this record. Continue?")) return;
    try {
      await deleteModeratorDelivery(deliveryId);
      setDeliveries((prev) => prev.filter((d) => d.uid !== deliveryId));
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  return (
    <div className="delivery-archive-table-container-mod">
      <div className="delivery-archive-table-header-mod">
        <h2>Archived Deliveries</h2>
        <div className="delivery-archive-header-controls-mod">
          <input
            type="text"
            placeholder="Search deliveries..."
            className="delivery-archive-search-input-mod"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="rows-per-page-inline-mod">
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
            </select>
          </div>
           <button onClick={loadDeliveries} className="reset-btn-archive-mod">
            Refresh
          </button>
        </div>
      </div>

      <div className="delivery-archive-table-wrapper-mod">
        <div className="delivery-archive-table-scroll-mod">
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
                      className="delivery-archive-table-clickable-row-mod"
                      onClick={() => handleRowClick(delivery)}
                     >
                    <td>{delivery.uid}</td>
                    <td>{delivery.policy_Id}</td>
                    <td>{delivery.policy_Holder}</td>
                    <td>{delivery.address}</td>
                    <td>{delivery.created_at}</td>
                    <td>{delivery.delivery_date}</td>
                    <td>{delivery.archival_date}</td>
                    <td className="delivery-archive-table-actions-mod">
                      <button onClick={() => handleUnarchive(delivery.uid)}>
                        Unarchive
                      </button>
                      <button onClick={() => handleDelete(delivery.uid)}>
                        Delete
                      </button>
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

      <div className="pagination-controls-mod">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Prev
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
    </div>
  );
}
