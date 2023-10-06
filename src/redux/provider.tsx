import { Provider } from "react-redux";
import { store } from "./store";
import { DbProvider } from "../providers/DbProvider";
import { RingProvider } from "../providers/RingProvider";
import { CaptureProvider } from "../providers/CaptureProvider";

export function Providers({ children }: {children: React.ReactNode}) {
    return (
        <Provider store={store}>
            <DbProvider>
                <RingProvider>
                    <CaptureProvider>
                        {children}
                    </CaptureProvider>
                </RingProvider>
            </DbProvider>
        </Provider>
    )
}