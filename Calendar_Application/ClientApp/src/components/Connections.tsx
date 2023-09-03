import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
type TaskType = 'connectionadded' | "noemail" | 'connectiondeleted' | "valid" | 'noconnections' | 'connectionexist' | 'sameemail'; // Define the possible task types
import MyModal, { Logout } from './Modal';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import 'react-datepicker/dist/react-datepicker.css';
import { FaPlus } from 'react-icons/fa';


function Connections() {
    const [showModal, setShowModal] = useState(false);
    const [expandedEmail, setExpandedEmail] = useState<number | null>(null);
    const [currentTaskType, setCurrentTaskType] = useState<TaskType | null>(null);
    const [connection, setConnection] = useState<string>("");
    const [emailIds, setEmailIds] = useState<Array<string>>([]);
    const [email, setEmail] = useState<string>("");
    const [allEmails, setAllEmailIds] = useState<Array<string>>([]);
    const [userEmail, setUserEmail] = useState<string>('');
    const params = useParams();
    const id = params.id;
    const [confirmationModal, setConfirmationModal] = useState(false);
    const navigate = useNavigate();
    const baseUrl = process.env.REACT_APP_URL;



    //UseEffect renders the Get() and GetAll() function whenever a change is occured which can be obtained by currentTaskType.
    useEffect(() => {
                Get();
             GetAll();
        
    }, [currentTaskType]);
    /**
 * Function to handle closing the modal and resetting the connection state.
 */
    const handleCloseModal = () => {
        setConnection("");
        setShowModal(false);
    };

    /**
 * Function to toggle the expanded state of an email.
 * @param {number} index - The index of the email to toggle.
 */
    const toggleExpand = (index: number) => {
        if (expandedEmail === index) {
            setExpandedEmail(null);
        } else {
            setExpandedEmail(index);
        }
    };

    /**
 * Function to navigate back to the home page.
 */
  
    function goBack() {
        navigate(`/Home/${id}`);
    }
   
    /**
   * This function takes the emailId of the connection and gets the object Id of the user.
   * After getting the object Id of the connection, it shows the connectionId calendar.
   * @param {string} email - Email Id of the connection.
   */
    const handleViewCalendar = (email: string) => {
        var connectionId: string;
        axios.get(`${baseUrl}/Connection/GetId/`, { params: { email: email } }).then((response) => {
            connectionId = response.data.id;
            navigate(`/Home/Connections/calendar/${id}/${connectionId}`);
        }).catch((error) => {
            alert(error);
        });
    };

    /**
 * Function to show the confirmation modal before deleting an email.
 * @param {string} email - The email to be deleted.
 */
    const DeleteEventConfirm = (email: any) => {
        setConfirmationModal(true);
        setEmail(email);
        
    }

    /**
    * This function takes the object Id of the user and gets all the connections of the user.
    * If the user has no connections, the modal 'no connections' will pop up. This function re-renders every time currentTaskType updates.
    */
    function Get() {
        var emails: any;
        axios.get(`${baseUrl}/Connection/GetEmail/`, { params: { id: id } }).then((response) => {
            emails = response.data.connection;
            setUserEmail(response.data.emailId);
            if (emails.length > 0) {
                setEmailIds(emails);
            }
            if (emails.length === 0) {
                setCurrentTaskType('noconnections');
                setShowModal(true);
            }
        }).catch((error) => {
            alert(error);
        });
    }
    /**
    * Checks whether the entered email Id is valid or not and returns true if it is valid.
    * @param {string} email - The email to validate.
    * @returns {boolean} - True if the email is valid, false otherwise.
    */
    const validateEmail = (email: string) => {
        const pattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
        return pattern.test(email);
    };

    /**
      * This function will get all the email Ids that are present in the database.
      */
    function GetAll() {
        var emails;
        axios.get(`${baseUrl}/Connection/Get/`).then((response) => {
            emails = response.data;
            if (emails.length > 0) {
                setAllEmailIds(emails);
            }
        }).catch((error) => {
            alert(error);
        });
    }
    /**
    * This function takes the emailId of the connection the user wants to delete.
    * After deleting the connection, a modal pops up.
    * @param {string} emailId - Email Id of the connection.
    */
    async function Delete(emailId: string) {
        setConfirmationModal(false);
        await axios.delete(`${baseUrl}/Connection/Delete/`, { params: { emailId: emailId, id: id } }).then((response) => {
            setCurrentTaskType('connectiondeleted');
            setShowModal(true);
            setConnection('');
            setEmailIds(prevEmailIds => prevEmailIds.filter(email => email !== emailId));
        }).catch((error) => { alert(error); });
    }

    /**
     * This function is used to update the connection list of the user.
     * First, a few checks are done. If the user adds an already existing connection again or their own emailId or nothing, a modal pops up with the appropriate message.
     * After all the checks are done, the connection array is updated, and a post request will be sent.
     */
    async function Update(event: React.MouseEvent<HTMLButtonElement>) {

        event.preventDefault();
        const exists = emailIds.includes(connection);
        if (exists) {
            setCurrentTaskType('connectionexist');
            setShowModal(true);
            setConnection('');
            return;
        }
        
        if (connection == userEmail) {
            setCurrentTaskType("sameemail");
            setShowModal(true);
            setConnection('');
            return;
        }
        if (connection == "" || !validateEmail(connection)) {
            setCurrentTaskType("valid");
            setShowModal(true);
          
            return;
        }
        if (!allEmails.includes(connection))
        {
            setCurrentTaskType("noemail");
            setShowModal(true);
            setConnection('');
            return;
        }
       
       
        handleUpdate(connection);
    }

    /**
 * Function to handle updating user connections.
 * @param {string} connect - The email to be added as a connection.
 */
   async function handleUpdate(connect:string)
    {
        var newConnections;
        var Id;
        var Emailid;

        await axios.get(`${baseUrl}/Connection/GetUser/`, { params: { id: id } }).then((response) => {

            Id = response.data.id;
            Emailid = response.data.emailId;
            newConnections = response.data.connection;
            if (response.data.connection != null) {
                newConnections = [...newConnections, connect];
            }
            if (response.data.connection == null) {
                newConnections = [connect];
            }
        }).catch((error) => {
            alert("error in getting the Id  " + error);


        });
        await axios.put(`${baseUrl}/Connection/Update`,
            {

                Id: Id,
                EmailId: Emailid,
                Connection: newConnections,


            }).then(() => {

                setEmailIds(prevEmailIds => [...prevEmailIds, connect]);
                setCurrentTaskType('connectionadded');
                setShowModal(true);


            }).catch((error) => {
                alert("error in update " + error);

            });

        setConnection('');


    }


    const styles = {
        main: {padding:"30px"},
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            minHeight: "500vh",
          
            marginBottom: "20px",
        },
        content: {
        
            padding: "20px",
            borderRadius: "0px",
           
            
        },
        heading: {
            textAlign: "center",
            marginBottom: "20px",
        },
        form: {
            marginBottom: "20px",
            
        },
        table: {
            width: "100%",
            backgroundColor: 'transparent',
            
             
            
        },

    };
  

   
    return (
       
        <>
            <Logout />
            <div style={styles.main }>
            <div>
               
                    <button className="back-button" onClick={goBack}>
                        Back
                    </button>

            </div>

            <div >

                <div style={styles.content}>


                        <form style={styles.form}>
                            <div className="style">
                                <label style={{ fontSize: '28px', fontWeight: 'bold', paddingBottom: "10px" }}> Welcome To Your Connections Page,  {userEmail}! </label>
                                <br/>
                            
                            </div>
                            <div className="style">
                                <label style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: "10px", textAlign: "center" }}>Add a New Connection</label>
                               

                            </div>
                            
                       
                       
                            <div  style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="formControl"
                                    id="emailid"
                                    value={connection}
                                    placeholder="Add Email of the required connection"
                                    onChange={(event) => {
                                        setConnection(event.target.value);
                                    }}
                                />
                            </div>

                            <div style={{ textAlign: "center" }}>
                        <button className="btn btnPrimary mt-4" onClick={Update}>
                            Add Connection
                            </button>
                            </div>
                           
                            <div>
                                {allEmails
                                    .filter(email => (!emailIds.includes(email) && email !== userEmail))
                                    .map((email, index) => (
                                        
                                            <div className="tag">
                                            <span> {email}</span>  
                                                <FaPlus className="add-icon"
                                                    
                                                    type="button"
                                                    onClick={() => handleUpdate(email)}
                                                    style={{ cursor: 'pointer' }}  />                                              
                                            </div>
                                           
                                    ))}
                            </div>
                        </form>
                        {emailIds.length > 0 && (
                       <><hr style={{ borderTop: "1px solid black", margin: "20px 0" }} /><div style={{ textAlign: "center", paddingTop: "10px", paddingBottom: "10px" }}> {/* Centered container for the label */}
                                <label style={{ fontSize: "20px", fontWeight: "bold", textAlign: "center" }}>Your Connections</label>
                            </div><table className="CustomTable" style={{ ...styles.table, tableLayout: 'fixed' /*, borderCollapse: 'collapse' */ }}>
                                    <colgroup>
                                        <col style={{ width: '60%' }} /> {/* Adjust the column widths as needed */}
                                        <col style={{ width: '20%' }} />
                                        <col style={{ width: '20%' }} />
                                    </colgroup>
                                    <tbody>
                                        {emailIds.map((email, index) => (
                                            <tr key={email}>
                                                <td
                                                    className={`customTableCell ${expandedEmail === index ? 'expanded' : ''}`}
                                                    onClick={() => toggleExpand(index)}
                                                >
                                                    {email}
                                                </td>
                                                <td className="customTableCell" style={{ textAlign: "center" }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-success"
                                                        onClick={() => handleViewCalendar(email)}
                                                    >
                                                        View Calendar
                                                    </button>
                                                </td>
                                                <td className="customTableCell" style={{ textAlign: "center" }}>
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => DeleteEventConfirm(email)}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table></>
                        )}
                    

                   </div>
                </div>
                {currentTaskType && (
                    <MyModal show={showModal} onClose={handleCloseModal} taskType={currentTaskType} />
                )}
                <Modal show={confirmationModal} onHide={() => setConfirmationModal(false)}>
                    <Modal.Header style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <Modal.Title> <strong>Delete Confirmation </strong></Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}>
                        <p>          <strong> Are you sure you want to delete?</strong></p>   </Modal.Body>
                    <Modal.Footer style={{ display: 'flex', justifyContent: 'center' }}>

                        <Button variant="danger" onClick={()=>Delete(email)}>
                            Yes
                        </Button>
                        <Button variant="secondary" onClick={() => setConfirmationModal(false)}>
                            No
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div></>
             
    );
       
}
export default Connections;




                                            
