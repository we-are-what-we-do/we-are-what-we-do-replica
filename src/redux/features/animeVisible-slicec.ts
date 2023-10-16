import { createSlice } from "@reduxjs/toolkit";

const initialState: boolean = true; 

export const animeVisible = createSlice({
    name: "anime",
    initialState: { value: initialState },
    reducers: {
        changeVisibility: ((state) => { state.value = !state.value }),
    }
});

export const { changeVisibility } = animeVisible.actions;
export default animeVisible.reducer;