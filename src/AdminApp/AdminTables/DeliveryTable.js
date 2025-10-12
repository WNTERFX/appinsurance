import { useState, useMemo } from "react"; // Removed useEffect, useNavigate
import { FaEdit } from "react-icons/fa";
import ScrollToTopButton from "../../ReusableComponents/ScrollToTop";
import { archiveDelivery, markDeliveryAsDelivered } from "../AdminActions/DeliveryActions"; // Removed fetchDeliveries
import "../styles/delivery-table-styles.css";

export default function DeliveryTable({
  deliveries, // Directly use the deliveries prop
  loading,
  policies,
  onEditDelivery,
  onSelectPolicyForClientInfo,
  onRefreshData // <--- New prop: callback to refresh data in parent
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("All");

  const handleRowClick = (delivery) => {
    const policy = policies.find(p => p.id === delivery.policy_Id);

    if (policy && policy.client_id) {
      onSelectPolicyForClientInfo({
        policyId: delivery.policy_Id,
        clientId: policy.client_id,
      });
    } else {
      console.warn("Could not find client_id for policy_Id:", delivery.policy_Id, "or policy:", policy);
      // Optionally, show a toast/alert to the user that client info isn't available
    }
  };

  const handleArchiveClick = async (deliveryId) => {
    const confirmArchive = window.confirm("Proceed to archive this delivery?");
    if (!confirmArchive) return;

    try {
      await archiveDelivery(deliveryId);
      onRefreshData(); // <--- Trigger parent to refresh all data
    } catch (error) {
      console.error("Error archiving delivery:", error);
      alert("Failed to archive delivery: " + error.message);
    }
  };

  const handleMarkAsDelivered = async (deliveryId) => {
    const confirmMark = window.confirm("Mark this delivery as delivered?");
    if (!confirmMark) return;

    try {
      await markDeliveryAsDelivered(deliveryId);
      onRefreshData(); // <--- Trigger parent to refresh all data
    } catch (error) {
      console.error("Error marking delivery as delivered:", error);
      alert("Failed to mark delivery as delivered: " + error.message);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setDeliveryFilter("All");
    setCurrentPage(1);
    onRefreshData(); // <--- Trigger parent to refresh all data
  };

  // 🔹 Filter and Search Logic
  const filteredAndSearchedDeliveries = useMemo(() => {
    let tempDeliveries = deliveries; // Use the prop directly

    if (deliveryFilter === "Delivered") {
      tempDeliveries = tempDeliveries.filter((delivery) => delivery.delivered_at !== null);
    } else if (deliveryFilter === "Undelivered") {
      tempDeliveries = tempDeliveries.filter((delivery) => delivery.delivered_at === null);
    }

    if (searchTerm.trim()) {
      const lowerCaseSearchTerm = searchTerm.trim().toLowerCase();
      tempDeliveries = tempDeliveries.filter((delivery) => {
        const deliveryIdMatch = delivery.uid?.toString().toLowerCase().includes(lowerCaseSearchTerm);
        const policyHolderName = delivery.policy_Holder ? delivery.policy_Holder.toLowerCase() : "";
        const policyHolderMatch = policyHolderName.includes(lowerCaseSearchTerm);
        const policyIdMatch = delivery.policy_Id?.toString().toLowerCase().includes(lowerCaseSearchTerm);

        return deliveryIdMatch || policyHolderMatch || policyIdMatch;
      });
    }
    return tempDeliveries;
  }, [deliveries, searchTerm, deliveryFilter]); // Dependencies on props and local state

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentDeliveries = filteredAndSearchedDeliveries.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAndSearchedDeliveries.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleDeliveryFilterChange = (e) => {
    setDeliveryFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="delivery-table-container">
        <div className="delivery-table-header">
          <h2>
            Active Deliveries{" "}
            <span className="delivery-count">({filteredAndSearchedDeliveries.length})</span>
          </h2>

          <div className="delivery-header-controls">
            <input
              type="text"
              placeholder="Search by ID or Policy Holder..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="delivery-search-input"
            />

            <div className="delivery-status-filter-dropdown">
              <label htmlFor="deliveryFilter">Status:</label>
              <select
                id="deliveryFilter"
                value={deliveryFilter}
                onChange={handleDeliveryFilterChange}
              >
                <option value="All">All</option>
                <option value="Delivered">Delivered</option>
                <option value="Undelivered">Undelivered</option>
              </select>
            </div>

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

        {loading ? (
            <div className="loading-overlay">Loading deliveries and policies...</div>
        ) : (
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
                  <th>Remarks</th>
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
                      onClick={() => handleRowClick(delivery)}
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
                      <td className="remarks">
                        {delivery.remarks ? delivery.remarks : "No remarks"}
                      </td>

                      <td className="delivery-table-actions">
                        {!delivery.delivered_at && (
                          <button
                            className="edit-btn-delivery"
                            title="Edit this delivery"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditDelivery(delivery);
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
                    <td colSpan="8">No deliveries found</td>
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
        )}
      </div>

      <ScrollToTopButton />
    </>
  );
}