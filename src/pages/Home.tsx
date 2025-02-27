import { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine'; // Import the routing machine
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import config from "../config.ts";

type Point = {
    lat: number;
    lng: number;
    name: string;
};

type Coordinate = {
    lat: number;
    lng: number;
};

export default function Home() {
    const [points, setPoints] = useState<Point[]>([]); // State to store points
    const [loading, setLoading] = useState(true); // State to handle loading status
    const [error, setError] = useState(''); // State to handle errors
    const [route, setRoute] = useState<Coordinate[]>([]); // Route coordinates
    const mapRef = useRef<HTMLDivElement | null>(null); // Reference for the map container
    const mapInstance = useRef<L.Map | null>(null); // Store the map instance to avoid re-initialization
    const routingControl = useRef<L.Routing.Control | null>(null); // Store the routing control instance

    // Fetch points from the API
    useEffect(() => {
        const fetchPoints = async () => {
            try {
                const response = await axios.get(`${config.api.baseUrl}${config.api.endpoints.points}`);
                setPoints(response.data.data); // Assuming data is an array of points
                setLoading(false);
            } catch (err) {
                setError('Failed to load points: ' + (err instanceof AxiosError ? err.message : err));
                setLoading(false);
            }
        };

        const fetchRoute = async () => {
            try {
                const from = 'ChIJFfwGvzWR3UYRQchcSTAQWhI';
                const to = 'ChIJofRUayva5EYRCCz_gHAOKpk';

                const response = await axios.get(`${config.api.baseUrl}/routes/directions?from=${from}&to=${to}`);
                setRoute(response.data.data.coordinates); // Ensure coordinates are in [{ lat, lng }]
                setLoading(false);
            } catch (err) {
                setError('Failed to load route: ' + (err instanceof AxiosError ? err.message : err));
                setLoading(false);
            }
        };

        // fetchRoute();
        // fetchPoints();
    }, []);

    useEffect(() => {
        // Check if the map is already initialized
        if (!mapInstance.current && mapRef.current) {
            // Initialize Leaflet map only once
            mapInstance.current = L.map(mapRef.current).setView([points[0]?.lat || 51.505, points[0]?.lng || -0.09], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapInstance.current);
        }

        // Add markers for the points only after map is initialized
        if (mapInstance.current && points.length > 0) {
            points.forEach((point) => {
                // Check if point data is valid
                if (point.lat && point.lng) {
                    L.marker([point.lat, point.lng])
                        .addTo(mapInstance.current)
                        .bindPopup(point.name);
                }
            });
        }

        // Update the route when the route data changes
        if (route.length > 0 && mapInstance.current) {
            // Create or update the routing control
            if (routingControl.current) {
                // If routing control already exists, set the new waypoints
                routingControl.current.setWaypoints([
                    L.latLng(route[0]?.lat, route[0]?.lng),
                    L.latLng(route[route.length - 1]?.lat, route[route.length - 1]?.lng),
                ]);
            } else {
                // Create the routing control if it doesn't exist
                routingControl.current = L.Routing.control({
                    waypoints: [
                        L.latLng(route[0]?.lat, route[0]?.lng),
                        L.latLng(route[route.length - 1]?.lat, route[route.length - 1]?.lng),
                    ],
                    createMarker: () => null, // Optionally disable markers at waypoints
                    routeWhileDragging: true, // Allow route update while dragging
                    geocoder: L.Control.Geocoder.nominatim(), // Geocoder for addresses if needed
                }).addTo(mapInstance.current);
            }
        }
    }, [points, route]); // Only re-run when points or route data changes

    return (
        <div>
            {/* Display loading or error message */}
            {loading && <p>Loading map points...</p>}
            {error && <p>{error}</p>}

            {/* Add Leaflet Map */}
            <div style={{ height: '1200px', width: '100%', marginTop: '20px' }}>
                <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            </div>
        </div>
    );
}
