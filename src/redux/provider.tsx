"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { DbProvider } from "../providers/DbProvider";

export function Providers({ children }: {children: React.ReactNode}) {
    return (
        <Provider store={store}>
            <DbProvider>
                {children}
            </DbProvider>
        </Provider>
    )
}