import { createSlice } from "@reduxjs/toolkit";

const initialState: boolean = false; 

export const buttonState = createSlice({
    name: "buttonState",
    initialState: { value: initialState },
    reducers: {
        changeButton: ((state) => { state.value = !state.value }),
    }
});

export const { changeButton } = buttonState.actions;
export default buttonState.reducer;