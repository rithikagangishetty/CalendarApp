import { FC, useState, useEffect, useRef } from 'react'
import { Calendar, Event, momentLocalizer, View } from 'react-big-calendar'
import moment from 'moment';
import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import 'moment-timezone'; 
import 'react-big-calendar/lib/css/react-big-calendar.css'
import styled from 'styled-components';
import axios from 'axios';
import './NavMenu.css';
import { Form } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import MyModal, { EditEventModal, CreateEventModal, SelectEmailModal, EventModal, DeleteConfirmModal, Logout } from './Modal';



type TaskType = 'eventadded' | 'eventdeleted' | 'overlap' | 'past' | 'monthpast' | "noevent"|'eventedited' | 'editpast' | 'eventclash' |"noconnections"; // Define the possible task types

const StyledDiv = styled.div`

  text-align: center;`; 


const CalendarApp: FC = () => {
    const localizer = momentLocalizer(moment);
    const [edit, setEdit] = useState<boolean>(false);
    const [isPast, setIsPast] = useState<boolean>(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [creator, setCreator] = useState<boolean>(true);
    const [connections, setConnections] = useState<Array<string>>([]);
    const params = useParams();
    const id = params.id;
    const [showModal, setShowModal] = useState(false);
    const [currentTaskType, setCurrentTaskType] = useState<TaskType | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteEventId, setDeleteEventId] = useState<string>('');
    const [deleteEventUserId, setDeleteEventUserId] = useState<string>('');
    const [deleteEvent, setDeleteEvent] = useState<Event>();
    const [userEmail, setUserEmail] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [confirmationModal, setConfirmationModal] = useState(false);
    const [titleInput, setTitleInput] = useState<string>('');
    const [startDate, setStart] = useState<Date>(new Date());
    const [endDate, setEnd] = useState<Date>(new Date());
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [showEventModal, setShowEventModal] = useState(false);
    const navigate = useNavigate();
    const [priv, setPrivate] = useState<boolean>(false);
    const baseUrl = process.env.REACT_APP_URL;
    const [selectedModerators, setSelectedModerators] = useState<string[]>([]);
    const [deleteUserEmail, setDeleteUserEmail] = useState<string>('');
    const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
    const [connect, setConnect] = useState<string[]>([]);
    const [moder, setModer] = useState<string[]>([]);
    const timezones = moment.tz.names();
    const [selectedTimezone, setSelectedTimezone] = React.useState<string>('');
    const [deleteTimezone, setDeleteTimezone] = React.useState<string>('');
    const [initialTimezone, setInitialTimezone] = React.useState<string>('');
    const [validationError, setValidationError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentView, setCurrentView] = useState<View>('month');

    const currentDate = moment();
    useEffect(() => {

        getEvents();
        GetConnections();
        if (selectedTimezone) {
            moment.tz.setDefault(selectedTimezone);
            setCurrentView(currentView);
        }


    }, [selectedTimezone, showModal, currentView]);

 /**
 * Navigates back to the home page.
 */
    function goBack() {
        navigate(`/Home/${id}`);
    }
    
    moment.tz.setDefault(selectedTimezone);

    /**
 * Handles the change event for the timezone selection.
 *
 * @param {React.ChangeEvent<HTMLSelectElement>} event - The change event containing the selected timezone value.
 */

    const handleTimezoneChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setDeleteTimezone(event.target.value);
    }
   
    /**
  * Resets form variables to empty to clear past information.
  */
    const onClose = () => {
        setTitleInput("");
        setSelectedConnections([]);
        setSelectedModerators([]);
       
        setPrivate(false);
    }

    /**
 * Sets the state for the delete and delete confirmation modal.
 */
    const DeleteEventConfirm = () => {
        setConfirmationModal(true);
        setShowDeleteModal(false);
    }
   
    //Gets the defaultTimeZone of the client
    const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    /**
     * getEvents will get all the events of the user based on the User id.
     * Once all the events are obtained using setEvents, all the events will be updated and will be shown in the calendar page.
     * This function will be called every time when the variables in the useEffect block change.
     */
       
    const getEvents = () => {
        axios.get(`${baseUrl}/User/GetEvents`, { params: { id: id } }).then((response) => {
           
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
                        Reminder: training.reminder,
                    }
                })
                setEvents(event);
            
            
          
        }).catch((err) => {
            alert(err+"get Events based on userId")
        });


    }
    /**
     * Posts a new event to the database, sends email notifications on success.
     */
   


    async function Post() {

        
        var userConnections;
        var eventId;
        await axios.get(`${baseUrl}/Connection/GetUser`, { params: { id: id } }).then((response) => {

            userConnections = response.data.connection;

        }).catch((error) => { alert("error in get " + error) });
        await axios.post(`${baseUrl}/User/Post`,
            {
                Id: '',
                UserId: id,
                EventName: titleInput,
                StartDate: startDate,
                Moderator: selectedModerators,
                EndDate: endDate,
                Connections: (priv ? selectedConnections : userConnections),
                priv: priv,
                TimeZone: (selectedTimezone == "") ? defaultTimeZone : selectedTimezone,
                Reminder: false,
           }).then((response) => {
               eventId = response.data.id;
               setModer(response.data.moderator);
               setConnect(response.data.connections);
               
               if (eventId != "noevent" && eventId != "eventclash" && eventId != 'someevent') {
                   setShowCreateModal(false);
                   onClose();
                   setCurrentTaskType('eventadded');
                   setShowModal(true);
               }
               else if (eventId == "noevent") {
                   setShowCreateModal(false);
                   onClose();
                   setCurrentTaskType('noevent');
                   setShowModal(true);
               }
               else {
                   setShowCreateModal(false);
                   onClose();
                   setShowEventModal(true);

               }




            }).catch((error) => {
                alert("error in post " + error)
            });
        if (eventId != "noevent" && eventId != "eventclash" && eventId != "someevent") {

            axios.post(`${baseUrl}/User/SendMail`,
                {
                    Id: eventId,
                    UserEmail: id,
                    EventName: titleInput,
                    Moderator: selectedModerators,
                    Connections: (priv ? selectedConnections : userConnections),
                    StartDate: startDate,
                    EndDate: endDate,
                    Delete: false,
                    priv: priv,
                    Subject: "Event is Created",
                    Body: `An event titled '${titleInput}' has been created.
                The start time of the event is '${startDate}' and ends at '${endDate}'.`,
                }).then(() => {
                    // alert("email sent");
                }).catch((error) => {
                     alert("error in mail " + error)
                });
        }

    };

    /**
       * GetConnections will get all the connections of the user based on the User id.
       * This function will be called every time when the variables in the useEffect block change.
       */
    function GetConnections() {
        axios.get(`${baseUrl}/Connection/GetEmail`, { params: { id: id } }).then((response) => {
            setUserEmail(response.data.emailId);
            setConnections(response.data.connection);
            var res = response.data.connection;
            if (res.length == 0) {
                setCurrentTaskType('noconnections');
                setShowModal(true);
                navigate(`/Home/Connections/${id}`);
            }
        }).catch((error) => {
            alert(error+"to get all connections")
        });

    }
   
    /**
   * Deletes an event, sends a deletion email, and handles modal state changes.
   *
   * @param {React.MouseEvent<HTMLButtonElement>} event - The click event triggering the delete action.
   */
    async function DeleteEvent(event: React.MouseEvent<HTMLButtonElement>) {
       event.preventDefault();
       
      
      var eventName;
      var moderator;
      var connection;
      var dateStart;
      var dateEnd;
        await axios.delete(`${baseUrl}/User/Delete`, { params: { id: deleteEventId, userId: id } }).then((response) => {


         eventName = response.data.eventName;
         moderator = response.data.moderator;
         connection = response.data.connections;
         dateStart = response.data.startDate;
         dateEnd = response.data.endDate;
            setShowDeleteModal(false);
            setConfirmationModal(false);
         setCurrentTaskType('eventdeleted');
            setShowModal(true);

         
         onClose();
        }).catch((error) => { alert(error+"deleting"); });
        axios.post(`${baseUrl}/User/SendMail`,
            {
                Id: deleteEventId,
                UserEmail: id,
                EventName: eventName,
                Moderator: moderator,
                Connections: connection,
                StartDate: dateStart,
                Delete: true,
                priv: priv,
                EndDate: dateEnd,
                Subject: "Event is Deleted",
                Body: `An event titled '${eventName}' has been deleted.`,
            }).then(() => {
              //  alert("email sent");
            }).catch((error) => {
                alert("error in mail " + error)
               });
     

    };
/**
 * Fetches event details for editing and updates state variables.
 *
 * @param {Object} event - The event object containing event details.
 */

    async function showEmails(event: any) {
       
        await axios
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
                    TimeZone: response.data.timeZone,
                    Reminder: response.data.reminder,
                };
                
                setDeleteEvent(newEvent);
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
                alert(error+"show email error");


            });
        

     
    };

    /**
    * Edits an event, checks for event clashes, and handles modal state changes.
    *
    * @param {boolean} Priv - A boolean indicating event privacy.
    */
    async function EditEvent(Priv:boolean) {
       
        var users;
        var eventId;
       
        for (var _event of events) {
            // Check if the event overlaps with any existing event
            if (_event.start !== undefined && _event.end !== undefined) {
                
                if (_event.Id != deleteEventId) {
                    if (
                        (startDate >= _event.start && startDate < _event.end) ||
                        (endDate > _event.start && endDate <= _event.end) ||
                        (startDate <= _event.start && endDate >= _event.end)
                    ) {
                        setCurrentTaskType('eventclash');
                        setShowModal(true);
                        return; // Clash found

                    }
                }
            }
        }
 
        await axios.get(`${baseUrl}/Connection/GetUser`, { params: { id: deleteEventUserId } }).then((response) => {

            users = response.data.connection;
            
        }).catch((error) => { alert("error in get " + error) });
       
        await axios.put(`${baseUrl}/User/Update`, {
            Id: deleteEventId,
            UserId: (creator)?deleteEventUserId:id,
            EventName: titleInput,
            StartDate: startDate,
            Moderator: selectedModerators,
            EndDate: endDate,
            Connections: (Priv ? selectedConnections : users),
            priv: Priv,
            TimeZone: (deleteTimezone == "") ? defaultTimeZone : deleteTimezone,
            Reminder: false,
        }).then((response) => {
           
            
            
            eventId = response.data.id;
            setModer(response.data.moderator);
            setConnect(response.data.connections);

            if (eventId != "noevent" && eventId != "eventclash" && eventId != 'someevent') {
                setShowEditModal(false);
                setShowDeleteModal(false);
                onClose();
                setEdit(false);
                setCurrentTaskType('eventedited');
                setShowModal(true);
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
        }).catch((error) => { alert(error+"in edit"); });
        if (eventId != "noevent" && eventId != "eventclash" && eventId != "someevent") {
            await axios.post(`${baseUrl}/User/SendMail`,
                {
                    Id: deleteEventId,
                    UserEmail: id,
                    EventName: titleInput,
                    Moderator: selectedModerators,
                    Connections: (Priv ? selectedConnections : users),
                    StartDate: startDate,
                    EndDate: endDate,
                    priv: Priv,
                    Delete: false,
                    Subject: "Event is Edited",
                    Body: `An event titled '${titleInput}' has been created.The start time of the event is '${startDate}' and ends at '${endDate}'.`,
                }).then(() => {
                    //   alert("email sent");
                }).catch((error) => {
                      alert("error in mail " + error)
                });
        }
    };
    /**
     * Checks if there are any events within the selected slot.
     * Prevents selection if events are present.
     *
     * @param {Object} slotInfo - Information about the selected time slot.
     */
    const overlap = (slotInfo: any) => {
        // Check if there are any events within the selected slot
        const eventsInSlot = events.filter
            (
                event =>
                (
                    event.start && event.end &&
                    (
                        (slotInfo.start >= event.start && slotInfo.start < event.end) ||
                        (slotInfo.end > event.start && slotInfo.end <= event.end) ||
                        (slotInfo.start <= event.start && slotInfo.end >= event.end)
                    )
                )
            )


        // Prevent selection if events are present
        if (eventsInSlot.length > 0) {
            return true;
        }



    };
    /**
     * Handles the selection of a time slot on the calendar, checks for overlapping events and past events,
     * and manages the display of appropriate notifications and modals.
     *
     * @param {any} event - The selected time slot event object.
     */
    const handleSelectSlot = (event: any) => {
        const selectedDate = moment(event.start);
       
        const isSameDay = selectedDate.isSame(currentDate, 'day');
       
        const isPastEvent = selectedDate.isBefore(currentDate);
        
        if (isSameDay && isPastEvent && currentView == "month") {
            setCurrentTaskType('monthpast');
            setShowModal(true);
            return;
        }
        if (!isSameDay && isPastEvent && currentView == "month") {
            setCurrentTaskType('past');
            setShowModal(true);
            return;
        }
        else if (isPastEvent && currentView!="month") {
            setCurrentTaskType('past');
            setShowModal(true);
            // Event is in the past, disable edit and delete options
            return;
        }
      


        else if (!isPastEvent) {

            setValidationError('');
            if (overlap(event)) {

                setCurrentTaskType('overlap');
                setShowModal(true);
                return;
            }

            else {
                setStart(event.start);
                setEnd(event.end);
                setShowCreateModal(true);


                if (titleInput.trim() !== '') {



                    const newEvent = {
                        title: titleInput,
                        start: event.start,
                        end: event.end,
                        Moderator: selectedModerators,
                        UserId: id,
                        Connections: (priv ? selectedConnections : connections),
                        priv: priv,
                        Id: "",
                        TimeZone: (selectedTimezone == "") ? defaultTimeZone : selectedTimezone,
                        Reminder: false,
                    };
                    setEvents([...events, newEvent]);

                }



            }
        }
      

    };
    /**
    * Customizes the content to be displayed for each event on the calendar.
    * @param {any} event - The event for which content is customized.
    */
    const CustomEventContent = ({ event }: any) => (
        <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', textAlign: 'center' }}>{event.title}</div>
            <div style={{ fontSize: '13px' }}>{moment(event.start).format('LT')} - {moment(event.end).format('LT')}</div>
        </div>
    );
    /**
 * Generates the tooltip content for event hover information.
 *
 * @param {any} event - The event for which tooltip information is generated.
 * @returns {string} - The tooltip content.
 */
    const tooltipAccessor = (event: any) => {
        return `Title: ${event.title}\nStart: ${event.start.toLocaleString()}\nEnd: ${event.end.toLocaleString()}`;

    }

    // Override the time format to empty string which is shown in calendar
    const eventFormats = {
        eventTimeRangeFormat: () => '', 
    }

    /**
    * Handles the post action when creating or editing an event.
    * Validates the title input and triggers the corresponding action (Post or EditEvent).
    *
    * @param {React.MouseEvent<HTMLButtonElement>} event - The click event triggering the post action.
    */
    function handlePost(event: React.MouseEvent<HTMLButtonElement>):void {
        event.preventDefault();
        
        if (titleInput.trim() == '') {
            setValidationError('Please enter a valid title.');
            return;
        }
       
        else {
            setValidationError('');
            setPrivate(false);
          
            if (edit) {
                
               
                    EditEvent(false);
                
            }
            else {
                Post();
            }
        }
    }

    /**
     * Handles the post action for private events.
     * Validates the title input and displays the email modal for private events.
     *
     * @param {React.MouseEvent<HTMLButtonElement>} event - The click event triggering the post action.
     */
    function handlePrivatePost(event: React.MouseEvent<HTMLButtonElement>):void {
        event.preventDefault();
       
        if (titleInput.trim() == '') {
            setValidationError('Please enter a valid title.');
            return;

        }
       
        else {
            setValidationError('');
            setPrivate(true);
            if (edit) {
                setShowEditModal(false);
            } else {
                setShowCreateModal(false);
            }
            setShowEmailModal(true);
        }
    }
    /**
   * Enables the edit mode for events and opens the edit modal.
   *
   * @param {React.MouseEvent<HTMLButtonElement>} event - The click event triggering the edit action.
   */
 function handleEditEvent(event: React.MouseEvent<HTMLButtonElement>) {
     //check this
     setShowDeleteModal(false);
     setEdit(true);
     setShowEditModal(true);
       }
    /**
    * Handles the deletion of an event.
    * Checks if the event is in the past or if the user has permissions to delete it.
    *
    * @param {any} event - The event object to be deleted.
    */
   async function handleDelete(event: any) {
       setPrivate(event.priv);
       const eventStart = moment(event.start);
       
        const isPastEvent = eventStart.isBefore(currentDate);
       setIsPast(isPastEvent);
       if (!event.Moderator.includes(id) && event.UserId != id) {

           setIsPast(true);
       }
      
       setDeleteEventId(event.Id);
       setDeleteEventUserId(event.UserId);
       showEmails(event);

        setShowDeleteModal(true);
    };

    /**
 * Closes the create modal and resets form variables.
 */
    const handleClose = () => {
        setShowCreateModal(false);
        onClose();
      
    }
    /**
     * Handles the state of the create modal when closing it.
     * It either shows the private connections modal or resets form variables for consecutive modals.
     */

    const onCloseEdit = () => {
        setShowEmailModal(false);
        if (!edit) {
            
            setShowCreateModal(true);
}
       // onClose();

    }

    /**
 * Handles the state when closing the confirmation modal.
 * It shows the delete modal and clears form variables.
 */
    const onCloseConfirm = () => {
        setConfirmationModal(false);
        setShowDeleteModal(true);

    }

    /**
 * Handles the state of Delete and Delete Confirmation modals when closing them.
 * It closes the edit modal and resets form variables.
 */
    const onCloseDelete = () => {
        setShowEditModal(false);
          onClose();
       
        

    }

    /**
 * Handles the state when closing a modal.
 * It closes the modal and resets form variables.
 */
    const onDelete = () => {
        onClose();
        setShowDeleteModal(false);
    }

    /**
   * Toggles the expansion of an email element based on its index.
   * If the email is already expanded, it collapses it, and vice versa.
   * @param {number} index - Index of the email element.
   */
    const [expandedEmail, setExpandedEmail] = useState<number | null>(null);
    const toggleExpand = (index: number) => {
        if (expandedEmail === index) {
            setExpandedEmail(null);
        } else {
            setExpandedEmail(index);
        }
    };

    /**
     * Renders a checkbox for selecting connections in the event details.
     * It checks if a user can be selected as a connection or not based on certain conditions.
     * @param {string} connection - The email of the connection.
     * @param {number} index - Index of the connection element.
     * @returns {JSX.Element} - Checkbox element for the connection.
     */

    const renderEmailCheckbox = (connection: string,index:number) => {
        const isDisabled = selectedModerators.includes(connection) || (connection == deleteUserEmail && creator);

        return (
            <Form.Check
                key={connection}
                type="checkbox"
                id={connection}
                className="expand"
                label={
                   
                    <span
                        className={`truncated ${expandedEmail === index ? 'expanded' : ''}`}
                        onClick={() => toggleExpand(index)}

                    >
                        {connection}
                    </span>
                }
                checked={selectedConnections.includes(connection)}
                onChange={() => handleUserSelection(connection,true)}
                disabled={isDisabled}
            />
        );
    };
    

    /**
    * Handles user selection of connections or moderators.
    * If a user is selected, it adds them to the corresponding array; otherwise, it removes them.
    * @param {string} user - The user to be selected or deselected.
    * @param {boolean} connect - Indicates whether the user is a connection (true) or a moderator (false).
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
 * Handles date navigation within the allEventsRange.
 * Ensures that the provided date stays within the range of all events.
 * @param {Date} date - The date to navigate to.
 */
    const allEventsRange = {
        start: moment.min(events.map(event => moment(event.start))).toDate(),
        end: moment.max(events.map(event => moment(event.end))).toDate(),
    };



    const handleNavigate = (date: Date) => {
        // Prevent navigation to a date outside the allEventsRange
      
        if (date < allEventsRange.start) {
            date = allEventsRange.start;
        } else if (date > allEventsRange.end) {
            date = allEventsRange.end;
        }

       
        
    };
   
    
    /**
     * Handles saving selected connections for a private post.
     * Checks if at least one moderator or connection is selected.
     * Calls EditEvent if editing, or Post if creating a new event.
     */
   
    const handleSaveSelectedConnections = () => {
        if (selectedModerators.length === 0 && selectedConnections.length === 0) {
            setValidationError('Please select at least one moderator or connection.');
        }
        else {
            setValidationError('');
            setSelectedConnections([]);
            setShowEmailModal(false);
            
            if (edit) {
                
                EditEvent(true);
                
            }
            else {
           
                Post();
            }
        }
    };

  //stylesheet of the calendar container

    const calendarContainerStyle = {
        height: "80vh",
        background: "white",
        width: "90%",
        padding:"10px"
       
    };

    return (
         
        <div style={{ paddingTop: '20px', height: '80%', overflow: 'hidden', paddingBottom: '20px'}} >

            <br />
            <StyledDiv>
                <label style={{ fontSize: '28px', fontWeight: 'bold', paddingBottom: "10px" }}> Welcome To Your Calendar Page,{userEmail}! </label>
                <br/>
                <label style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: "10px" }}> Select Timezone </label>
               
            <br/>
                <select value={selectedTimezone} onChange={(event)=>setSelectedTimezone(event.target.value)}>
                <option value=""> {defaultTimeZone}</option>
                {timezones.map((timezone) => (

                    <option key={timezone} value={timezone}>
                        {timezone}
                    </option>
                ))}
                </select>
            </StyledDiv>
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
                        {currentView === 'month' && (
                            <span>
                              The event will be created for the entire day i.e., 24 hours.
                            </span>
                        )}
                        {(currentView === 'week' || currentView=== "day") && (
                            <span>
                                To create an event, drag the mouse over the preferred time range on the calendar.
                            </span>
                        )}
                    </StyledDiv>
                </strong>
            </div>
            
            <br />
            <div className="calendarContainerStyle">
            <Calendar
                selectable
                defaultView='month'
                events={events}
                localizer={localizer}
                startAccessor="start"
                endAccessor="end"
               formats={eventFormats}
               titleAccessor="title"
              
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleDelete}
                tooltipAccessor={tooltipAccessor}
                onNavigate={handleNavigate}   
                onView={newView => setCurrentView(newView)}

                  
                components={{
                    event: CustomEventContent,
                  
                  
                }}
                
                    popup={true}
                    style={calendarContainerStyle}
                step={15}
                />
            </div>
            <Logout />
            {currentTaskType && (
                <MyModal show={showModal} onClose={()=>setShowModal(false)} taskType={currentTaskType} />
            )}
          
            {deleteEvent && (
                <Modal show={showDeleteModal} onHide={onDelete} className="expand" >
                    <Modal.Header style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }} >
                       
                            <Modal.Title>Details of the Event</Modal.Title>
                        
                </Modal.Header>

                    <Modal.Body className="expand" >
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
                                        <li key={index} className="expand" >
                                           
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
                                <Button variant="secondary" onClick={onDelete}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal.Footer>

                </Modal>)}
           
           
            <CreateEventModal
                show={showCreateModal}
                
                onClose={handleClose}
                onPost={handlePost}
                onPrivatePost={handlePrivatePost}
                validationError={validationError}
                titleInput={titleInput}
                onTitleInputChange={setTitleInput}
                connections={connections}
                selectedModerators={selectedModerators}
                handleUserSelection={handleUserSelection}
                start={startDate}
                end={endDate}
                defaultTimeZone={defaultTimeZone}
                Timezone={selectedTimezone}

            />
            <EditEventModal
                initialTimezone={initialTimezone}
                handleTimezoneChange={handleTimezoneChange}
                show={showEditModal}
                userId={deleteUserEmail}
                creator={creator}
                selectedTimezone={deleteTimezone}
                defaultTimeZone={defaultTimeZone}
                timezones={timezones}
                onClose={onCloseDelete}
                onPost={handlePost}
                setCreator={setCreator}
                onPrivatePost={handlePrivatePost}
                validationError={validationError}
                titleInput={titleInput}
                onTitleInputChange={setTitleInput}
                setEnd={setEnd}
                setStart={setStart}
                start={startDate}
                end={endDate}
                connections={connections}
                setSelectedModerators={setSelectedModerators}
                selectedModerators={selectedModerators}
                handleUserSelection={handleUserSelection}
                priv={priv}
               
                />

            <SelectEmailModal
                
                show={showEmailModal}
                onClose={onCloseEdit}
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
           
           
        </div >
    );
}; export default CalendarApp;





