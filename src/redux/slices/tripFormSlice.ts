import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PlanFormState {
  selectedPlace: string;
  tripDates: [string | null, string | null];
  activities: string[];
}

const initialState: PlanFormState = {
  selectedPlace: '',
  tripDates: [null, null],
  activities: [],
};

const planFormSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    setSelectedPlace: (state, action: PayloadAction<string>) => {
      state.selectedPlace = action.payload;
    },
    setTripDates: (state, action: PayloadAction<[string | null, string | null]>) => {
      state.tripDates = action.payload;
    },
    setActivities: (state, action: PayloadAction<string[]>) => {
      state.activities = action.payload;
    },
  },
});

export const { setSelectedPlace, setTripDates, setActivities } = planFormSlice.actions;

export default planFormSlice.reducer;