
import './moderator-styles/payment-records-styles-moderator.css';
import PaymentDueTableModerator from './ModeratorTables/PaymentDueTableModerator';
import  DropdownAccountsModerator  from './DropDownAccountsModerator';
import { useEffect, useState, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
export default function PaymentRecordsModerator() {

      const [open, setOpen] = useState(false);
      const dropdownRef = useRef(null);
      const buttonRef = useRef(null);
    
      // close dropdown when clicking outside
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
        <div className="payment-records-container-moderator">
              <div className="payment-record-header-moderator">
          <div className="right-actions-moderator">
            <p className="Payment-title-moderator">Payment Records</p>
            <input
            type="text"
            className="record-search"
            placeholder="Search clients..."
            />
          </div>

                  <div className="left-actions-moderator">
                    <div className="profile-menu-moderator">
                      <button
                        ref={buttonRef}
                        className="profile-button-moderator"
                        onClick={() => setOpen((s) => !s)}
                        aria-haspopup="true"
                        aria-expanded={open}
                      >
                        <span className="profile-name">Admin</span>
                        <FaUserCircle className="profile-icon" />
                      </button>
          
                      <div ref={dropdownRef}>
                        <DropdownAccountsModerator
                          open={open}
                          onClose={() => setOpen(false)}
                          onDarkMode={() => console.log("Dark Mode toggled")}
                        />
                      </div>
                    </div>
                  </div>
  
            </div>

            <div className="payment-records-content-moderator">
                <div className="policy-data-field-moderator">
                    <div className="control-options-moderator">
                        <button className="disapprove-btn-policy-moderator">Edit</button>
                        <button className="print-btn-policy-moderator">Print</button>
                    </div>
                <div className="client-payment-table-moderator"> 
                 <PaymentDueTableModerator/>                     
            </div>
            </div>
             
            </div>
        </div>
    );
} 