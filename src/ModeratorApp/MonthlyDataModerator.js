
import { BarChart } from '@mui/x-charts/BarChart';
import FilterModerator from './FilterModerator';
import MonthlyDataPartnersModerator from './MonthlyDataPartnersModerator';
import './moderator-styles/monthly-styles-moderator.css';
import DropdownAccountsModerator from "./DropDownAccountsModerator";
import { FaPlus, FaArchive, FaUserCircle } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";

export default function MonthlyDataModerator() {
 const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

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

 
    return (

        <div className="monthly-data-container-moderator">
            <div className="monthly-data-header-moderator">
                   <div className="right-actions-moderator">
                <p className="reports-title-moderator">Reports</p>
                <input
                    type="text"
                    className="monthly-data-search-moderator"
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
                         <span className="profile-name-moderator">Agent:?</span>
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
                <div className="client-table-moderator"> 
           <table>
                <thead>
                    <tr>
                        <th>Client ID</th>
                        <th>Client Name</th>
                        <th>Agent</th>
                        <th>Insurance Partner</th>
                        <th>Address</th>
                        <th>Phone Number</th>
                        <th>Vehicle</th>
                        <th>Client Status</th>
                        <th>Client Registered</th>
                        <th>Policy Exception </th>
                        <th>Policy Expiration</th>
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
                        <td>Toyota Vios</td>
                        <td>Active</td>
                        <td>2025-10-01</td>
                        <td>2025-10-01</td>
                        <td>2026-10-01</td>
                        <td>Approved</td>
                    </tr>
                </tbody>

                  <tbody>
                    <tr>
                        <td>2</td>
                        <td>Jane Doe</td>
                        <td>Lily Bon</td>
                        <td>Cocogen</td>
                        <td>123 Main St, Quezon City</td>
                        <td>123-456-7890</td>
                        <td>Toyota Vios</td>
                        <td>Active</td>
                        <td>2025-10-01</td>
                        <td>-------</td>
                        <td>-------</td>
                        <td>Pending</td>
                    </tr>
                </tbody>
            </table> 
            </div>




          {/**   <div className="data-area-moderator">
                  <MonthlyDataPartnersModerator /> 
            </div>
           

            <div className="graph-container-moderator">
                <p>Insurance</p>
                <div className="graph-moderator">
                   <BarChart
                           xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                           series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                           height={200}
                           width={1000}
                        />    
                </div>
            </div>*/}
        </div>
    );

}