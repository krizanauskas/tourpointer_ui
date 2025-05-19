import { Container, Text, Space, Autocomplete, Button, Chip, Group } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { setSelectedPlace, setTripDates, setActivities } from '../redux/slices/tripFormSlice';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import axios from '../api/axiosSetup';
import config from '../config';
import { notifications } from '@mantine/notifications';

import { setAttractions } from '../redux/slices/tripPlanResult';

export default function TripPlanForm() {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedPlace, tripDates, activities } = useSelector((state: RootState) => state.planForm);

  const tripDatesForPicker = [
    tripDates[0] ? new Date(tripDates[0]) : null,
    tripDates[1] ? new Date(tripDates[1]) : null,
  ] as [Date | null, Date | null];

  const [loading, setLoading] = useState(false);

  const handlePlanClick = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${config.api.baseUrl}${config.api.endpoints.planTrip}`,
      {
        place: selectedPlace,
        date_from: tripDates[0],
        date_to: tripDates[1],
        activities,
      });

      const data = response.data;
      
      dispatch(setAttractions(data.data.attractions));
      navigate('/plan/results');
    } catch (error: any) {
      if (error instanceof AxiosError) {
        const errorFields = error.response?.data.fields

        for (let field in errorFields) {
          if (errorFields.hasOwnProperty(field)) {
            let errorMessage = errorFields[field];


            notifications.show({
              position: 'bottom-right',
              title: error.response?.data.status_text,
              message: `${field}: ${errorMessage}`,
              color: 'red',
              loading: false,
              autoClose: 4000
            })
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Space h="xl" />
      <Text>Choose where you are going</Text>
      <Space h="sm" />

      <Autocomplete
        placeholder="A place to go"
        data={['Vilnius', 'Kaunas', 'Klaipėda']}
        value={selectedPlace}
        onChange={(value) => dispatch(setSelectedPlace(value))}
      />

      <Space h="xl" />
      <Text>Please choose your trip date</Text>
      <Space h="sm" />

      <DatePicker
        type="range"
        value={tripDatesForPicker}
        onChange={(value) => {
          const dates = [
            value[0] ? value[0].toISOString().slice(0, 10) : null,
            value[1] ? value[1].toISOString().slice(0, 10) : null,
          ];

          dispatch(setTripDates(dates as [string | null, string | null]));
        }}
      />

      <Space h="xl" />
      <Text>Please choose activities you like</Text>
      <Space h="sm" />

      <Chip.Group multiple onChange={(values) => dispatch(setActivities(values))}>
        <Group>
          <Chip color="green" variant="outline" value="Sightseeing">Sightseeing</Chip>
          <Chip color="green" variant="outline" value="Shopping">Shopping</Chip>
          <Chip color="green" variant="outline" value="Museum & Art Galleries">Museum & Art Galleries</Chip>
          <Chip color="green" variant="outline" value="Local Market Visits">Local Market Visits</Chip>
        </Group>
      </Chip.Group>

      <Space h="xl" />
      <Button variant="filled" size="md" onClick={handlePlanClick} loading={loading}>
        {loading ? 'Loading...' : 'Plan'}
      </Button>
    </Container>
  );
}
