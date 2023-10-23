import { Provider } from "react-redux";
import { store } from "../../redux/store";
import { DbProvider } from "./DbProvider";
import { RingProvider } from "./RingProvider";
import { CameraProvider } from "../../providers/CameraProvider";
import { CaptureProvider } from "../../providers/CaptureProvider";

export function Providers({ children }: {children: React.ReactNode}) {
  return (
    <Provider store={store}>
      <DbProvider>
        <RingProvider>{/* DbProvider, IpProvider, GpsProvider配下にRingProviderを設置 */}
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