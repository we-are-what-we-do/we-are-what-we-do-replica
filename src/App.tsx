import "./App.css";
import { useContext, useEffect, useRef, useState } from "react";
import { CaptureContext } from "./providers/CaptureProvider";
import { GpsContext } from "./providers/GpsProvider";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import TorusList from './components/TorusList';
import LocationDataProvider from "./providers/LocationDataProvider";
import Camera from "./components/Camera";
import { ToastContainer } from 'react-toastify';
import { showInfoToast } from "./components/ToastHelpers"
import { Vector3 } from "three";
import ButtonArea from "./components/ButtonArea";
import TestButtons from "./components/TestButtons";


export default function App() {
  /* stateやcontext等 */
  // 写真撮影(リング+カメラ)のためのcontext
  const {
    canvasRef
  } = useContext(CaptureContext);

  // GPSの状態を管理するcontext
  const {
    gpsFlag,
    errorMessage
  } = useContext(GpsContext);

  // 既にリングを追加したかどうかを管理するref
  const hasPostRing = useRef<boolean>(false);

  // 3Dの視点移動(OrbitControl)が有効かどうかを管理するstate
  const [enableOrbitControl, setEnableOrbitControl] = useState<boolean>(true);


  /* useEffect等 */
  // 初回レンダリング時、案内を送信する
  useEffect(() => {
    // 「ARリングを増やしましょう。」というメッセージボックスを表示する
    showInfoToast("I003");
  }, []);


  /* DEIの初期表示をレスポンシブに行う */
  const [positionZ, setPositionZ] = useState<Vector3>(new Vector3(0,0,10));
  useEffect(() => {
    // コンポーネントの初回マウント時、DEIリングをレスポンシブな位置に設定する
    const width = window.innerWidth;
    
    if (width >= 600 && width <= 960) {
      setPositionZ(new Vector3(0,0,10));
    } else if (width >= 450 && width <= 600) {
      setPositionZ(new Vector3(0,0,15));
    } else if (width <= 450) {
      setPositionZ(new Vector3(0,0,20));
    } else {
      setPositionZ(new Vector3(0,0,6));
    }
  }, []);


  return(
    <LocationDataProvider> 
      {errorMessage && (
        <div className="error-message-box">
          {errorMessage}
        </div>
      )}
      <div id="app">
        <div className="camera">
          <Camera/>
        </div>
        <div className='canvas'>
          <Canvas
            onCreated={({ gl }) => {
              gl.setClearColor(0xFF0000, 0);
              gl.autoClear = true;
              gl.clearDepth()
            }}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: positionZ }}
            ref={canvasRef}
          >
            {//Boolean(gpsFlag) && (
            (Boolean(gpsFlag) || true) && ( // TODO どこでもリング表示機能(テスト)を削除する
              <TorusList/> // リングはピン設置箇所の近くでのみ表示される
            )}
            <ambientLight intensity={1} />
            <directionalLight intensity={1.5} position={[1,1,1]} />
            <directionalLight intensity={1.5} position={[1,1,-1]} />
            <pointLight intensity={1} position={[1,1,5]}/>
            <pointLight intensity={1} position={[1,1,-5]}/>
            <OrbitControls enabled={enableOrbitControl}/>
          </Canvas>
        </div>
      </div>
      <TestButtons
        hasPostRing={hasPostRing}
      />
      <ButtonArea
        enableOrbitControl={enableOrbitControl}
        setEnableOrbitControl={setEnableOrbitControl}
        hasPostRing={hasPostRing}
      />
      <ToastContainer />
    </LocationDataProvider>
  );
}