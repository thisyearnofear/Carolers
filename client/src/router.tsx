// CLEAN: Centralized routing configuration
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import Room from './pages/Room';
import EventRecap from './pages/EventRecap';
import NotFound from './pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'events/:eventId',
        element: <Room />,
      },
      {
        path: 'events/:eventId/recap',
        element: <EventRecap />,
      },
      {
        path: 'room/:eventId', // Legacy support
        element: <Navigate to="/events/$1" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);