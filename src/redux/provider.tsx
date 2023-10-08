import { Provider } from "react-redux";
import { store } from "./store";
import { DbProvider } from "../providers/DbProvider";
import { RingProvider } from "../providers/RingProvider";
import { CameraProvider } from "../providers/CameraProvider";
import { CaptureProvider } from "../providers/CaptureProvider";

export function Providers({ children }: {children: React.ReactNode}) {
    return (
        <Provider store={store}>
            <DbProvider>{/* DbProvider配下にRingProviderを設置 */}
                <RingProvider>
                    <CameraProvider>{/* CameraProvider配下にCaptureProviderを設置 */}
                        <CaptureProvider>
                            {children}
                        </CaptureProvider>
                    </CameraProvider>
                </RingProvider>
            </DbProvider>
        </Provider>
    )
}