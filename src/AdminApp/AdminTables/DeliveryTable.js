// src/AdminTables/DeliveryTable.jsx
import { useState, useMemo } from "react";
import { FaEdit, FaTimes, FaDownload, FaEye, FaCamera } from "react-icons/fa";
import {
  cancelDelivery,
  markAsScheduled,
  markAsOutForDelivery,
  markAsDelivered,
  markAsRescheduled,
  archiveDelivery,
  getProofOfDeliveryURL,
} from "../AdminActions/DeliveryActions";
import CustomAlertModal from "../AdminForms/CustomAlertModal";
import CustomConfirmModal from "../AdminForms/CustomConfirmModal";
import "../styles/delivery-table-styles.css";

export default function DeliveryTable({
  deliveries,
  loading,
  policies,
  onEditDelivery,
  onSelectPolicyForClientInfo,
  onRefreshData,
  EditDeliveryComponent, // New prop: The EditDeliveryController component
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Pending");
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const [showDeliveredModal, setShowDeliveredModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofImages, setProofImages] = useState([]);
  const [proofImagePreviews, setProofImagePreviews] = useState([]);
  const [proofUrls, setProofUrls] = useState([]);
  const [loadingProof, setLoadingProof] = useState(false);
  const [expandedProofIndex, setExpandedProofIndex] = useState(null);

  // Custom modal states
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: "", title: "Alert" });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, message: "", title: "Confirm", onConfirm: null });

  const tabs = ["Pending", "Scheduled", "Out for Delivery", "Delivered", "Rescheduled"];

  // Helper functions for modals
  const showAlert = (message, title = "Alert") => {
    setAlertModal({ isOpen: true, message, title });
  };

  const showConfirm = (message, onConfirm, title = "Confirm") => {
    setConfirmModal({ isOpen: true, message, title, onConfirm });
  };

  const closeAlert = () => {
    setAlertModal({ isOpen: false, message: "", title: "Alert" });
  };

  const closeConfirm = () => {
    setConfirmModal({ isOpen: false, message: "", title: "Confirm", onConfirm: null });
  };

  // Format delivery address from snapshot fields
  const formatDeliveryAddress = (d) => {
    const parts = [
      d?.delivery_street_address,
      d?.delivery_barangay,
      d?.delivery_city,
      d?.delivery_region || d?.delivery_province,
      d?.delivery_zip_code
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleRowClick = (delivery) => {
    const policy = policies.find(p => p.id === delivery.policy_Id);
    if (policy && policy.client_id) {
      onSelectPolicyForClientInfo({ policyId: delivery.policy_Id, clientId: policy.client_id });
    }
  };

  const handleViewProof = async (delivery) => {
    if (!delivery.proof_of_delivery) return;
    setSelectedDelivery(delivery);
    setShowProofModal(true);
    setLoadingProof(true);
    setExpandedProofIndex(null);
    try {
      const urls = await getProofOfDeliveryURL(delivery.proof_of_delivery);
      setProofUrls(Array.isArray(urls) ? urls : [urls]);
    } finally {
      setLoadingProof(false);
    }
  };

  const handleDownloadProof = async (url, index) => {
    if (!url) return;
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `proof_delivery_${selectedDelivery.uid}_${index + 1}.jpg`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);
  };

  const handleCancel = async (deliveryId) => {
    showConfirm(
      "Are you sure you want to cancel this delivery?",
      async () => {
        try {
          await cancelDelivery(deliveryId);
          showAlert("Delivery cancelled successfully!");
          onRefreshData();
        } catch (error) {
          console.error("Error cancelling delivery:", error);
          showAlert("Failed to cancel delivery: " + error.message, "Error");
        }
      },
      "Cancel Delivery"
    );
  };

  const handleScheduled = async (deliveryId) => {
    showConfirm(
      "Mark this delivery as scheduled?",
      async () => {
        try {
          await markAsScheduled(deliveryId);
          showAlert("Delivery marked as scheduled!");
          setActiveTab("Scheduled");
          onRefreshData();
        } catch (error) {
          console.error("Error marking as scheduled:", error);
          showAlert("Failed to mark as scheduled: " + error.message, "Error");
        }
      },
      "Mark as Scheduled"
    );
  };

  const handleOutForDelivery = async (deliveryId) => {
    showConfirm(
      "Mark this delivery as out for delivery?",
      async () => {
        try {
          await markAsOutForDelivery(deliveryId);
          showAlert("Delivery is now out for delivery!");
          setActiveTab("Out for Delivery");
          onRefreshData();
        } catch (error) {
          console.error("Error marking as out for delivery:", error);
          showAlert("Failed to mark as out for delivery: " + error.message, "Error");
        }
      },
      "Out for Delivery"
    );
  };

  const handleOpenDeliveredModal = (delivery) => {
    setSelectedDelivery(delivery);
    setProofImages([]);
    setProofImagePreviews([]);
    setShowDeliveredModal(true);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
    if (!files.length) return;
    setProofImages(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => setProofImagePreviews(prev => [...prev, { url: e.target.result, name: file.name }]);
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setProofImages(prev => prev.filter((_, i) => i !== index));
    setProofImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDelivered = async () => {
    if (!proofImages.length) {
      showAlert("Please attach at least one proof of delivery image!");
      return;
    }
    
    try {
      await markAsDelivered(selectedDelivery.uid, proofImages);
      setShowDeliveredModal(false);
      setProofImages([]);
      setProofImagePreviews([]);
      setSelectedDelivery(null);
      showAlert("Delivery marked as delivered!");
      setActiveTab("Delivered");
      onRefreshData();
    } catch (error) {
      console.error("Error marking as delivered:", error);
      showAlert("Failed to mark as delivered: " + error.message, "Error");
    }
  };

  const handleRescheduled = async (deliveryId) => {
    showConfirm(
      "Mark this delivery as rescheduled?",
      async () => {
        try {
          await markAsRescheduled(deliveryId);
          showAlert("Delivery marked as rescheduled!");
          setActiveTab("Rescheduled");
          onRefreshData();
        } catch (error) {
          console.error("Error marking as rescheduled:", error);
          showAlert("Failed to mark as rescheduled: " + error.message, "Error");
        }
      },
      "Mark as Rescheduled"
    );
  };

  const handleArchive = async (deliveryId) => {
    showConfirm(
      "Proceed to archive this delivery?",
      async () => {
        try {
          await archiveDelivery(deliveryId);
          showAlert("Delivery archived successfully!");
          onRefreshData();
        } catch (error) {
          console.error("Error archiving delivery:", error);
          showAlert("Failed to archive delivery: " + error.message, "Error");
        }
      },
      "Archive Delivery"
    );
  };

  const handleReset = () => {
    setSearchTerm("");
    setCurrentPage(1);
    onRefreshData();
  };

  const filteredDeliveriesByTab = useMemo(() => {
    return deliveries.filter(delivery => (delivery.status || "Pending") === activeTab);
  }, [deliveries, activeTab]);

  const filteredAndSearchedDeliveries = useMemo(() => {
    let temp = filteredDeliveriesByTab;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      temp = temp.filter((d) => {
        const idMatch = d.uid?.toString().toLowerCase().includes(q);
        const nameMatch = (d.policy_Holder || "").toLowerCase().includes(q);
        const polMatch = d.policy_Id?.toString().toLowerCase().includes(q);
        return idMatch || nameMatch || polMatch;
      });
    }
    return temp;
  }, [filteredDeliveriesByTab, searchTerm]);

  const indexOfLast = currentPage * rowsPerPage;
  const currentDeliveries = filteredAndSearchedDeliveries.slice(indexOfLast - rowsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredAndSearchedDeliveries.length / rowsPerPage);

  const getTabCount = (tabName) =>
    deliveries.filter(d => (d.status || "Pending") === tabName).length;

  return (
    <>
      <div className="delivery-table-container">
        <div className="delivery-tabs-container">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`delivery-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab} ({getTabCount(tab)})
            </button>
          ))}
        </div>

        <div className="delivery-table-header">
          <h2>
            {activeTab} Deliveries{" "}
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

            <div className="rows-per-page-inline">
              <label htmlFor="rowsPerPage">Results:</label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
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
        ) : filteredAndSearchedDeliveries.length === 0 ? (
          <div className="no-deliveries-message">
            <p>No deliveries in {activeTab} status</p>
          </div>
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
                    <th>Phone Number</th>
                    <th>Date Created</th>
                    <th>Est. Delivery / Delivered Date</th>
                    <th>Status</th>
                    <th>Remarks</th>
                    <th>Proof of Delivery</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDeliveries.map((delivery) => {
                    const deliveryStatus = delivery.status || "Pending";
                    const addressText = formatDeliveryAddress(delivery);
                    return (
                      <tr
                        key={delivery.uid}
                        className="delivery-table-clickable-row"
                        onClick={() => handleRowClick(delivery)}
                      >
                        <td>{delivery.uid}</td>
                        <td>{delivery.policy_Id}</td>
                        <td>{delivery.policy_Holder || "Unknown"}</td>
                        <td>{addressText || "N/A"}</td>
                        <td>{delivery.phone_number || "N/A"}</td>
                        <td>{delivery.created_At}</td>
                        <td>
                          {delivery.delivered_at ? (
                            <span style={{ fontWeight: "bold", color: "#10b981" }}>
                              Delivered: {delivery.displayDate}
                            </span>
                          ) : (
                            <span>Est: {delivery.displayDate}</span>
                          )}
                        </td>
                        <td>
                          <span className={`delivery-status-badge ${deliveryStatus.toLowerCase().replace(/\s+/g, "-")}`}>
                            {deliveryStatus}
                          </span>
                        </td>
                        <td className="remarks">
                          <div className="remarks-content">
                            {delivery.remarks ? delivery.remarks : "No remarks"}
                          </div>
                        </td>
                        <td className="proof-of-delivery-cell">
                          {delivery.proof_of_delivery ? (
                            <button
                              className="view-proof-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProof(delivery);
                              }}
                            >
                              View Proof
                            </button>
                          ) : (
                            <span className="no-proof">N/A</span>
                          )}
                        </td>
                        <td className="delivery-table-actions">
                          {activeTab === "Pending" && (
                            <>
                              <button
                                className="cancel-btn-delivery"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancel(delivery.uid);
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className="edit-btn-delivery"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditDelivery(delivery);
                                }}
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                className="scheduled-btn-delivery"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScheduled(delivery.uid);
                                }}
                              >
                                Scheduled
                              </button>
                            </>
                          )}

                          {activeTab === "Scheduled" && (
                            <button
                              className="out-for-delivery-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOutForDelivery(delivery.uid);
                              }}
                            >
                              Out for Delivery
                            </button>
                          )}

                          {activeTab === "Out for Delivery" && (
                            <>
                              <button
                                className="delivered-btn-delivery"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeliveredModal(delivery);
                                }}
                              >
                                Delivered
                              </button>
                              <button
                                className="reschedule-btn-delivery"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRescheduled(delivery.uid);
                                }}
                              >
                                Reschedule
                              </button>
                            </>
                          )}

                          {activeTab === "Delivered" && (
                            <button
                              className="archive-btn-delivery"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(delivery.uid);
                              }}
                            >
                              Archive
                            </button>
                          )}

                          {activeTab === "Rescheduled" && (
                            <>
                              <button
                                className="edit-btn-delivery"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Edit opens modal, after save it should go to Scheduled
                                  onEditDelivery(delivery);
                                }}
                              >
                                <FaEdit /> Edit
                              </button>
                              <button
                                className="scheduled-btn-delivery"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleScheduled(delivery.uid);
                                }}
                              >
                                Mark as Scheduled
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Custom Alert Modal */}
      <CustomAlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        message={alertModal.message}
        title={alertModal.title}
      />

      {/* Custom Confirm Modal */}
      <CustomConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmModal.onConfirm}
        message={confirmModal.message}
        title={confirmModal.title}
      />

      {/* Delivered Modal */}
      {showDeliveredModal && (
        <div className="delivery-modal-overlay">
          <div className="delivery-modal delivered-modal">
            <div className="modal-header">
              <div>
                <h3>Mark as Delivered</h3>
                <p className="modal-subtitle">Please attach proof of delivery (receiving copy image)</p>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowDeliveredModal(false);
                  setProofImages([]);
                  setProofImagePreviews([]);
                  setSelectedDelivery(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="form-group">
              <label>Receiving copy Image:</label>

              {proofImagePreviews.length === 0 ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="proofImageInput"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="proofImageInput" className="upload-label">
                    <div className="upload-placeholder">
                      <FaCamera className="camera-icon" />
                      <p className="upload-text">Upload photos</p>
                      <p className="upload-subtext">Upload a photo of receiving copy</p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="uploaded-images-grid">
                  {proofImagePreviews.map((preview, index) => (
                    <div key={index} className="uploaded-image-card">
                      <button
                        className="remove-image-btn"
                        onClick={() => handleRemoveImage(index)}
                        type="button"
                      >
                        <FaTimes />
                      </button>
                      <img src={preview.url} alt={`Preview ${index + 1}`} className="preview-image" />
                      <p className="image-filename">{preview.name}</p>
                    </div>
                  ))}
                  <div className="add-more-images">
                    <input
                      type="file"
                      id="addMoreImages"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="addMoreImages" className="add-more-label">
                      <FaCamera size={32} />
                      <p>Add More</p>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowDeliveredModal(false);
                  setProofImages([]);
                  setProofImagePreviews([]);
                  setSelectedDelivery(null);
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDelivered}
                className="submit-btn"
                disabled={proofImages.length === 0}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proof View Modal */}
      {showProofModal && (
        <div
          className="delivery-modal-overlay"
          onClick={() => expandedProofIndex === null && setShowProofModal(false)}
        >
          <div className="delivery-modal proof-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Receiving Copy</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowProofModal(false);
                  setProofUrls([]);
                  setSelectedDelivery(null);
                  setExpandedProofIndex(null);
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div className="proof-images-grid">
              {loadingProof ? (
                <div className="proof-loading">Loading images...</div>
              ) : proofUrls && proofUrls.length > 0 ? (
                proofUrls.map((url, index) => (
                  <div key={index} className="proof-item">
                    <div className="proof-item-actions">
                      <button
                        className="btn-preview"
                        onClick={() => setExpandedProofIndex(index)}
                      >
                        <FaEye /> Preview
                      </button>
                      <button
                        className="btn-download"
                        onClick={() => handleDownloadProof(url, index)}
                      >
                        <FaDownload /> Download
                      </button>
                    </div>
                    <div className="proof-image-container">
                      <img
                        src={url}
                        alt={`Proof ${index + 1}`}
                        className="proof-image-thumbnail"
                        onClick={() => setExpandedProofIndex(index)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="proof-loading">Failed to load images</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Proof Modal */}
      {expandedProofIndex !== null && proofUrls[expandedProofIndex] && (
        <div className="expanded-modal-overlay" onClick={() => setExpandedProofIndex(null)}>
          <div className="expanded-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="expanded-close-btn" onClick={() => setExpandedProofIndex(null)}>
              <FaTimes />
            </button>
            <img
              src={proofUrls[expandedProofIndex]}
              alt={`Proof ${expandedProofIndex + 1} - Full Size`}
              className="expanded-image"
            />
          </div>
        </div>
      )}
    </>
  );
}