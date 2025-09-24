import './moderator-styles/delivery-table-styles-moderator.css';
import FilterModerator from './FilterModerator';
import DropdownAccountsModerator from "./DropDownAccountsModerator";
import { FaPlus, FaArchive, FaUserCircle } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { useModeratorProfile } from "../ModeratorApp/useModeratorProfile";
export default function DeliverTableModerator() {

      const [open, setOpen] = useState(false);
        const dropdownRef = useRef(null);
        const buttonRef = useRef(null);
        const profile = useModeratorProfile();
    
        // dropdown close
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

    return(
     <div className="delivery-records-container-moderator">
            <div className="delivery-record-header-moderator">
                   <div className="right-actions-moderator">
                <p className="deliveries-title-moderator">Delivery</p>
                <input
                type="text"
                className="delivery-record-search-moderator"
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
                      <span className="profile-name-moderator">{profile?.fullName || "?"}</span>
                      <FaUserCircle className="profile-icon-moderator" />
                    </button>
                                          
                    <div>
                   <DropdownAccountsModerator
                     open={open}
                      onClose={() => setOpen(false)}
                     onDarkMode={() => console.log("Dark Mode toggled")}
                     />
                     </div>
                    </div>
                    </div>
            </div>
            <div className="delivery-records-content-moderator">
            <div className="delivery-data-field-moderator">
                <div className="control-options-delivery-moderator">
                     <button className="disapprove-btn-delivery-moderator">Edit</button>
                     <button className="print-btn-delivery-moderator">Print</button>
                </div>
            
                <div className="delivery-table-moderator"> 
                <table>
                    <thead>
                        <tr>
                            <th>Claim ID</th>
                            <th>Client Name</th>
                            <th>Agent</th>
                            <th>Partner Company</th>
                            <th>Address</th>
                            <th>Phone Number</th>
                            <th>Set Delivery Date</th>
                            <th>Delivered Date</th>
                            <th>Remarks</th>
                            
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1</td>
                            <td>John Doe</td>
                            <td>Lily Bon</td>
                            <td>Cocogen</td>
                            <td>123 Main St, Quezon City</td>
                            <td>123-456-7890</td>
                            <td>2025-10-01</td>
                            <td>2025-12-01</td>
                            <td>Delivered</td>
                        </tr>
                    </tbody>
                </table>
                </div>     
            </div>
            
            </div>  
    </div>
    );
}