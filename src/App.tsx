import "./App.css";
import { useContext, useEffect, useRef, useState } from "react";
import { DbContext } from "./providers/DbProvider";
import { CaptureContext } from "./providers/CaptureProvider";
import { GpsContext } from "./providers/GpsProvider";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useThree } from '@react-three/fiber';
import TorusList from './components/TorusList';
// import LocationDataProvider from "./providers/LocationDataProvider";
import Camera from "./components/Camera";
import { ToastContainer } from 'react-toastify';
import { showInfoToast } from "./components/ToastHelpers"
import { Vector3, WebGLRenderer } from "three";
import ButtonArea from "./components/ButtonArea";
import TestButtons from "./components/TestButtons";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CircularProgress } from "@mui/material";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';


/* 定数定義 */
export const ICON_SIZE: string = "5rem"; // ボタンの大きさ
export const ICON_COLOR: string = "#FFFFFF"; // ボタンの色
export const DISABLED_COLOR: string = "rgba(0, 0, 0, 0.24)"; // 無効なボタンの色
export const BUTTON_MARGIN: string = "5rem"; // md以上におけるボタン間のmargin


// MUIのスタイルテーマ
const theme = createTheme({
    palette: {
        primary: {
            main: ICON_COLOR // プライマリーカラー(ボタンの色)を設定
        }
    },
    components: {
        MuiIconButton: {
            styleOverrides: {
                root: {
                    "&:disabled": {
                        color: DISABLED_COLOR
                    }
                }
            }
        }
    }
});


export default function App() {
  /* stateやcontext等 */
  const {
    isLoadedData
  } = useContext(DbContext);

  // 写真撮影(リング+カメラ)のためのcontext
  const {
    canvasRef,
    rendererRef
  } = useContext(CaptureContext);
  
  // GPSの状態を管理するcontext
  const {
    // gpsFlag,
    errorMessage
  } = useContext(GpsContext);
  const gpsFlag: boolean = true;// TODO どこでもリング表示機能(テスト)を削除する

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
  // position-zをuseStateで管理する
  const [positionZ, setPositionZ] = useState<Vector3>(new Vector3(0,0,10));
  // コンポーネントの初回マウント時、DEIリングをレスポンシブな位置に設定する
  useEffect(() => {
    const width = window.innerWidth;
    initializePositionZ(width);
  }, []);


  // 3Dオブジェクトにおける視点を、レスポンシブな初期位置に設定する関数(初回表示のみ！！)
  function initializePositionZ(width: number){
    if (width >= 600 && width <= 960) {
      setPositionZ(new Vector3(0,0,10));
    } else if (width >= 450 && width <= 600) {
      setPositionZ(new Vector3(0,0,15));
    } else if (width <= 450) {
      setPositionZ(new Vector3(0,0,20));
    } else {
      setPositionZ(new Vector3(0,0,6));
    }
  }


  //OrbitControlsの初期化
  const orbitControlsRef = useRef<OrbitControlsImpl>(null!);
  function orbitControlsReset() {
    orbitControlsRef.current.reset();
  }


  return(
    <> 
      {errorMessage && (
        <div className="error-message-box">
          {errorMessage}
        </div>
      )}
      <div id="app">
        <div className="camera">
          <Camera />
        </div>
        <div className='canvas'>
          {isLoadedData ? (
            <Canvas
              onCreated={({ gl }) => {
                gl.setClearColor(0xFF0000, 0);
                gl.autoClear = true;
                gl.clearDepth()
              }}
              gl={{ antialias: true, alpha: true }}
              camera={{ position: positionZ }}
              ref={(node) => {
                if(node){
                  const renderer: WebGLRenderer = new WebGLRenderer({ canvas: node, preserveDrawingBuffer: true });
                  rendererRef.current = renderer;
                }
                return canvasRef
              }}
            >
                {Boolean(gpsFlag) && (
                  <TorusList /> // リングはピン設置箇所の近くでのみ表示される
                )}
                <ambientLight intensity={1} />
                <directionalLight intensity={1.5} position={[1,1,1]} />
                <directionalLight intensity={1.5} position={[1,1,-1]} />
                <pointLight intensity={1} position={[1,1,5]} />
                <pointLight intensity={1} position={[1,1,-5]} />
                <OrbitControls enabled={enableOrbitControl} maxDistance={50} ref={orbitControlsRef} />
            </Canvas>
          ) : (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%"
              }}
            >
              <CircularProgress />
            </div>
          )}
        </div>
      </div>
      <ThemeProvider theme={theme}>
        {true && <TestButtons
          hasPostRing={hasPostRing}
        />}
        <ButtonArea
          theme={theme}
          enableOrbitControl={enableOrbitControl}
          setEnableOrbitControl={setEnableOrbitControl}
          hasPostRing={hasPostRing}
          initializePositionZ={() => initializePositionZ(window.innerWidth)}
          orbitControlsReset={orbitControlsReset}
        />
      </ThemeProvider>
      <ToastContainer />
    </>
  );
}