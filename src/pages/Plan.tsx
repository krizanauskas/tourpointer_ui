import { Autocomplete, AutocompleteItem } from '../components/autocomplete.tsx'
import { Button, Space  } from '@mantine/core';
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import config from "../config.ts";
import {notifications} from "@mantine/notifications";

export default function Plan() {
    const [from, setFrom] = useState<AutocompleteItem | null>(null);
    const [to, setTo] = useState<AutocompleteItem | null>(null);
    const navigate = useNavigate();

    const handleProceed = async () => {
        if (!(from && to)) {
            return
        }

        try {
            const response = await axios.get(`${config.api.baseUrl}${config.api.endpoints.directions}`,
                {
                    params: {
                        from: from.place_id,
                        to: to.place_id,
                    }
                });

            const data = response.data;

            navigate(`/plan/${data.data.Id}`)
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
        }
    };

    return (
        <div className="new-plan">
            <div className="container">
                <h1>Start planning your trip</h1>

                <p>
                    To suggest attractions please provide trip details below:
                </p>
                <Space h="md" />
                <Autocomplete onSelect={setFrom} initialValue={null} placeholder="Start typing.." label="Starting location"/>
                <Space h="md" />
                <Autocomplete onSelect={setTo} initialValue={null} placeholder="Start typing.." label="Destination"/>
                <Space h="md"/>
                <Button variant="filled" size="md" radius="md" onClick={handleProceed}>Plan</Button>
            </div>
        </div>
    );
}
