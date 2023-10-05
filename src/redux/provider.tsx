import { Provider } from "react-redux";
import { store } from "./store";
import { DbProvider } from "../providers/DbProvider";
import { RingProvider } from "../providers/RingProvider";

export function Providers({ children }: {children: React.ReactNode}) {
    return (
        <Provider store={store}>
            <DbProvider>
                <RingProvider>
                    {children}
                </RingProvider>
            </DbProvider>
        </Provider>
    )
}