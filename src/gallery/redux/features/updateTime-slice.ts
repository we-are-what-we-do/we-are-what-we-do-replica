import { createSlice } from "@reduxjs/toolkit";

const initUptime: string = "";

export const upTime = createSlice({
    name: "uptime",
    initialState: { value: initUptime },
    reducers: {
        getUpdateTime: ((state, action) => {state.value = action.payload}),
    }
});

export const { getUpdateTime } = upTime.actions;
export default upTime.reducer;