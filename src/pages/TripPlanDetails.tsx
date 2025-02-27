import { useParams } from 'react-router-dom';
import {useState, useEffect, useRef} from 'react';
import axios from 'axios';
import config from "../config";
import { ActionIcon, Badge, Card, Group, Image, Text } from '@mantine/core';
import {AutocompleteItem} from "../components/autocomplete.tsx";
import { Box, Button } from '@mantine/core';
import classes from './badge-card.module.css';
import { Timeline } from '@mantine/core';
import { Container, Flex } from '@mantine/core';
import { LatLngExpression } from "leaflet";

import { useLayoutEffect } from 'react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { notifications } from '@mantine/notifications';

interface PointOfInterest {
    Id: string;
    placeId: string;
    name: string;
    types: string[];
    addedAt: string; // ISO 8601 date string
    location: {
        type: string;
        coordinates: [number, number]; // [longitude, latitude]
    };
    photos: any | null; // Assuming photos can be null, but can be expanded further if needed
    apiPhotos: string[]; // Array of photo URLs
}

interface RouteData {
    distance_km: number; // Distance in kilometers
    travel_time: number; // Travel time in milliseconds (in your example it seems to be in a large unit, consider converting)
    starting_point: string; // Starting point address
    ending_point: string; // Ending point address
    direction_id: string;
    points_of_interest: PointOfInterest[];
    from_direction: LatLngExpression
    to_direction: LatLngExpression
}

const status = 'status'
const attractions = 'attractions'

type Point = {
  lat: number;
  lng: number;
  name: string;
};

const TripPlanDetails = () => {
  const { id } = useParams();
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loadedPointsOfInterest, setLoadedPointsOfInterest] = useState<PointOfInterest[] |null>(null)
  const [activeTab, setActiveTab] = useState(status);
  const [page, setPage] = useState<number>(1)
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const routingControl = useRef<L.Routing.Control | null>(null);
  const [points, setPoints] = useState<Point[]>([]);

  useEffect(() => {
      console.log('useEffect triggered');
      const fetchRoute = async () => {
          try {
              const response = await axios.get(`${config.api.baseUrl}/routes/trips/${id}`);

              setRouteData(response.data.data)
          } catch (err) {
              console.error('Error fetching route:', err);
          }
      };

      fetchRoute();

  }, []);

    useLayoutEffect(() => {
      console.log(mapRef.current);
      if (!mapInstance.current && mapRef.current) {
        mapInstance.current = L.map(mapRef.current).setView([54.7244379, 25.2876549], 13);

        const fromDirection = L.latLng(54.7244379, 25.2876549);
        const toDirection = L.latLng(54.7244379, 25.2876549);

        const bounds = L.latLngBounds(fromDirection, toDirection);

        mapInstance.current.fitBounds(bounds);
      }
    }, []);

    const fetchAttractions = async () => {
        if (!routeData) {
            return; // Exit early if routeData is not available
        }

        try {
            // Replace :id in the API endpoint correctly
            const attractionsURL = config.api.endpoints.attractions.replace(":id", routeData.direction_id);

            // Fetch data from API
            const response = await axios.get(`${config.api.baseUrl}${attractionsURL}?page=${page}`);

            // Assuming the response contains an array of attractions
            const newAttractions: PointOfInterest[] = response.data.data || [];

            // Append new attractions to existing state
            setLoadedPointsOfInterest(
              (prevAttractions) => [...(prevAttractions || []), ...newAttractions]
            );

            // Increase the page count
            setPage((prevPage) => prevPage + 1);

        } catch (err: unknown) {
            if (axios.isCancel(err)) {
                console.log("Request canceled:", (err as Error).message);
            } else if (err instanceof Error) {
                console.error("Error fetching data:", err.message);

              notifications.show({
                position: 'bottom-right',
                title: "request failed",
                message: `${err.message}`,
                color: 'red',
                loading: false,
                autoClose: 4000
              })
            } else {
                console.error("Unknown error occurred:", err);
            }
        }
    };

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);

    if (tabName === attractions && loadedPointsOfInterest === null) {
      fetchAttractions();
    }
  };

  const addAttractionToRouteData = (newPointOfInterest: PointOfInterest) => {
    setRouteData(prevState => {
      if (!prevState) return null;

      return {
        ...prevState,
        points_of_interest: [
          ...(prevState.points_of_interest || []), newPointOfInterest
        ]
      };
    });
  };

  const removeAttractionFromRouteData  = (pointOfInterest: PointOfInterest) => {
    setRouteData(prevState => {
      if (!prevState) return null;

      return {
        ...prevState,
        points_of_interest: prevState.points_of_interest.filter(
          poi => poi.Id !== pointOfInterest.Id
        ),
      };
    });
  };

  const savePlan = async () => {
    const attractionIds = routeData?.points_of_interest.map((poi) => poi.Id) || [];

    try {
      const url = `${config.api.baseUrl}/routes/trips/${id}`;

      const response = await axios.patch(url, {
        attractions: attractionIds, // Array of PointOfInterest Ids
      });

      console.log("Plan saved successfully:", response.data);
    } catch (error) {
      console.error("Error saving plan:", error);
    }
  };

  return (
      <div id="details">
          <Box style={{ display: 'flex', width: '100%' }}>
            <Button
              style={{
                flex: 1,
                borderRadius: 0,
                backgroundColor: activeTab === 'status' ? 'black' : '#1695FD',
                color: 'white',
              }}
              onClick={() => handleTabChange('status')}
            >
              Trip Status
            </Button>
            <Button
              style={{
                flex: 1,
                borderRadius: 0,
                backgroundColor: activeTab === 'attractions' ? 'black' : '#1695FD',
                color: 'white',
              }}
              onClick={() => handleTabChange('attractions')}
            >
              Attractions
            </Button>
          </Box>
          {activeTab === status && <Flex style={{ flex: 1}} direction="column">
          {routeData ? (
            <Container flex={1} style={{paddingBottom: '20px'}}>
              <MapContainer bounds={new LatLngBounds(routeData.from_direction, routeData.to_direction)} style={{ width: '100%', height: '500px' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={routeData.from_direction}>
                  <Popup>Start Location</Popup>
                </Marker>
                <Marker position={routeData.to_direction}>
                  <Popup>End Location</Popup>
                </Marker>

                {routeData.points_of_interest && routeData.points_of_interest.map((poi) => (
                  <Marker key={poi.Id} position={poi.location.coordinates}>
                    <Popup>{poi.name}</Popup>
                  </Marker>
                ))}
              </MapContainer>;


              <h1>Route Information</h1>
              <p>Starting Point: {routeData.starting_point}</p>
              <p>Ending Point: {routeData.ending_point}</p>
              <p>Distance: {routeData.distance_km} km</p>
              <p>Travel Time: {routeData.travel_time} ms</p>

              <h2>Points of Interest:</h2>
              <Timeline color="indigo" radius="lg" active={0} lineWidth={3} bulletSize={23}>

                {routeData.points_of_interest && routeData.points_of_interest.map((poi) => (
                  <Timeline.Item key={poi.Id} title={poi.name}>
                    <Text c="dimmed" size="sm">Types: {poi.types.join(', ')}</Text>
                    <Text size="xs" mt={4}>Coordinates: {poi.location.coordinates.join(', ')}</Text>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Container>
          ) : (
            <p>Loading route data...</p>
          )}

              <Box style={{display: 'flex', width: '100%', flexDirection: 'column'}}>
                  <Button
                  style={{
                    borderRadius: 0,
                    backgroundColor: '#1695FD',
                    color: 'white',
                  }}
                  onClick={() => savePlan()}
              >
                  Save plan
              </Button>
              <Button
                  style={{
                    borderRadius: 0,
                    backgroundColor: 'black',
                    color: 'white',
                  }}
              >
                  Cancel
              </Button>
          </Box>
      </Flex> }
      {activeTab === attractions &&
      <div class="details__attractions">
          <div className="details__attractions-inner">
            <h1>attractions</h1>

            {loadedPointsOfInterest ? (
              <div class="details__attractions-body">
                {loadedPointsOfInterest.map((pointOfInterest: PointOfInterest) => {
                  const isAdded = routeData?.points_of_interest?.some(poi => poi.Id === pointOfInterest.Id); // Declare before JSX return

                  // Return the JSX with valid side effects
                  return (
                    <Card key={pointOfInterest.Id} withBorder radius="md" p="md" className={classes.card}>
                      <Card.Section>
                        <Image src="https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&q=80" height={180} />
                      </Card.Section>

                      <Card.Section className={classes.section} mt="md">
                        <Group justify="apart">
                          <Text fz="lg" fw={500}>
                            {pointOfInterest.name}
                          </Text>
                          <Badge size="sm" variant="light">
                            Lietuva
                          </Badge>
                        </Group>
                        <Text fz="sm" mt="xs">
                        </Text>
                      </Card.Section>

                      <Card.Section className={classes.section}>
                        <Text mt="md" className={classes.label} c="dimmed">
                          Perfect for you, if you enjoy
                        </Text>
                      </Card.Section>

                      <Group mt="xs">
                        <Button radius="md" style={{ flex: 1 }} onClick={() => {
                          if (isAdded) {
                            removeAttractionFromRouteData(pointOfInterest);
                          } else {
                            addAttractionToRouteData(pointOfInterest);
                          }}}>
                          {isAdded ? "− Remove from plan" : "+ Add to plan"}
                        </Button>
                      </Group>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p>Loading attractions data...</p>
            )}
          </div>

          <Group mt="xs">
              <Button radius={0} style={{flex: 1}} onClick={() => fetchAttractions()}> Load more </Button>
          </Group>
      </div>}

      </div>
  );
};

export default TripPlanDetails