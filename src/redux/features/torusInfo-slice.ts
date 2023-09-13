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
        pushTorusInfo: ((state, action) => { state.value.push(action.payload); console.log(torusInfo)}),
        initHandle: () => { return { value: torusStore }},
    }
});

export const { pushTorusInfo, initHandle } = torusInfo.actions;
export default torusInfo.reducer;