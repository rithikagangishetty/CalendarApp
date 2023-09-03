
import {FC, useState, useEffect } from 'react';
import { Calendar, Event, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import { useParams, useNavigate } from 'react-router-dom';
import React from 'react';
import 'moment-timezone'; 
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import MyModal, { EventModal, EditEventModal, SelectEmailModal, DeleteConfirmModal, Logout } from './Modal';
import styled from 'styled-components';


const StyledDiv = styled.div`
 text-align: center;`;

type TaskType = 'eventadded' | 'eventdeleted' | 'overlap' | 'noevent'|'past' | 'eventedited' | 'editpast' | 'eventclash'|'noedit'; // Define the possible task types
const CalendarPage: React.FC = () => {
    const localizer = momentLocalizer(moment);
    const  params = useParams();
    const connectionId = params.connectionId;
    const id = params.id;
    const [creator, setCreator] = useState<boolean>(true);
    const [deleteUserEmail, setDeleteUserEmail] = useState<string>('');
    const [Edit, setEdit] = useState<boolean>(false);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [deleteTimezone, setDeleteTimezone] = React.useState<string>('');
    const [connections, setConnections] = useState<Array<string>>([]);
    const [showModal, setShowModal] = useState(false);
    const [currentTaskType, setCurrentTaskType] = useState<TaskType | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteEventId, setDeleteEventId] = useState<string>('');
    const [UserId, setUserId] = useState<string>('');
    const [deleteEvent, setDeleteEvent] = useState<Event>();
    const [titleInput, setTitleInput] = useState<string>('');
    const [startdate, setStart] = useState<Date>(new Date());
    const navigate = useNavigate();
    const [initialTimezone, setInitialTimezone] = React.useState<string>('');
    const [enddate, setEnd] = useState<Date>(new Date());
    const [connect, setConnect] = useState<string[]>([]);
    const [moder, setModer] = useState<string[]>([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [priv, setPrivate] = useState<boolean>();
    const [selectedModerators, setSelectedModerators] = useState<string[]>([]);
    const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
    const timezones = moment.tz.names();
    const [selectedTimezone, setSelectedTimezone] = React.useState<string>('');
    const [validationError, setValidationError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const currentDate = moment();
    const [currentView, setCurrentView] = useState<View>('month');
    const baseUrl = process.env.REACT_APP_URL;
    const [isPast, setIsPast] = useState<boolean>(false);
    const [isDelete, setIsDelete] = useState<boolean>(false);
    const [EmailId, setEmailId] = useState<string>("");
    const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    /**
 * Closes the create modal and resets form variables.
 */
    const handleCloseModal = () => {

        setShowModal(false);
    };
    /**
* Sets the state for the delete and delete confirmation modal.
*/
    const DeleteEventConfirm = () => {
        setConfirmationModal(true);
        setShowDeleteModal(false);
    }
    /**
 * Closes the create modal and resets form variables.
 */
    const onCloseConfirm = () => {
        setConfirmationModal(false);
        setShowDeleteModal(true);

    }

/**
* Navigates back to the home page.
*/
    function goBack() {
        navigate(-1);
    }

    useEffect(() => {

        getEvents();
        GetEmail();
        GetConnections()
        if (selectedTimezone) {
            moment.tz.setDefault(selectedTimezone);
            setCurrentView(currentView);
        }
    }, [showModal, selectedTimezone,currentView]);

    /**
     * Will get the Email Id of the user
     */
    function GetEmail() {
        axios.get(`${baseUrl}/Connection/GetUser/`, { params: { id: connectionId } }).then((response) => {


            
            setEmailId(response.data.emailId);
        });

    }
    //css of the calendar
    const calendarContainerStyle = {
        height: "80vh",
        background: "white",
        width: "90%",
        padding: "10px"

    };
    /**
    * Gets all the events that connectionId and id are part in together.
    */
    
    const getEvents = () => {



        axios.get(`${baseUrl}/User/GetView`, { params: { id: id, connectionId: connectionId } }).then((response) => {
            const event = response.data.map((training: any) => {
                return {
                    Id: training.id,
                    title: training.eventName,
                    start: new Date(training.startDate),
                    end: new Date(training.endDate),
                    allDay: false,
                    UserId: training.userId,
                    Moderator: training.moderator,
                    Connections: training.connections,
                    priv: training.priv,
                    TimeZone: training.timeZone,
                    Reminder:training.reminder,
                }
            })
            setEvents(event);
        }).catch((err) => {
            alert(err)
        });



    }
    /**
     * GetConnections will get all the connections of the user based on the User id.
     * This function will be called every time when the variables in the useEffect block change.
     */
    function GetConnections() {
        axios.get(`${baseUrl}/Connection/GetEmail`, { params: { id: id } }).then((response) => {

            setConnections(response.data.connection);
        }).catch((error) => {
            alert(error)
        });

    }

 //Gets the defaultTimeZone of the client
    moment.tz.setDefault(selectedTimezone);

    // Handle timezone selection change
    const handleTimezoneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setDeleteTimezone(event.target.value);
    };

    /**
     * DeleteEvent will delete the event based on the userId and event Id
     * after axios delete API call, the response is the details of the events
     * which are then used to send an email after the deletion.
     * This function will be called every time when the variables in the useEffect block change.
     *
     * @param {React.MouseEvent<HTMLButtonElement>} event - The mouse event triggered when the delete button is clicked.
     */
 async  function DeleteEvent(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        var eventName;
        var Moderator;
        var Connection;
     var dateStart;
     var deleteId;
        var dateEnd;
     await axios.delete(`${baseUrl}/User/Delete`, { params: { id: deleteEventId, userId: connectionId } }).then((response) => {
            eventName = response.data.eventName;
            Moderator = response.data.moderator;
            Connection = response.data.connections;
            dateStart = response.data.startDate;
         dateEnd = response.data.endDate;
         deleteId = response.data.userId;
            setCurrentTaskType('eventdeleted');
            setShowModal(true);
         setConfirmationModal(false);
         setShowDeleteModal(false);
         onClose();
     }).catch((error) => {
         alert(error);
     });
     axios.post(`${baseUrl}/User/SendMail`,
            {
                Id: deleteEventId,
                UserEmail: id,
                EventName: eventName,
                Moderator: Moderator,
                Connections: Connection,
                StartDate: dateStart,
                Delete: true,
                EndDate: dateEnd,
                priv:priv,
                Subject: "Event is Deleted",
                Body: `An event titled '${eventName}' has been deleted.`,
            }).then(() => {
                 //alert("email sent");
            }).catch((error) => {
                alert("error in mail " + error)
            });
    };


    /**
     * Takes the event and returns the moderators and connections array with emailIds instead of object Id.
     *
     * @param {any} event - The event object for which you want to retrieve email addresses.
     */
    function showEmails(event: any) {

        axios
            .get(`${baseUrl}/User/GetEvent`, { params: { id: event.Id } })
            .then((response) => {
                const newEvent = {
                    title: response.data.eventName,
                    start: response.data.startDate,
                    end: response.data.endDate,
                    Moderator: response.data.moderator,
                    UserId: response.data.userId,
                    Connections: response.data.connections,
                    priv: response.data.priv,
                    Id: response.data.id,
                    TimeZone:response.data.timeZone,
                    Reminder: response.data.reminder,
                };
                setDeleteEvent(newEvent);
                setDeleteEventId(newEvent.Id);
                setTitleInput(newEvent.title);
                setStart(new Date(newEvent.start));
                setEnd(new Date(newEvent.end));
                setSelectedModerators(newEvent.Moderator);
                setSelectedConnections(newEvent.Connections);
                setPrivate(newEvent.priv);
                setDeleteUserEmail(newEvent.UserId);
                setDeleteTimezone(newEvent.TimeZone);
                setInitialTimezone(newEvent.TimeZone);
            })
            .catch((error) => {
                alert(error);


            });

    }
    /// <summary>
        /// EditEvent will edit the event after few checks
        ///After the user enters the start and end time it checks whether any existing event overlaps with the entered data
        ///If yes, a modal pops up with the suitable message
        ///Else, using the event id the document gets updated
        ///After updating a email will be sent
        ///this function will be called everytime when the variables in the useEffect block changes
        /// </summary>

    /**
*  EditEvent will edit the event after few checks
*  After the user enters the start and end time it checks whether any existing event overlaps with the entered data
*  If yes, a modal pops up with the suitable message
*  Else, using the event id the document gets updated
*  After updating a email will be sent
*  this function will be called everytime when the variables in the useEffect block changes
* @param {boolean} Priv - A boolean value indicating whether the event is private.
*/
    async function EditEvent(Priv: boolean) {

        var users;
        var eventId;

        for (var _event of events) {
            // Check if the event overlaps with any existing event
            if (_event.start !== undefined && _event.end !== undefined) {

                if (_event.Id != deleteEventId) {
                    if (
                        (startdate >= _event.start && startdate < _event.end) ||
                        (enddate > _event.start && enddate <= _event.end) ||
                        (startdate <= _event.start && enddate >= _event.end)
                    ) {
                        setCurrentTaskType('eventclash');
                        setShowModal(true);
                        return; // Clash found

                    }
                }
            }
        }

        await axios.get(`${baseUrl}/Connection/GetUser`, { params: { id: UserId } }).then((response) => {

            users = response.data.connection;

        }).catch((error) => { alert("error in get " + error) });

        await axios.put(`${baseUrl}/User/Update`, {
            Id: deleteEventId,
            UserId: (creator) ? UserId : id,
            EventName: titleInput,
            StartDate: startdate,
            Moderator: selectedModerators,
            EndDate: enddate,
            Connections: (Priv ? selectedConnections : users),
            priv: Priv,
            TimeZone: (selectedTimezone == "") ? defaultTimeZone : selectedTimezone,
            Reminder: false,
        }).then((response) => {

            eventId = response.data.id;
            setModer(response.data.moderator);
            setConnect(response.data.connections);
            if (eventId != "noevent" && eventId != "eventclash" && eventId != 'someevent') {

                setCurrentTaskType('eventedited');
                setShowModal(true);
                setShowEditModal(false);
                setShowDeleteModal(false);
                onClose();
                setEdit(false);
            }
            else if (eventId == "noevent") {
                setShowEditModal(false);
                setShowDeleteModal(false);
                onClose();
                setCurrentTaskType('noevent');
                setShowModal(true);
                setEdit(false);
            }
            else {
                setShowEditModal(false);
                setShowDeleteModal(false);
                onClose();
                setShowEventModal(true);
                setEdit(false);

            }
        }).catch((error) => { alert(error); });

        await axios.post(`${baseUrl}/User/SendMail`,
            {
                Id: deleteEventId,
                UserEmail: id,
                EventName: titleInput,
                Moderator: selectedModerators,
                Connections: (Priv ? selectedConnections : users),
                StartDate: startdate,
                EndDate: enddate,
                priv: Priv,
                Delete: false,
                Subject: "Event is Edited",
                Body: `An event titled '${titleInput}' has been created.The start time of the event is '${startdate}' and ends at '${enddate}'.`,
            }).then(() => {
                //   alert("email sent");
            }).catch((error) => {
                //  alert("error in mail " + error)
            });

    };
   
    /**
     * handlePost is a function called when the user creates a public post.
     * It performs basic checks, and if it's an edit, it calls EditEvent().
     * 
     * @param {React.MouseEvent<HTMLButtonElement>} event - The mouse event triggered when creating or editing a post.
     */

    function handlePost(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();

        if (titleInput.trim() == '') {
            setValidationError('Please enter a valid title.');
            return;
        }

        else {
            setValidationError('');
            setPrivate(false);
            if (Edit) {

                EditEvent(false);

            }
            
        }
    }

/**
 * onCloseDelete is a function called to close the edit modal.
 */
    const onCloseDelete = () => {
        setShowEditModal(false);

        onClose();



    }
    /**
     * handlePrivatePost is a function called when the user creates a private post.
     * In the private post, the user is allowed to choose the connections, so a new modal will pop up where all the connections will be displayed.
     * That is done by the modal setShowEmailModal.
     * 
     * @param {React.MouseEvent<HTMLButtonElement>} event - The mouse event triggered when creating a private post.
     */
    function handlePrivatePost(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        if (titleInput.trim() == '') {
            setValidationError('Please enter a valid title.');
            return;

        }

        else {
            setValidationError('');
            setPrivate(true);
            
                setShowEditModal(false);
            
            setShowEmailModal(true);
        }
    }
    /**
     * handleEditEvent is a function called when the user wants to edit an event.
     * It enables the edit modal pop-up and sets the edit variable to true.
     * 
     * @param {React.MouseEvent<HTMLButtonElement>} event - The mouse event triggered when editing an event.
     */
    function handleEditEvent(event: React.MouseEvent<HTMLButtonElement>) {

        setShowDeleteModal(false);
        setEdit(true);
        setShowEditModal(true);


    }

    /**
   * CustomEventContent is a component for displaying the title, start, and end times when scrolled over an event.
   * 
   * @param {any} event - The event object to be displayed.
   */

    const CustomEventContent = ({ event }: any) => (
        <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{event.title}</div>
            <div style={{ fontSize: '13px' }}>{moment(event.start).format('LT')} - {moment(event.end).format('LT')}</div>
        </div>
    );

    /**
  * tooltipAccessor is a function for providing tooltip content for events.
  * 
  * @param {any} event - The event object for which to provide tooltip content.
  * @returns {string} - The tooltip content.
  */
    const tooltipAccessor = (event: any) => {
        return `Title: ${event.title}\nStart: ${event.start.toLocaleString()}\nEnd: ${event.end.toLocaleString()}`;

    };


    // Override the time format to empty string which is shown in calendar
    const eventFormats = {
        eventTimeRangeFormat: () => '',
    };

    /**
     * handleDelete is a function called when the user clicks on any event. It first checks if the user is a moderator
     * or a connection of the event. If yes, they can delete/edit the event; otherwise, they can't modify the event.
     * All the basic checks are done, and if the event is in the past, 'isPast' is set to true, which disables the edit option.
     * The delete modal becomes true.
     * 
     * @param {any} event - The event object for which to handle deletion.
     */
    function handleDelete(event: any) {

        
        setPrivate(event.priv);
        const eventStart = moment(event.start);
        const isPastEvent = eventStart.isBefore(currentDate);
        setIsPast(isPastEvent);
    
            if (event.Connections.includes(id))
            {
                
                setIsDelete(true);
                setIsPast(true);
            }
        
        setDeleteEventId(event.Id);
        setUserId(event.UserId);
        showEmails(event);
        setShowDeleteModal(true);
                
            
        
    };

    /**
 * onClose is a function called to reset various state variables when closing a modal.
 */
    const onClose = () => {
        setTitleInput("");
        setStart(currentDate.toDate());
        setSelectedConnections([]);
        setSelectedModerators([]);
        setEnd(currentDate.toDate());
         setPrivate(false);
    }
    
    const [expandedEmail, setExpandedEmail] = useState<number | null>(null);

 /**
 * toggleExpand is a function used to toggle the expansion of email details.
 * 
 * @param {number} index - The index of the email details.
 */
    const toggleExpand = (index: number) => {
        if (expandedEmail === index) {
            setExpandedEmail(null);
        } else {
            setExpandedEmail(index);
        }
    };

    /**
     * renderEmailCheckbox is a function used to render checkboxes for connections in the event details.
     * To avoid adding the same user twice as a connection and moderator, this function is used.
     * It checks the selectedModerators array; all the users present in the array are disabled to select in the connections pop-up.
     * 
     * @param {string} connection - The connection name.
     * @param {number} index - The index of the connection.
     * @returns {JSX.Element} - The JSX element for the checkbox.
     */
   
    const renderEmailCheckbox = (connection: string,index:number) => {
        const isDisabled = selectedModerators.includes(connection) || (connection == deleteUserEmail && creator);

        return (
            <Form.Check
                key={connection}
                type="checkbox"
                id={connection}

                label={
                    <span
                        className={`truncated ${expandedEmail === index ? 'expanded' : ''}`}
                        onClick={() => toggleExpand(index)}

                    >
                        {connection}
                    </span>
                }
                checked={selectedConnections.includes(connection)}
                onChange={() => handleUserSelection(connection, true)}
                disabled={isDisabled}
            />
        );
    };

    /**
     * handleUserSelection is a function for selecting users (connections/moderators) for private posts.
     * It checks if the connection is already present; if yes, it will not update the array of selected users;
     * otherwise, the new connection is added to the selected array.
     * @param {string} user - The user (connection/moderator) to be selected.
     * @param {boolean} connect - A boolean indicating whether the user should be selected as a connection.
     */
    const handleUserSelection = (user: string, connect: boolean) => {
        if (!connect) {
            if (selectedModerators.includes(user)) {
                setSelectedModerators(selectedModerators.filter((selectedModerator) => selectedModerator !== user));
            } else {
                setSelectedModerators([...selectedModerators, user]);
            }
        }
        else {
            const selected = [...selectedConnections];

            if (selected.includes(user)) {
                const index = selected.indexOf(user);
                selected.splice(index, 1);
            } else {
                selected.push(user);
            }

            setSelectedConnections(selected);

        }
    };

    /**
     * handleSaveSelectedConnections is a function for private posts to ensure that the user selects at least one other user
     * as a connection/moderator. If no users are selected, it displays a validation error. Otherwise, it clears the selected connections,
     * hides the email modal, and calls EditEvent if Edit is true; otherwise, it calls the post function.
     */

    const handleSaveSelectedConnections = () => {
        if (selectedModerators.length === 0 && selectedConnections.length === 0) {
            setValidationError('Please select at least one moderator or connection.');
        }
        else {
            setValidationError('');
            setSelectedConnections([]);
            setShowEmailModal(false);
            if (Edit) {
                EditEvent(true);
            }
            
        }
    };

   
   

    return (
        <div style={{ paddingTop: '20px', height: '80%', overflow: 'hidden', paddingBottom: '20px' }} >
          
                <div>
                    <StyledDiv>
                    <h4><strong>
                        Welcome to {EmailId} Calendar!
                        </strong></h4>
                    </StyledDiv>
                </div>
                <StyledDiv>
                    <br />
                    <label style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom:"20px" }}> Select Timezone </label>
                    <br />
                    <select value={selectedTimezone} onChange={(event) => setSelectedTimezone(event.target.value)}>
                        <option value=""> {defaultTimeZone}</option>
                        {timezones.map((timezone) => (

                            <option key={timezone} value={timezone}>
                                {timezone}
                            </option>
                        ))}
                </select> </StyledDiv>
                <div>
                <button className="back-button" onClick={goBack}>
                    Back
                </button>

                </div>
                <div >
                    <br />
                    <strong>
                    <StyledDiv>
                        {currentView != 'agenda' && (
                            <span>
                                Click an event to edit or delete
                            </span>
                        )}
                        {currentView === 'agenda' && (
                            <span>
                                All events spanning the month are displayed here.
                            </span>
                        )}

                        <br />
                       
                    </StyledDiv>
                    </strong>
                </div>
                <br />
            <div className="calendarContainerStyle">
                <Calendar
                
                    defaultView='month'
                    events={events}
                    localizer={localizer}
                    startAccessor="start"
                    endAccessor="end"
                    tooltipAccessor={tooltipAccessor}
                   formats={eventFormats}
                    onView={newView => setCurrentView(newView)}
                    titleAccessor="title"
                    onSelectEvent={handleDelete}
                    components={{
                        event: CustomEventContent,
                    }}
                    style={calendarContainerStyle}
                    step={15}

                />
                </div>

            <Logout />

            {deleteEvent && (
                <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                    <Modal.Header style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }} >

                        <Modal.Title>Details of the Event</Modal.Title>

                    </Modal.Header>

                    <Modal.Body >
                        <p><strong>Title:</strong> {deleteEvent.title}</p>
                        <p><strong>Event Created by:</strong> {deleteEvent.UserId}</p>
                        <p><strong>Event Type:</strong> {deleteEvent.priv ? 'Private' : 'Public'}</p>
                        <p><strong>TimeZone:</strong> {deleteEvent.TimeZone}</p>
                        {deleteEvent.start && (
                            <p><strong>Start:</strong> {new Date(deleteEvent.start).toLocaleString('en-US', {
                                timeZone: deleteEvent.TimeZone,
                                dateStyle: 'medium',
                                timeStyle: 'medium'
                            })}</p>
                        )}
                        {deleteEvent.end && (
                            <p><strong>End:</strong> {new Date(deleteEvent.end).toLocaleString('en-US', {
                                timeZone: deleteEvent.TimeZone,
                                dateStyle: 'medium',
                                timeStyle: 'medium'
                            })}</p>
                        )}
                        {deleteEvent.Moderator && deleteEvent.Moderator.length > 0 && (
                            <>
                                <p><strong>Moderators:</strong></p>
                                <ul>
                                    {deleteEvent.Moderator.map((moderator: string, index: number) => (
                                        <li key={index} >
                                            <span
                                                className={`truncated ${expandedEmail === index ? 'expanded' : ''}`}
                                                onClick={() => toggleExpand(index)}

                                            >
                                                {moderator}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                        {deleteEvent.Connections && deleteEvent.Connections.length > 0 && (
                            <div>
                                <p><strong>Connections:</strong></p>
                                <ul>
                                    {deleteEvent.Connections.map((connection: string, index: any) => (
                                        <li key={index}> <span
                                            className={`truncated ${expandedEmail === index ? 'expanded' : ''}`}
                                            onClick={() => toggleExpand(index)}

                                        >
                                            {connection}
                                        </span></li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }} >

                        </div>
                    </Modal.Body>


                    <Modal.Footer style={{ display: "flex", justifyContent: "center" }}>
                        <div>
                            <p><strong>{isPast ? "Do you want to delete this event?" : "Do you want to delete/edit this event"}</strong></p>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                {!isPast && (
                                    <Button variant="success" onClick={handleEditEvent} disabled={isPast}>
                                        Edit
                                    </Button>
                                )}
                                <Button variant="danger" onClick={DeleteEventConfirm}>
                                    Delete
                                </Button>
                                <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Modal.Footer>

                </Modal>)}


            {currentTaskType && (
                <MyModal show={showModal} onClose={handleCloseModal} taskType={currentTaskType} />
            )}
            <EditEventModal
                initialTimezone={initialTimezone}
                handleTimezoneChange={handleTimezoneChange}
                selectedTimezone={deleteTimezone}
                userId={deleteUserEmail}
                creator={creator}
                defaultTimeZone={defaultTimeZone}
                timezones={timezones}
                show={showEditModal}
                onClose={onCloseDelete}
                onPost={handlePost}
                setCreator={setCreator}
                onPrivatePost={handlePrivatePost}
                validationError={validationError}
                titleInput={titleInput}
                onTitleInputChange={setTitleInput}
                setEnd={setEnd}
                setStart={setStart}
                start={startdate}
                end={enddate}
                connections={connections}
                selectedModerators={selectedModerators}
                setSelectedModerators={setSelectedModerators}
                handleUserSelection={handleUserSelection}
                priv={priv }

            />
            
            <SelectEmailModal
                show={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onSaveSelectedConnections={handleSaveSelectedConnections}
                validationError={validationError}
                connections={connections}
                renderEmailCheckbox={renderEmailCheckbox}

            />
            <EventModal
                show={showEventModal}
                onHide={() => setShowEventModal(false)}
                moderators={moder}
                connections={connect}
            />
            <DeleteConfirmModal
                show={confirmationModal}
                onClose={onCloseConfirm}
                onDelete={DeleteEvent}
            />

        </div>
    );
};

export default CalendarPage;
