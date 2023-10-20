import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import torusInfoSlice from "./features/torusInfo-slice";
import randIndexSlice from "./features/randIndex-slice";
import animeVisibleSlicec from "./features/animeVisible-slicec";
import resetButtonDisabledSlice from "./features/resetButton-Disabled-slice";

export const store = configureStore({
    reducer: {
        torusInfo      : torusInfoSlice,
        animeIndex     : randIndexSlice,
        anime          : animeVisibleSlicec, 
        enableChangeBt : resetButtonDisabledSlice, 
    },
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;