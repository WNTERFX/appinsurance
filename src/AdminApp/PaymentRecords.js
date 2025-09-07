
import './styles/payment-records-styles.css';
import Filter from './Filter';
import { FaUserCircle , FaMoon, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState , useRef } from "react";
import ClientTableDue from './ClientTableDue';

export default function PaymentRecords() {

    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
     const dropdownRef = useRef(null);
     const buttonRef = useRef(null);
   
     // close when clicking outside
     useEffect(() => {
       function handleClickOutside(e) {
         if (
           dropdownRef.current &&
           !dropdownRef.current.contains(e.target) &&
           buttonRef.current &&
           !buttonRef.current.contains(e.target)
         ) {
           setOpen(false);
         }
       }
       document.addEventListener("mousedown", handleClickOutside);
       return () => document.removeEventListener("mousedown", handleClickOutside);
     }, []);
   


    return (
        <div className="payment-records-container">
              <div className="payment-record-header">
                  <div className="right-actions">
                <p className="Payment-title">Payment Records</p>
                <input
                type="text"
                className="record-search"
                placeholder="Search clients..."
                />

                    
            </div>
            <div className="left-actions">
             <div className="profile-menu">
                 <button
                  ref={buttonRef}
                  className="profile-button"
                  onClick={() => setOpen((s) => !s)}
                  aria-haspopup="true"
                  aria-expanded={open}
                  >
                  <span className="profile-name">Admin</span>
                   <FaUserCircle className="profile-icon" />
                                  
                   </button>
                        
                  <div
                   ref={dropdownRef}
                  className={`dropdown ${open ? "open" : ""}`}
                  role="menu"
                  aria-hidden={!open}
                   >
                  <button className="dropdown-item">
                   <FaMoon className="dropdown-icon" />
                    Dark Mode
                  </button>
                    <button className="dropdown-item" onClick={() => navigate("/appinsurance")}>
                    <FaSignOutAlt className="dropdown-icon" />
                    Log Out
                    </button>
                     </div>          
                     </div>
                                

            </div>
            </div>
            <div className="payment-records-content">
                <div className="policy-data-field">
                    <div className="control-options">
                        <button className="approve-btn-policy">Approve</button>
                        <button className="disapprove-btn-policy">Edit</button>
                        <button className="print-btn-policy">Print</button>
                    </div>
                <div className="client-payment-table"> 
                <table>
                    <thead>
                        <tr>
                            <th>Client ID</th>
                            <th>Client Name</th>
                            <th>Partner Company</th>
                            <th>Client Registered</th>
                            <th>Month</th>
                            <th>Client Payment Status</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>Cocogen</td>
                            <td>2025-10-01</td>
                            <td>January</td>
                            <td>Paid</td>
                        </tr>
                          <tr>
                            <td>2</td>
                            <td>Jane</td>
                            <td>Cocogen</td>
                            <td>2025-10-01</td>
                            <td>January</td>
                            <td>Not Paid</td>
                        </tr>
                    </tbody>
                </table>                        
            </div>
            </div>

            <p className="due-title">Due</p>
            <div className="client-table-container"> 
                            <ClientTableDue/>        
                        </div>
             
            </div>
        </div>
    );
} 