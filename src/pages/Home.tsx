import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import L from 'leaflet';
import 'leaflet-routing-machine'; // Import the routing machine
import config from "../config.ts";
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';

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
    const [route, setRoute] = useState<Coordinate[]>([]);
    const mapRef = useRef(null); // Reference for the map container

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
                // Using hardcoded coordinates as an example, but can use dynamic ones from the points
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

        fetchRoute();
        fetchPoints();
    }, []);

    useEffect(() => {
        if (mapRef.current && points.length > 0 && route.length > 0) {
            const map = mapRef.current;

            // Initialize Leaflet map
            const leafletMap = L.map(map).setView([points[0].lat, points[0].lng], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(leafletMap);

            // Create a routing control to display the route along roads
            const routeControl = L.Routing.control({
                waypoints: [
                    L.latLng(route[0].lat, route[0].lng),
                    L.latLng(route[route.length - 1].lat, route[route.length - 1].lng),
                ],
                createMarker: () => null, // Optionally disable markers at waypoints
                routeWhileDragging: true, // Allow route update while dragging
                geocoder: L.Control.Geocoder.nominatim(), // Geocoder for addresses if needed
            }).addTo(leafletMap);

            // Add markers for the points
            points.forEach((point) => {
                L.marker([point.lat, point.lng]).addTo(leafletMap).bindPopup(point.name);
            });
        }
    }, [points, route]);

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
