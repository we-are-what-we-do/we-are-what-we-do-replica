import { Provider } from "react-redux";
import { store } from "./store";
import { DbProvider } from "../providers/DbProvider";
import { RingProvider } from "../providers/RingProvider";
import { CameraProvider } from "../providers/CameraProvider";
import { CaptureProvider } from "../providers/CaptureProvider";
import { IpProvider } from "../providers/IpProvider";
import { GpsProvider } from "../providers/GpsProvider";

export function Providers({ children }: {children: React.ReactNode}) {
  return (
    <Provider store={store}>
      <DbProvider>
        <IpProvider>{/* DbProvider配下にIpProviderを設置 */}
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