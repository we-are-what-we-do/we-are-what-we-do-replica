import { createSlice } from "@reduxjs/toolkit";
import { positionArray } from "../../torusPosition";

export type TorusInfo = {
    id:        string;
    color:     string, 
    rotateX:   number, 
    rotateY:   number,
    positionX: number,
    positionY: number,
    scale:     number,
}

const torusStore: TorusInfo[] = [];

export const torusInfo = createSlice({
    name: "torusDetails",
    initialState: { value: torusStore },
    reducers: {
        pushTorusInfo: ((state, action) => {
            const newTorus: TorusInfo = action.payload;
            if(state.value.length > positionArray.length){
                state.value = [newTorus];
            }else{
                state.value.push(action.payload)
            }
        }),
        resetHandle  : () => { return { value: torusStore } },
        replaceTorus : ((state, action) => {
            const newData: {existedId: string, newTorus: TorusInfo} = action.payload;
            const index = state.value.findIndex(element => element.id === newData.existedId);
            if (index !== -1) state.value.splice(index, 1, newData.newTorus);
        }),
    }
});

export const { pushTorusInfo, resetHandle, replaceTorus } = torusInfo.actions;
export default torusInfo.reducer;
