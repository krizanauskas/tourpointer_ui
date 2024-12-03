import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Plan from './pages/Plan'
import TripPlanResult from './pages/TripPlanResult'
import { Provider } from 'react-redux';
import { store } from './redux/store';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

function App() {
  return (
    <Provider store={store}>
      <MantineProvider> 
      <Notifications />
        {
        <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/plan/results" element={<TripPlanResult />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
      }</MantineProvider>
    </Provider>
  )
}

export default App
