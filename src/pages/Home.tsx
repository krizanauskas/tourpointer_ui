import { Link } from 'react-router-dom';
import {useEffect, useState} from "react";
import axios from "axios";
import config from "../config.ts";

interface Trip {
    from: string;
    to: string;
    id: string;
    stops: number;
}

export default function Home() {
    const [trips, setTrips] = useState<Trip[]>([]);

    useEffect(() => {
        console.log('useEffect triggered');
        const fetchTrips = async () => {
            try {
                const response = await axios.get(`${config.api.baseUrl}/routes/trips`);

                setTrips(response.data.data)
            } catch (err) {
                console.error('Error fetching trips:', err);
            }
        };

        fetchTrips();
    }, []);

    return (
        <div>
            <div>
                <Link to="/new-plan">Create a New Plan</Link>
            </div>

            <div>
                <ul>
                    {trips.map((trip) => (
                      <li key={trip.id}>
                          <Link to={`/plan/${trip.id}`}>
                              {trip.from} to {trip.to} (Stops: {trip.stops})
                          </Link>
                      </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
