

export default function ClientCreationForm(){


    return(

        <div className="client-creation-container">
            <h2>Client Creation Form</h2>

            <div className="form-card-client-creation">
                <div className="form-grid-client-creation">
                    <div className="form-left-column-client-creation">
                        <div className="name-row-client-creation"></div>

                            <div className="form-group-client-creation">
                                <label>Prefix</label>
                                <input
                                    type="text"
                                    value=""
                                    readOnly
                                />
                            </div>

                            <div className="form-group-client-creation">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    value=""
                                    readOnly
                                />
                            </div>

                            <div className="form-group-client-creation">
                                <label>Middle Name</label>
                                <input 
                                    type="text"
                                    value=""
                                    readOnly
                                />
                            </div>  

                            <div className="form-group-client-creation">
                                <lable>Last/Family Name</lable>
                                <input
                                    type="text"
                                    value=""
                                    readOnly
                                />
                            </div>

                             <div className="form-group-client-creation">
                                <lable>Suffix</lable>
                                <input
                                    type="text"
                                    value=""
                                    readOnly
                                />
                            </div>

                             <div className="form-group-client-creation">
                                <lable>Home Address</lable>
                                <input
                                    type="text"
                                    value=""
                                    readOnly
                                />
                            </div>

                             <div className="form-group-client-creation">
                                <lable>Phone Number</lable>
                                <input
                                    type="text"
                                    value=""
                                    readOnly
                                />
                            </div>

                             <div className="form-group-client-creation">
                                <lable>Email Address</lable>
                                <input
                                    type="text"
                                    value=""
                                    readOnly
                                />
                            </div>


                    </div>
                </div>
            </div>

            <div className="client-creation-controls">
                <button>Submit</button>
                <button>Cancel</button>


            </div>
        
        
        </div>






   );
}