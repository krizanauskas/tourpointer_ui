import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Plan from './pages/Plan'
import TripPlanDetails from './pages/TripPlanDetails.tsx'
import { Provider } from 'react-redux';
import { store } from './redux/store';
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
          <Route path="/" element={<Home />} />
          <Route path="/new-plan" element={<Plan />} />
          <Route path="/plan/:id" element={<TripPlanDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
      }</MantineProvider>
    </Provider>
  )
}

export default App
