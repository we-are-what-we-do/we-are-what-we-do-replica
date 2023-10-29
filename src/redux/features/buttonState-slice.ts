import { createSlice } from "@reduxjs/toolkit";

const initialState: boolean = false; 

export const buttonState = createSlice({
    name: "buttonState",
    initialState: { value: initialState },
    reducers: {
        changeButtonState: ((state) => { state.value = !state.value }),
    }
});

export const { changeButtonState } = buttonState.actions;
export default buttonState.reducer;