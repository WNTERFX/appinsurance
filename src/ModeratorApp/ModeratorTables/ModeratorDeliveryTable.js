// src/ModeratorApp/ModeratorTables/ModeratorDeliveryTable.js
import { useEffect, useState, useMemo } from "react"; // Added useMemo
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import ScrollToTopButton from "../../ReusableComponents/ScrollToTop";
import {
  fetchModeratorDeliveries,
  archiveModeratorDelivery,
  markModeratorDeliveryAsDelivered,
} from "../ModeratorActions/ModeratorDeliveryActions";
import "../moderator-styles/delivery-table-styles-moderator.css";

export default function ModeratorDeliveryTable({ currentUser, onEditDelivery,onSelectPolicyForClientInfo , policies }) {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  // const [selectedDeliveryID, setSelectedDeliveryID] = useState(null); // No longer needed
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [deliveryFilter, setDeliveryFilter] = useState("All"); // Added deliveryFilter state
  const [loading, setLoading] = useState(true); // Added loading state

  // 🔹 Load deliveries
  const loadDeliveries = async () => {
    if (!currentUser?.id) {
      //console.warn(" No id in currentUser");
      setLoading(false);
      return;
    }

    setLoading(true); // Set loading to true before fetching
    console.log("Moderator agentId:", currentUser.id);

    try {
      const data = await fetchModeratorDeliveries(currentUser.id);
      console.log("Deliveries fetched:", data);
      setDeliveries(data);
    } catch (error) {
      console.error("Error fetching moderator deliveries:", error);
      // Optionally, show an error message to the user
    } finally {
      setLoading(false); // Set loading to false after fetching (success or error)
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [currentUser]);

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
    if (!window.confirm("Proceed to archive this delivery?")) return;
    try {
      await archiveModeratorDelivery(deliveryId);
      loadDeliveries(); // Reload deliveries to reflect changes
    } catch (error) {
      console.error("Error archiving delivery:", error);
      alert("Failed to archive delivery: " + error.message);
    }
  };

  const handleMarkAsDelivered = async (deliveryId) => {
    if (!window.confirm("Mark this delivery as delivered?")) return;
    try {
      await markModeratorDeliveryAsDelivered(deliveryId);
      loadDeliveries(); // Reload deliveries to reflect changes
    } catch (error) {
      console.error("Error marking delivery as delivered:", error);
      alert("Failed to mark delivery as delivered: " + error.message);
    }
  };

  const handleReset = () => {
    setSearchTerm("");
    setDeliveryFilter("All"); // Reset filter
    setCurrentPage(1);
    loadDeliveries(); // Reload all deliveries
  };

  // 🔹 Filter and Search Logic
  const filteredAndSearchedDeliveries = useMemo(() => {
    let tempDeliveries = deliveries;

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
        const policyIdMatch = delivery.policy_Id?.toString().toLowerCase().includes(lowerCaseSearchTerm); // Added policy ID search

        return deliveryIdMatch || policyHolderMatch || policyIdMatch;
      });
    }
    return tempDeliveries;
  }, [deliveries, searchTerm, deliveryFilter]); // Dependencies changed to include deliveryFilter

  // 🔹 Pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentDeliveries = filteredAndSearchedDeliveries.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredAndSearchedDeliveries.length / rowsPerPage);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Handler for the new filter dropdown
  const handleDeliveryFilterChange = (e) => {
    setDeliveryFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };


  return (
    <>
      <div className="delivery-table-container-moderator">
        <div className="delivery-table-header-moderator">
          <h2>
            Active Deliveries{" "}
            <span className="delivery-count-moderator">({filteredAndSearchedDeliveries.length})</span>
          </h2>

          <div className="delivery-header-controls-moderator">
            <input
              type="text"
              placeholder="Search by ID or Policy Holder..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              className="delivery-search-input-moderator"
            />

            {/* New Filter Dropdown */}
            <div className="delivery-status-filter-dropdown-moderator">
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

        {loading ? (
          <div className="loading-overlay-moderator">Loading deliveries...</div>
        ) : (
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
                    <th>Remarks</th>
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
                        // Removed onClick as it was setting unused state
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
                        <td className="remarks-moderator">
                          {delivery.remarks ? delivery.remarks : "No remarks"}
                        </td>

                        <td className="delivery-table-actions-moderator">
                          {!delivery.delivered_at && (
                          <button
                            className="edit-btn-delivery-moderator"
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
                      <td colSpan="8">No deliveries found</td> {/* Changed colspan to 8 */}
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
        )}
      </div>

      <ScrollToTopButton />
    </>
  );
}