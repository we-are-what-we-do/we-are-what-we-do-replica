import { createSlice } from "@reduxjs/toolkit";

const initialState: string = "";

export const randIndex = createSlice({
    name: "animeIndex",
    initialState: { value: initialState },
    reducers: {
        getRandIndex: ((state, action) => { state.value = action.payload }),
    }
});

export const { getRandIndex } = randIndex.actions;
export default randIndex.reducer;