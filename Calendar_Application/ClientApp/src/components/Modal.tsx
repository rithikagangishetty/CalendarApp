import moment from 'moment';
import React, { useEffect, useState} from 'react';
import { Form, FormGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import  browserHistory  from 'react-router'


type TaskType = 'login' | 'monthpast' | 'signup' | "noemail" | 'noevent' | 'connectionadded' |"exists"| 'eventclash' | 'valid' | 'eventedited' | 'noedit' | 'connectiondeleted' | 'eventadded' | 'eventdeleted' | 'overlap' | 'noconnections' | 'past' | 'connectionexist' | 'sameemail' | 'editpast' | "newaccount";
interface MyModalProps {
    show: boolean;
    onClose: () => void;
    taskType: TaskType; 
}
interface SelectEmailModalProps {
    show: boolean;
    onClose: () => void;
    onSaveSelectedConnections: () => void;
    validationError: string;
    connections: string[];
   renderEmailCheckbox: (connection: string,index:number) => JSX.Element;
    
}
interface EventModalProps {
    show: boolean;
    onHide: () => void;
    
    connections: any;
    moderators: any;

}
interface DeleteConfirmProps {
    show: boolean;
    onClose: () => void;
    onDelete: (event: any) => void;
    

}



interface CreateEventModalProps {
    show: boolean;
    
    onClose: () => void;
    onPost: (event: any) => void;
    onPrivatePost: (event: any) => void;
    validationError: string;
    titleInput: string;
    onTitleInputChange: (value: string) => void;
    connections: string[];
    selectedModerators: string[];
    start: Date;
    end: Date;
    Timezone: any;
    defaultTimeZone: any;
    handleUserSelection: (user: string, connect: boolean) => void;
}

interface EditEventModalProps {
    show: boolean;
    creator: boolean;
    setSelectedModerators: (moderators: string[]) => void;
    onClose: () => void;
    onPost: (event: any) => void;
    onPrivatePost: (event: any) => void;
    validationError: string;
    start: Date;
    userId: any;
    setCreator: (value: any) => void;
    end: Date;
    setStart: (value: any) => void;
    setEnd: (value: any) => void;
    titleInput: string;
    onTitleInputChange: (value: string) => void;
    connections: string[];
    selectedModerators: string[];
    handleUserSelection: (user: string, connect: boolean) => void;
    handleTimezoneChange: (event: any) => void;
    selectedTimezone: any;
    initialTimezone: any;
    defaultTimeZone: any;
    timezones: any;
    priv: any;
   
   
   
   
}

/**
 * MyModal component displays a modal dialog with a message based on the task type.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.show - Whether the modal should be displayed.
 * @param {function} props.onClose - Callback function when the modal is closed.
 * @param {string} props.taskType - Task type that determines the message to be displayed.
 */
 

const MyModal: React.FC<MyModalProps> = ({ show, onClose, taskType }) => {
    let message = '';
    if (taskType === 'login') {
        message = 'Account Exists,You are successfully logged in!';
    }
    else if (taskType === 'valid') {
        message = 'Please enter a valid Email.';
    }
    else if (taskType === 'noevent') {
        message = "The event can not be created because the all the Moderators and Connections are not available at the scheduled time.";
    }
    else if (taskType === 'eventclash') {
        message = 'The event cannot be edited to the selected time as it clashes with other events.';
    }
    else if (taskType === 'editpast') {
        message = 'Editing the past events is not allowed!';
    }
    else if (taskType === 'noemail') {
        message = 'Entered email does not exist!';
    }
    
    else if (taskType === 'noedit') {
        message = 'You can not Delete/Edit this event.';
    }
    else if (taskType === 'exists') {
        message = 'An account already exists with this Email!';
    }
    else if (taskType === 'monthpast') {
        message = "Event creation is not permitted in the month view after 00:00 as it spans the whole day. To create an event on the same day, kindly switch to the week/day view.";
    }
    else if (taskType === 'newaccount') {
        message = "Account does not exist, Please Sign Up!";
    }
    else if (taskType === 'eventedited') {
        message = 'Event Edited Successfully.';
    }
    else if (taskType === 'sameemail') {
        message = 'Cannot add your Email as a connection!';
    }
    else if (taskType === 'connectionexist') {
        message = 'Connection Already Exists!';
    }
    else if (taskType === 'signup') {
        message = 'New Account Created!';
    }
    else if (taskType === 'connectionadded') {
        message = 'New Connection Added!';
    }
    else if (taskType === 'connectiondeleted') {
        message = 'Connection Deleted Successfully!';
    }
    else if (taskType === 'eventadded') {
        message = 'New Event Created!';
    }
    else if (taskType === 'eventdeleted') {
        message = 'Event Deleted Successfully!';
    }
    else if (taskType == 'noconnections') {
        message = 'No Connections Found! Please add a connection.';
    }
    else if (taskType == 'overlap') {
        message = 'Event creation is not allowed due to overlap.';
    }
    else if (taskType == 'past') {
        message = 'Event creation is not allowed for past days and time.';
    }
  

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }} >
                <Modal.Title>Message</Modal.Title>
            </Modal.Header>
            <Modal.Body style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <p><strong>{message}</strong></p>
            </Modal.Body>
            <Modal.Footer>
                
                <Button variant="secondary" onClick={onClose}>
                    Ok
                </Button>
            </Modal.Footer>
        </Modal>
    );
}; export default MyModal;



/**
 * Logout component to handle user logout.
 */

export function Logout() {
    const navigate = useNavigate();

    /**
     * Function to handle user logout:
     * - Clears the authentication token or relevant data from session storage.
     * - Redirects the user to the login page.
     */
    const handleLogout = () => {
        
        sessionStorage.removeItem('authToken');
        navigate('/', { replace: true });
    };


    return (
        <div>
            <button className="logout-button" onClick={handleLogout}>
                Logout
            </button>
        </div>
    );
}




/**
 * Edit Event Modal component for editing existing events.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.show - Whether the modal should be displayed.
 * @param {function} props.onClose - Callback function when the modal is closed.
 * @param {string} props.creator - Creator of the event.
 * @param {string} props.initialTimezone - Initial selected timezone for the event.
 * @param {function} props.onPost - Callback function when updating a public event.
 * @param {function} props.onPrivatePost - Callback function when updating a private event.
 * @param {string} props.validationError - Validation error message (if any).
 * @param {string} props.titleInput - Input value for the event title.
 * @param {Date} props.start - Start date and time of the event.
 * @param {string} props.userId - User ID.
 * @param {Date} props.end - End date and time of the event.
 * @param {function} props.setStart - Callback function to set the start date and time.
 * @param {function} props.setCreator - Callback function to set the creator.
 * @param {function} props.setEnd - Callback function to set the end date and time.
 * @param {function} props.onTitleInputChange - Callback function when the event title input changes.
 * @param {string[]} props.connections - List of available connections (moderators).
 * @param {string[]} props.selectedModerators - List of selected moderators for the event.
 * @param {function} props.handleUserSelection - Callback function when a user (moderator) is selected or deselected.
 * @param {function} props.handleTimezoneChange - Callback function when the selected timezone changes.
 * @param {string} props.selectedTimezone - Selected timezone for the event.
 * @param {string} props.defaultTimeZone - Default time zone.
 * @param {string[]} props.timezones - List of available timezones.
 * @param {boolean} props.priv - Whether the event is private.
 */



export const EditEventModal: React.FC<EditEventModalProps> = ({
    show,
    onClose,
    creator,
    initialTimezone,
    onPost,
    onPrivatePost,
    validationError,
    titleInput,
    start,
    userId,
    end,
    setStart,
    setCreator,
    setEnd,
    onTitleInputChange,
    connections,
    selectedModerators,
    handleUserSelection,
    handleTimezoneChange,
    selectedTimezone,
    defaultTimeZone,
    timezones,
    priv,
  
    

}) => {

    const [startDateValidity, setStartDateValidity] = useState(true);
    const [endDateValidity, setEndDateValidity] = useState(true);
    
   
    if (selectedTimezone == "") {
        selectedTimezone = defaultTimeZone;
    }
   
    moment.tz.setDefault(selectedTimezone);
    const currentTime = moment();
    const defaultOffset: number = moment.tz(currentTime, defaultTimeZone).utcOffset();
    const selectedOffset: number = moment.tz(currentTime, selectedTimezone).utcOffset();
    const [prevSelectedTimezone, setPrevSelectedTimezone] = useState(selectedTimezone);
    const timeOffset: number = defaultOffset - selectedOffset;
   
    useEffect(() => {

        if (show) {
            
            const prevTimezoneOffset = moment.tz(start, prevSelectedTimezone).utcOffset();
            const selectedOffset: number = moment.tz(currentTime, selectedTimezone).utcOffset();
            const timeOffset:number = prevTimezoneOffset - selectedOffset; 
            

            if (start && end) {
                const startDate = new Date(start);
                const endDate = new Date(end);
                startDate.setMinutes(start.getMinutes() - timeOffset);
                endDate.setMinutes(end.getMinutes() - timeOffset);
                setStart(startDate);
                setEnd(endDate);
            }

            setPrevSelectedTimezone(selectedTimezone);
        }
    }, [show, selectedTimezone]);


   



    var now = new Date();
  
    const setEndDate = (date: Date) => {
       
        setEndDateValidity(date !== null&&date > start);
        setStartDateValidity(start < date);
        setEnd(date);
    };
    const setStartDate = (date: Date) => {
        setEndDateValidity(end > date);
        setStartDateValidity(date !== null && date < end);
        setStart(date);
    };
    function Post(event: any) 
    {
      
        start.setMinutes(start.getMinutes() + timeOffset);
        end.setMinutes(end.getMinutes() + timeOffset);
        setCreator(creator);
        onTitleInputChange(titleInput);
        setStart(start);
        setEnd(end);
        onPost(event);
        setPrevSelectedTimezone(defaultTimeZone);
       
    }
   
   
    function PrivatePost(event: any) {
        setCreator(creator);
        start.setMinutes(start.getMinutes() + timeOffset);
        end.setMinutes(end.getMinutes() + timeOffset);
        onTitleInputChange(titleInput);
        setStart(start);
        setEnd(end);
        onPrivatePost(event);
        setPrevSelectedTimezone(defaultTimeZone);
        
    }
           
    function areDatesOnSameDay(date1: Date, date2: Date): boolean {
        const year1 = date1.getFullYear();
        const month1 = date1.getMonth();
        const day1 = date1.getDate();

        const year2 = date2.getFullYear();
        const month2 = date2.getMonth();
        const day2 = date2.getDate();

        return year1 === year2 && month1 === month2 && day1 === day2;
    }
   
  
    function OnCloseFunc() {
        onTitleInputChange("");
        setPrevSelectedTimezone(defaultTimeZone);
        onClose();      
    }
   
    var  minTime = new Date(
            currentTime.year(),
            currentTime.month(),
            currentTime.date(),
            currentTime.hour(),
            currentTime.minute()
    );
    var  endMinTime = new Date(
        currentTime.year(),
        currentTime.month(),
        currentTime.date(),
        currentTime.hour(),
        currentTime.minute()
        );
    
    if (start != null) {
        
        if (!areDatesOnSameDay(start, now)) {
            minTime = new Date();
            minTime.setHours(0, 0, 0, 0);
            
        }
    }
    if (end != null) {
        if (!areDatesOnSameDay(end, now)) {
        
                endMinTime = new Date();
                endMinTime.setHours(0, 0, 0, 0);
           
         
        }
    }
   
    const minDate = currentTime.toDate();

   // const [expandedModerator, setExpandedModerator] = useState<string | null>(null);

    const [expandedModerator, setExpandedModerator] = useState<number | null>(null);

    const toggleExpand = (index: number) => {
        if (expandedModerator === index) {
            setExpandedModerator(null);
        } else {
            setExpandedModerator(index);
        }
    };
    const endOfDay = moment(currentTime).endOf('day').toDate();
    const maxTime = new Date(
        endOfDay.getFullYear(),
        endOfDay.getMonth(),
        endOfDay.getDate(),
        23,
        59
    );
    
    const handleCreatorChange = () => {
        setCreator(!creator);
    };
    const timeInterval = 15;
    return (
        <Modal show={show} onHide={OnCloseFunc} className="expand" >
            <Modal.Header style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}>
                <Modal.Title>Edit Event</Modal.Title>
            </Modal.Header>
            <Modal.Body className="expand">

                <Form.Group controlId="eventTitle" className="form-inline">
                    <Form.Label className="form-label" ><strong>Title : </strong></Form.Label>
                    <Form.Control
                        type="text"
                        value={titleInput}
                        onChange={(e) => onTitleInputChange(e.target.value)}
                        isInvalid={validationError !== ''}
                        style={{ width: '70%', textAlign:"left" }}
                    />
                    <Form.Control.Feedback type="invalid">{validationError}</Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="form-inline">
                    
                    <Form.Label className="form-label"  ><strong>Select Timezone :</strong></Form.Label>
                        <select value={selectedTimezone} onChange={handleTimezoneChange}>
                            <option value="">{defaultTimeZone}</option>
                            {timezones.map((timezone: any) => (
                                <option key={timezone} value={timezone}>
                                    {timezone}
                                </option>
                            ))}
                        </select>
                   
                </Form.Group>
               
                
                <Form.Group controlId="eventStart" className="form-inline">
                    <div className="datetime-group">
                        <div className="datetime-label">
                            <Form.Label><strong>Start Date and Time :</strong></Form.Label>
                        </div>
                        <div className="datetime-picker">
                            <DatePicker
                                showTimeSelect
                                timeFormat="HH:mm"
                                minTime={minTime}
                                selected={start || null}
                                onChange={setStartDate}
                                dateFormat="MM/dd/yyyy h:mm aa"
                                placeholderText="Select Start Date and Time"
                                timeIntervals={timeInterval}
                                timeInputLabel="Time:"
                                maxTime={maxTime}
                                minDate={minDate}
                            />
                        </div>
                    </div>
                </Form.Group>
                {(!startDateValidity || !endDateValidity) && (    <FormGroup>
                   
                    <div style={{ color: 'red' }}>Start Date/Time should be earlier than End Date/Time</div>
                    
                </FormGroup>  )}
              
                <Form.Group controlId="eventEnd" className="form-inline">
                    <div className="datetime-group">
                        <div className="datetime-label">
                            <Form.Label><strong>End Date and Time :</strong></Form.Label>
                        </div>
                        <div className="datetime-picker">
                            <DatePicker
                                timeFormat="HH:mm"
                                selected={end || null}
                                onChange={setEndDate}
                                minTime={endMinTime}
                                timeInputLabel="Time:"
                                dateFormat="MM/dd/yyyy h:mm aa"
                                showTimeSelect
                                timeIntervals={timeInterval}
                                placeholderText="Select End Date and Time"
                                maxTime={maxTime}
                                minDate={minDate}
                            />
                        </div>
                    </div>
                </Form.Group>
                <Form.Group controlId="eventCreator" className="form-inline">
                    <Form.Label className="form-label">
                        <strong>Creator of the Event : </strong>
                    </Form.Label>

                    <Form.Check
                        type="checkbox"
                        label={userId}
                        checked={creator}
                        onChange={handleCreatorChange}
                        disabled={selectedModerators.includes(userId)}
                    />

                </Form.Group>
               
                <Form.Group controlId="eventEmails" className="expand">
                    <Form.Label className="expand"><strong>Select the Moderators</strong></Form.Label>
                    <div >
                        {connections.length > 0 &&
                            connections.map((moderator,index) => (
                                <Form.Check
                                    key={moderator}
                                    type="checkbox"
                                    className="expand"
                                    label={
                                       
                                        <span
                                            className={`truncated ${expandedModerator === index ? 'expanded' : ''}`}
                                            onClick={() => toggleExpand(index)}
                                           
                                        >
                                            {moderator}
                                        </span>


                                    }
                                    value={selectedModerators}
                                    checked={selectedModerators.includes(moderator)}
                                    onChange={() => handleUserSelection(moderator, false)}
                                    disabled={creator && moderator === userId}
                                />
                            ))}
                    </div>
                </Form.Group>
                
                
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" onClick={Post} disabled={!startDateValidity || !endDateValidity || start === null || end === null} >
                    {priv ? "Update to Public Event" : "Update Public Event"}
                </Button>
                <Button variant="success" onClick={PrivatePost} disabled={!startDateValidity || !endDateValidity || start === null || end === null} >
                    {priv ? "Update Private Event" : "Update to Private Event"}
                </Button>
                <Button variant="secondary" onClick={OnCloseFunc} >
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};








/**
 * Create Event Modal component for creating new events.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.show - Whether the modal should be displayed.
 * @param {function} props.onClose - Callback function when the modal is closed.
 * @param {function} props.onPost - Callback function when creating a public event.
 * @param {function} props.onPrivatePost - Callback function when creating a private event.
 * @param {string} props.validationError - Validation error message (if any).
 * @param {string} props.titleInput - Input value for the event title.
 * @param {function} props.onTitleInputChange - Callback function when the event title input changes.
 * @param {string[]} props.connections - List of available connections (moderators).
 * @param {string[]} props.selectedModerators - List of selected moderators for the event.
 * @param {function} props.handleUserSelection - Callback function when a user (moderator) is selected or deselected.
 * @param {string} props.start - Start date and time of the event.
 * @param {string} props.end - End date and time of the event.
 * @param {string} props.defaultTimeZone - Default time zone.
 * @param {string} props.Timezone - Selected time zone for the event.
 */



export const CreateEventModal: React.FC<CreateEventModalProps> = ({
    show,
    onClose,
    onPost,
    onPrivatePost,
    validationError,
    titleInput,
    onTitleInputChange,
    connections,
    selectedModerators,
    handleUserSelection,
    start,
    end,
    defaultTimeZone,
    Timezone,
    
}) => {
    if (Timezone == "") {
        Timezone = defaultTimeZone;
    }
    
    const [expandedModerator, setExpandedModerator] = useState<number | null>(null);

    /**
     * Function to toggle the expansion of email entries.
     * @param {number} index - The index of the email entry.
     */
    const toggleExpand = (index: number) => {
        if (expandedModerator === index) {
            setExpandedModerator(null);
        } else {
            setExpandedModerator(index);
        }
    };

    return (
        <Modal show={show} onHide={onClose} className="expand">
            <Modal.Header style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }} >
                <Modal.Title>Create Event</Modal.Title>
            </Modal.Header>
            <Modal.Body className="expand">
                <Form.Group controlId="eventTitle" className="form-inline">
                    <Form.Label className="form-label" ><strong>Title : </strong></Form.Label>
                    <Form.Control
                        type="text"
                        value={titleInput}
                        onChange={(e) => onTitleInputChange(e.target.value)}
                        isInvalid={validationError !== ''}
                        style={{ width: '70%', textAlign:"left" }}
                    />
                    <Form.Control.Feedback type="invalid">{validationError}</Form.Control.Feedback>
                </Form.Group>
              
                <p><strong>TimeZone:</strong> {Timezone}</p>
                    <p><strong>Start:</strong> {new Date(start).toLocaleString('en-US', {
                        timeZone: Timezone,
                        dateStyle: 'medium',
                        timeStyle: 'medium'
                    })}</p>
               
                    <p><strong>End:</strong> {new Date(end).toLocaleString('en-US', {
                       timeZone: Timezone,
                        dateStyle: 'medium',
                        timeStyle: 'medium'
                    })}</p>
              
               
                <Form.Group controlId="eventEmails" className="expand">
                    <Form.Label className="expand"><strong>Select the Moderators</strong></Form.Label>
                    <div >
                        {connections.length > 0 &&
                            connections.map((moderator,index) => (
                                <Form.Check 
                                    className="expand"
                                    key={moderator}
                                    type="checkbox"
                                
                                    label={
                                       
                                        <span
                                            className={`truncated ${expandedModerator === index ? 'expanded' : ''}`}
                                            onClick={() => toggleExpand(index)}

                                        >
                                            {moderator}
                                        </span>
                                    }
                                    checked={selectedModerators.includes(moderator)}
                                    onChange={() => handleUserSelection(moderator,false)}
                                />
                            ))}
                    </div>
                </Form.Group>
                
            </Modal.Body>
            <Modal.Footer style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button variant="success" onClick={onPost}>
                    Create Public Event
                </Button>
                <Button variant="success" onClick={onPrivatePost}>
                    Create Private Event
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </Modal.Footer>
            
        </Modal>
    );
};

/**
 * Select Email Modal component to display a list of connections to select from.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.show - Whether the modal should be displayed.
 * @param {function} props.onClose - Callback function when the modal is closed.
 * @param {function} props.onSaveSelectedConnections - Callback function when the selected connections are saved.
 * @param {string} props.validationError - Validation error message (if any).
 * @param {string[]} props.connections - List of available connections to select from.
 * @param {function} props.renderEmailCheckbox - Function to render email checkboxes based on connections.
 */

export const SelectEmailModal: React.FC<SelectEmailModalProps> = ({
    show,
    onClose,
    onSaveSelectedConnections,
    validationError,
    connections,
    
    renderEmailCheckbox,
   
    
}) => {
   
    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }} >
                <Modal.Title>
                    <div style={{ textAlign: 'center' }}>Select Connections</div>
                    <div style={{ fontSize: '14px', fontWeight: 'normal', textDecoration: 'underline', textAlign:'center' }}>
                        The connections selected here are not added as moderators
                    </div>
                </Modal.Title>

            </Modal.Header>
            <Modal.Body>
                <Form>
                    {connections.length > 0 && connections.map((connection,index) => renderEmailCheckbox(connection,index))}
                </Form>
                {validationError && <div className="text-danger">{validationError}</div>}
            </Modal.Body>
            <Modal.Footer style={{ display: 'flex', justifyContent: 'center' }}>
               
                <Button variant="success" onClick={onSaveSelectedConnections}>
                    Save
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

/**
 * Event modal component to display errors related to event creation/editing.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.show - Whether the modal should be displayed.
 * @param {function} props.onHide - Callback function when the modal is closed.
 * @param {string[]} props.moderators - List of moderators who are unavailable.
 * @param {string[]} props.connections - List of connections who are unavailable.
 */

export const EventModal: React.FC<EventModalProps> = ({ show, onHide, moderators, connections }) => {
    const [expandedEmail, setExpandedEmail] = useState<number | null>(null);
    /**
     * Function to toggle the expansion of email entries.
     * @param {number} index - The index of the email entry.
     */

    const toggleExpand = (index: number) => {
        if (expandedEmail === index) {
            setExpandedEmail(null);
        } else {
            setExpandedEmail(index);
        }
    };
    return (
        <div>
            <Modal show={show} onHide={onHide}>
                <Modal.Header >
                    <Modal.Title>Event Creation Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <strong> Cannot create/edit event. Some moderators/connections shown below are unavailable at the scheduled time. Try a private event, excluding them.</strong></p>


                    {moderators && moderators.length > 0 && (
                        <>
                            <p><strong>Moderators:</strong></p>
                            <ul>
                                {moderators.map((moderator: any, index: any) => (
                                    <li key={index}>
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
                    {connections && connections.length > 0 && (
                        <>
                            <p><strong>Connections:</strong></p>
                            <ul>
                                {connections.map((connection: any, index: any) => (
                                    <li key={index}><span
                                        className={`truncated ${expandedEmail === index ? 'expanded' : ''}`}
                                        onClick={() => toggleExpand(index)}

                                    >
                                        {connection}
                                    </span></li>
                                ))}
                            </ul>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>

    );
}


/**
 * Delete confirmation modal component.
 *
 * @param {object} props - Component properties.
 * @param {boolean} props.show - Whether the modal should be displayed.
 * @param {function} props.onClose - Callback function when the modal is closed.
 * @param {function} props.onDelete - Callback function when the delete action is confirmed.
 */

export const DeleteConfirmModal: React.FC<DeleteConfirmProps> = ({ show, onClose,onDelete}) => {

    return (
        <Modal show={show} onHide={onClose}>
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
               
                <Button variant="danger" onClick={onDelete}>
                    Yes
                </Button>
                <Button variant="secondary" onClick={onClose}>
                    No
                </Button>
            </Modal.Footer>
        </Modal>
    );
       
};




