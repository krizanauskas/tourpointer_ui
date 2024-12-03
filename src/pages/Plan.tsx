import { Autocomplete, AutocompleteItem } from '../components/autocomplete.tsx'
import { Button, Space  } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Plan() {
    const [from, setFrom] = useState<AutocompleteItem | null>(() => {
        const storedValue = localStorage.getItem('from');
        return storedValue ? JSON.parse(storedValue) : null;
    });
    const [to, setTo] = useState<AutocompleteItem | null>(() => {
        const storedValue = localStorage.getItem('to');
        return storedValue ? JSON.parse(storedValue) : null;
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (from) {
            localStorage.setItem('from', JSON.stringify(from));
        }
    }, [from]);

    useEffect(() => {
        if (to) {
            localStorage.setItem('to', JSON.stringify(to));
        }
    }, [to]);

    const handleProceed = () => {
        navigate('/new-view');
    };

    return (
        <div>
            <h1>Enter from to</h1>
            <Autocomplete onSelect={setFrom} initialValue={from} />

            <Autocomplete onSelect={setTo} initialValue={to} />
            <Space h="md" />
            <Button variant="filled" size="lg" radius="md" onClick={handleProceed}>Plan</Button>
        </div>
    );
}
