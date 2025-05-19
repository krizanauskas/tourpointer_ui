import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Plan from './pages/Plan'
import TripPlanDetails from './pages/TripPlanDetails.tsx'
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import './index.css';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import './styles/main.scss';

function App() {
  return (
    <Provider store={store}>
      <MantineProvider> 
      <Notifications />
        {
        <>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-plan"
            element={
              <PrivateRoute>
                <Plan />
              </PrivateRoute>
            }
          />
          <Route
            path="/plan/:id"
            element={
              <PrivateRoute>
                <TripPlanDetails />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
      }</MantineProvider>
    </Provider>
  )
}

export default App
