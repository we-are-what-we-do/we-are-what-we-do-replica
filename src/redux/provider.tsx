import { Provider } from "react-redux";
import { store } from "./store";
import { DbProvider } from "../providers/DbProvider";
import { RingProvider } from "../providers/RingProvider";
import { CameraProvider } from "../providers/CameraProvider";
import { CaptureProvider } from "../providers/CaptureProvider";

export function Providers({ children }: {children: React.ReactNode}) {
  return (
    <Provider store={store}>
      <DbProvider>
            <RingProvider>{/* DbProvider, UserProvider, GpsProvider配下にRingProviderを設置 */}
              <CameraProvider>
                <CaptureProvider>{/* CameraProvider配下にCaptureProviderを設置 */}
                    {children}
                </CaptureProvider>
              </CameraProvider>
            </RingProvider>
      </DbProvider>
    </Provider>
  )
}
