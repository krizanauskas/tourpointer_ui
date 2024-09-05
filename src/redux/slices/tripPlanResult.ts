import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Attraction {
    name: string;
    cover_img_url: string;
}

interface ResultState {
    attractions: Attraction[] | null;
}

const initialState: ResultState = {
    attractions: null,
}

const resultSlice = createSlice({
    name: 'result',
    initialState,
    reducers: {
        setAttractions: (state, action: PayloadAction<Attraction[]>) => {
            state.attractions = action.payload;
        },
    },
})

export const { setAttractions } = resultSlice.actions
export default resultSlice.reducer