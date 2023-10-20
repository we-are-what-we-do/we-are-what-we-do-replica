import { createSlice } from "@reduxjs/toolkit";

const initialState: boolean = false;

export const resetButtonDisabled = createSlice({
    name: "buttonDiabled",
    initialState: { value: initialState },
    reducers: {
        changeDisabled: ((state) => { state.value = !state.value }),
    }
});

export const { changeDisabled } = resetButtonDisabled.actions;
export default resetButtonDisabled.reducer;