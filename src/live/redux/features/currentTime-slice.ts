import { createSlice } from "@reduxjs/toolkit";

const updateTime: string = "";

export const timer = createSlice({
    name: "time",
    initialState: { value: updateTime },
    reducers: {
        getCurrentTime: ((state, action) => { state.value = action.payload }),
    }
});

export const { getCurrentTime } = timer.actions;
export default timer.reducer;