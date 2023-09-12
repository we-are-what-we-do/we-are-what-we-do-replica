import { createSlice } from "@reduxjs/toolkit";

export type TorusInfo = {
    id: number;
    color: number, 
    rotateX: number, 
    rotateY: number,
    positionX: number,
    positionY: number,
    scale: number,
}

const torusStore: TorusInfo[] = [];

export const torusInfo = createSlice({
    name: "torusDetails",
    initialState: { value: torusStore },
    reducers: {
        pushTorusInfo: ((state, action) => { state.value.push(action.payload)}),
    }
});

export const { pushTorusInfo } = torusInfo.actions;
export default torusInfo.reducer;