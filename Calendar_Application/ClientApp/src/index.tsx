
import 'bootstrap/dist/css/bootstrap.css';
import * as React from 'react';
import * as reactdomclient from 'react-dom/client'; // Import createRoot from react-dom
import App from './App';
import registerServiceWorker from './registerServiceWorker';


/**
 * The entry point of the React application.
 * It sets up the root element and uses React's createRoot to render the application.
 * The application is wrapped in a BrowserRouter to enable client-side routing.
 * Finally, it registers a service worker for caching assets.
 */

const rootElement = document.getElementById('root') as Element; // Use type assertion

// Use createRoot instead of ReactDOM.render
reactdomclient.createRoot(rootElement).render(

    <App />
);

registerServiceWorker();