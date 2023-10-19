import { Provider } from "react-redux";
import { store } from "../../redux/store";
import { DbProvider } from "./DbProvider";
import { RingProvider } from "./RingProvider";
import { CameraProvider } from "../../providers/CameraProvider";
import { CaptureProvider } from "../../providers/CaptureProvider";
import { IpProvider } from "./IpProvider";
import { GpsProvider } from "./GpsProvider";

export function Providers({ children }: {children: React.ReactNode}) {
  return (
    <Provider store={store}>
      <DbProvider>
        <IpProvider>
          <GpsProvider>
            <RingProvider>{/* DbProvider, IpProvider, GpsProvider配下にRingProviderを設置 */}
              <CameraProvider>
                <CaptureProvider>{/* CameraProvider配下にCaptureProviderを設置 */}
                  {children}
                </CaptureProvider>
              </CameraProvider>
            </RingProvider>
          </GpsProvider>
        </IpProvider>
      </DbProvider>
    </Provider>
  )
}