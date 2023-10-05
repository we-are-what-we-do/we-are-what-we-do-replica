import { createSlice } from "@reduxjs/toolkit";

export type TorusInfo = {
    id: string;
    color: string, 
    rotateX: number, 
    rotateY: number,
    positionX: number,
    positionY: number,
    scale: number,
}

const torusStore: TorusInfo[] = [];//オブジェクト形式で受け取ったリング情報を格納していく

export const torusInfo = createSlice({
    name: "torusDetails",
    initialState: { value: torusStore },
    reducers: {
        pushTorusInfo: ((state, action) => { state.value.push(action.payload) }),
        resetHandle: () => { return { value: torusStore } },
    }
});

export const { pushTorusInfo, resetHandle } = torusInfo.actions;
export default torusInfo.reducer;