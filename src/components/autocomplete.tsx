import {Combobox, Loader, Text, TextInput, useCombobox} from "@mantine/core";
import {useRef, useState, useEffect} from "react";
import axios from "axios";
import config from "../config";

export type AutocompleteItem = {
    name: string;
    place_id: string;
};

type AutocompleteProps = {
    onSelect: (selected: AutocompleteItem) => void;
    initialValue: AutocompleteItem | null;
    label: string;
    placeholder: string;
};

async function getAsyncData(searchQuery: string, signal: AbortSignal): Promise<AutocompleteItem[]> {
    if (searchQuery.length < 3) {
        return []; // Return an empty array if query length is less than 3
    }

    try {
        const response = await axios.get(`${config.api.baseUrl}${config.api.endpoints.autocomplete}${searchQuery}`, {
            signal,
        });

        return response.data.data.map((item: { name: string; place_id: string }): AutocompleteItem => ({
            name: item.name,
            place_id: item.place_id,
        }));
    } catch (err: unknown) {
        if (axios.isCancel(err)) {
            console.log('Request canceled:', (err as Error).message);
        } else if (err instanceof Error) {
            console.error('Error fetching data:', err.message);
        } else {
            console.error('Unknown error occurred:', err);
        }

        throw err;
    }
}

export function Autocomplete({ onSelect, initialValue, label, placeholder }: AutocompleteProps) {
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<AutocompleteItem[] | null>(null);
    const [value, setValue] = useState<string>('');  // This holds the name
    const [empty, setEmpty] = useState(false);
    const [searching, setSearching] = useState(false);  // New state to track search status
    const abortController = useRef<AbortController>();

    useEffect(() => {
        if (initialValue) {
            setValue(initialValue.name);
        }
    }, [initialValue]);

    const fetchOptions = (query: string) => {
        // Cancel the previous request if it exists
        abortController.current?.abort();
        abortController.current = new AbortController();
        setLoading(true);

        // Only set searching true if the user is typing
        setSearching(true);

        // Delay API call by 1 second if query length is 3 or more
        if (query.length >= 3) {
            setTimeout(() => {
                getAsyncData(query, abortController.current.signal)
                    .then((result) => {
                        setData(result);
                        setLoading(false);
                        setSearching(false);  // Stop searching indicator
                        setEmpty(result.length === 0);
                    })
                    .catch((err: unknown) => {
                        if (axios.isCancel(err)) {
                            console.log('Request canceled:', (err as Error).message);
                        } else if (err instanceof Error) {
                            console.error('Failed to fetch options:', err.message);
                        } else {
                            console.error('Unknown error occurred:', err);
                        }
                    })
                    .finally(() => {
                        abortController.current = undefined;
                        setLoading(false); // Ensure loading is reset even if there's an error
                    });
            }, 1000); // 1-second delay
        } else {
            setLoading(false); // Reset loading if query length is less than 3
            setEmpty(false); // Optionally show that no results are available
            setSearching(false);  // Stop searching indicator
        }
    };

    const options = (data || []).map((item) => (
        <Combobox.Option value={item.name} key={item.place_id}>
            {item.name}
        </Combobox.Option>
    ));

    return (
        <div>
            <Combobox
                onOptionSubmit={(optionValue: string) => {
                    const selectedItem = data?.find((item) => item.name === optionValue);
                    if (selectedItem) {
                        setValue(selectedItem.name); // Show the name in the input

                        onSelect(selectedItem)

                        combobox.closeDropdown();
                    }
                }}
                withinPortal={false}
                store={combobox}
            >
                <Combobox.Target>
                    <TextInput
                        label={label}
                        placeholder={placeholder}
                        value={value} // Display name in the input
                        onChange={(event) => {
                            setValue(event.currentTarget.value);
                            fetchOptions(event.currentTarget.value);
                            combobox.resetSelectedOption();
                            combobox.openDropdown();
                        }}
                        onClick={() => combobox.openDropdown()}
                        onFocus={() => {
                            combobox.openDropdown();
                            if (data === null) {
                                fetchOptions(value);
                            }
                        }}
                        onBlur={() => combobox.closeDropdown()}
                        rightSection={loading && <Loader size={18} />}
                    />
                </Combobox.Target>

                <Combobox.Dropdown hidden={data === null}>
                    <Combobox.Options>
                        {searching && <Text size="sm" color="gray">Searching...</Text>}
                        {options}
                        {empty && !searching && <Combobox.Empty>No results found</Combobox.Empty>}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </div>
    );
}