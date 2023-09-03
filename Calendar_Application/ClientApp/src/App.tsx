import * as React from 'react';
import Home from './components/Home';
import { Container } from 'reactstrap';
import { BrowserRouter as Router, Route, Routes, Navigate, BrowserRouter, RouteProps } from 'react-router-dom';
import Connections from './components/Connections';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk'; 
import { useNavigate } from 'react-router-dom';
import Login from './components/Login';
import CalendarApp from './components/Calendar'
import CalendarPage from './components/ViewCalendar';



interface ProtectedRouteProps {
    element: React.ReactNode;
}
/**
 * A custom protected route component.
 * It checks for the presence of an authentication token and navigates to the login page
 * if the token is not present, otherwise, it renders the provided element.
 * @param {object} element - The element to be rendered when the route is accessed.
 */

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
    const authToken = sessionStorage.getItem('authToken');

    if (!authToken) {
        
        return <Navigate to="/" />;
    }

   
    return <>{element}</>;
};

/**
 * The root component of your React application.
 * It sets up the routing for different pages and includes protected routes
 * that require authentication to access.
 */
function App() {

    return (
       
       <Router>
         
                <Container>
                <Routes>
                    <Route path="/" element={<Login/>} />
                    <Route path="/Home/:id" element={<ProtectedRoute element={<Home />} />} />
                    <Route path="/Home/Connections/:id" element={<ProtectedRoute element={<Connections />}/>} />
                    <Route path="/Home/Calendar/:id" element={<ProtectedRoute element={<CalendarApp/>}/>} />
                    <Route path="/Home/Connections/calendar/:id/:connectionId" element={<ProtectedRoute element={<CalendarPage />} />} />
                    </Routes>
                </Container>
          
        </Router>
       
        
 
       
        
           
        
    );
         
}
export default App;
