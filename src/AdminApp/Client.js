
import ClientTable from "./AdminTables/ClientTable";
import Filter from "./Filter";
import { FaPlus, FaArchive, FaUser } from "react-icons/fa";
export default function Client() {
    return(
        <div className="Client-container">
           
            <div className="Client-header">
                 <div className="right-actions">
                <p>Client</p>
                <input
                type="text"
                className="client-search"
                placeholder="Search clients..."
                />

                <div className="filter-client">
                    <Filter />
                </div>   
                </div>

                 <div className="left-actions">
                <button className="btn btn-create">
                   <FaPlus className="btn-icon" /> Create
                </button>
                
                 <button className="btn btn-archive">
                   <FaArchive className="btn-icon" /> View Archive
                </button>
                </div>
                  

            </div>

            <div className="Client-content">
                

           <div className="Agents">
           <div className="agent-header">
           <FaUser className="agent-icon" />
             <h3>Sales Agent 1</h3>
            </div>
          <p>Total Client : ??</p>
          <button className="view-all-client-button">View All</button>
          </div>

        <div className="Agents">
       <div className="agent-header">
       <FaUser className="agent-icon" />
        <h3>Sales Agent 2</h3>
       </div>
       <p>Total Client : ??</p>
      <button className="view-all-client-button">View All</button>
      </div>

     <div className="Agents">
    <div className="agent-header">
      <FaUser className="agent-icon" />
      <h3>Sales Agent 3</h3>
    </div>
    <p>Total Client : ??</p>
    <button className="view-all-client-button">View All</button>
   </div>
            </div>

            <div className="client-table-container"> 
                <ClientTable/>
            </div>
        </div>
    );
}