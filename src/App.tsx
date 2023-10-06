import "./App.css";
import { useContext, useEffect, useState, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { saveAs } from "file-saver";
import { Canvas } from '@react-three/fiber';
import TorusList from './components/TorusList';
// import  Geolocation_test  from './components/GeoLocation_test';
import { getLocationConfig } from './api/fetchDb';
import { FeatureCollection, Point } from 'geojson';
import { haversineDistance } from './api/distanceCalculations';
// import { LocationDataProvider } from './providers/LocationDataProvider';
import LocationDataProvider from "./providers/LocationDataProvider";
import { RingContext } from "./providers/RingProvider";
import Camera from "./components/Camera";
import { WebGLRenderer } from "three";
import * as THREE from "three";


export default function App() {
  // リングのデータを追加するためのcontext
  const {
    addTorus,
    setCurrentIp,
    setCurrentLatitude,
    setCurrentLongitude,
    setLocation,
    setLocationJp,
    usedOrbitIndexes
  } = useContext(RingContext);

  // // // // // // // // // // // // // // // // // // // // // // 
  // compareCurrentIPWithLastIP
  // アクティブなIPアドレスと前回登録したIPアドレスを比較
  // // // // // // // // // // // // // // // // // // // // // // 

  // ipFlag
  const [ipFlag, setIpFlag] = useState<number>(0);

  async function compareCurrentIPWithLastIP() : Promise<number> {
    // ipFlagの戻り値　デフォルト0
    let result = 0;
    
    try {
      // 現在のIPアドレスを取得
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const currentIP = data.ip;
      setCurrentIp(currentIP); // useStateで現在のipを保管する
      console.log(`Your current IP is: ${currentIP}`);

      // 前回登録時のIPアドレスを取得（latestRing.userIpと仮定）
      const latestRing = {
        userIp: "123.456.789.000",  //テスト用データ　要削除
      };
      const lastIP = latestRing.userIp;
      console.log(`LatestRing user IP is: ${lastIP}`);
      
      if (currentIP !== lastIP) {
        result = 1; // IPアドレスが異なる場合、resultを1に設定
      }
    } catch (error) {
      console.error("Error fetching GeoJSON Point data or getting current location:", error);
    }
    return result; 
  }

  // アクティブなIPアドレスと前回登録したIPアドレスを比較した結果をipFlagにセット
  useEffect(() => {
    compareCurrentIPWithLastIP().then(result => {
      setIpFlag(result);
      console.log(`ipFlag : ${result}`);
    });
  }, []);



  /* 写真撮影 */
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const renderer: WebGLRenderer = new WebGLRenderer({ canvas: canvasRef.current, preserveDrawingBuffer: true });
      rendererRef.current = renderer;
    }
  }, []);

  // カメラとリングのcanvas要素を合成して、base64形式の画像を返す関数
  function captureImage(): string | null{
    // カメラとリングのcanvas要素を、それぞれ取得する
    const ringCanvas: HTMLCanvasElement | null = captureRingImage();
    const cameraCanvas: HTMLCanvasElement | null = getVideoCanvas();
    if(!ringCanvas) return null;
    if(!cameraCanvas) return null;

    // 2つのcanvas要素を合成したものを貼り付けるためのcanvas要素を作成する
    const canvasElement: HTMLCanvasElement = document.createElement("canvas");
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;

    // 作成したcanvasに、2つのcanvas要素を貼り付ける
    const canvasCtx: CanvasRenderingContext2D | null = canvasElement.getContext("2d");
    if(!canvasCtx) return null;
    canvasCtx.drawImage(cameraCanvas, 0, 0, canvasElement.width, canvasElement.height); // カメラを貼り付ける
    canvasCtx.drawImage(ringCanvas, 0, 0, canvasElement.width, canvasElement.height); // リングを貼り付ける

    // base64として出力する
    const dataURL = canvasElement.toDataURL('image/png');
    console.log(dataURL);
    saveImage(dataURL); // 画像として保存する
    return dataURL;
  }

  // カメラのvideo要素からcanvas要素を取得する関数
  function getVideoCanvas(): HTMLCanvasElement | null{
    // video要素を取得する
    const videoElement: HTMLVideoElement | null = videoRef.current;
    if(!videoElement) return null;

    // video要素の描画を貼り付けるためのcanvas要素を作成する
    const canvasElement: HTMLCanvasElement = document.createElement("canvas");
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;

    // 作成したcanvas要素にvideo要素の描画を貼り付ける
    const canvasCtx: CanvasRenderingContext2D | null = canvasElement.getContext('2d');
    if(!canvasCtx) return null;
    canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    return canvasElement;
  }

  // リングのcanvas要素を取得する関数
  function captureRingImage(): HTMLCanvasElement | null{
    if (rendererRef.current) {
      const renderer: WebGLRenderer = rendererRef.current;
      const canvasElement: HTMLCanvasElement = renderer.domElement;
      return canvasElement;
    }else{
      return null;
    }
  };

  const saveImage = (dataURL: string) => {
    // DataURLからBlobを作成
    const blob = dataURLToBlob(dataURL);

    // 'file-saver'ライブラリを使ってダウンロード
    saveAs(blob, "screenshot.png");
  };

  const dataURLToBlob = (dataURL: string) => {
    const byteString = window.atob(dataURL.split(",")[1]);
    const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
    }
    return new Blob([uint8Array], { type: mimeString });
  };



  // // // // // // // // // // // // // // // // // // // // // // 
  // compareCurrentLocationWithPin
  // 現在地の取得とピンの位置を比較
  // // // // // // // // // // // // // // // // // // // // // // 

  // 環境変数(REACT_APP_RADIUS)から半径の値を取得 
  // 環境変数が数値でない、または設定されていない場合はデフォルト値として 1000m を使用
  // const RADIUS = process.env.REACT_APP_RADIUS ? parseInt(process.env.REACT_APP_RADIUS) : 1000;
  const RADIUS = 1000;

  // gpsFlag
  const [gpsFlag, setGpsFlag] = useState<number>(0);

  // errorMessage
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function compareCurrentLocationWithPin() : Promise<number> {
    // gpsFlagの戻り値　デフォルト0
    let result = 0;

    // 現在地の緯度経度を取得するPromiseを返す関数
    const getCurrentLocation = (): Promise<[number, number]> => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve([position.coords.latitude, position.coords.longitude]);
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              setErrorMessage("アプリを使用するにはGPSを許可してください");
            }
            reject(error);
          }
        );
      });
    };

    try {
      // 現在地の緯度と経度を取得
      const [currentLat, currentLon] = await getCurrentLocation();

      // console.log(`Your latitude is: ${currentLat}`);
      // console.log(`Your longitude is: ${currentLon}`);

      setCurrentLatitude(currentLat);
      setCurrentLongitude(currentLon);

      // ピンの位置情報を取得
      const geoJSONData: FeatureCollection<Point> = await getLocationConfig();

      // 各ピンの位置と現在地との距離をチェック
      for (const feature of geoJSONData.features) {
        const [longitude, latitude] = feature.geometry.coordinates;
        const distance = haversineDistance(currentLat, currentLon, latitude, longitude);
        const currentLocation: string = feature.properties?.location ?? "";
        const currentLocationJp: string = feature.properties?.locationJp ?? "";
        // console.log(`Location is: ${currentLocation}`);
        // console.log(`LocationJP is: ${currentLocationJp}`);
        setLocation(currentLocation);
        setLocationJp(currentLocationJp);
        if (distance <= RADIUS) {
          result = 1; // 条件に合致した場合、resultを1に設定
          console.log(`Feature is within ${RADIUS} meters of your current location.`);
          break; // 1つでも条件に合致するピンが見つかった場合、ループを抜ける
        } else {
          console.log(`Feature is ${distance} meters away from your current location.`);
        }
      };
    } catch (error) {
      console.error("Error fetching GeoJSON Point data or getting current location:", error);
    }
    return result; 
  }

  // GeoJSON Pointデータと現在地の比較を実行した結果をgpsFlagにセット
  useEffect(() => {
    compareCurrentLocationWithPin().then(result => {
      setGpsFlag(result);
      console.log(`gpsFlag : ${result}`);
    });
  }, []);

  return (
    <LocationDataProvider>
        <div className="camera">
          <Camera videoRef={videoRef}/>
        </div>
        <div className='canvas'>
          <Canvas
            onCreated={({ gl }) => {
              gl.setClearColor(0xFF0000, 0);
              gl.autoClear = true;
              gl.clearDepth()
            }}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0,0,10] }}
            ref={canvasRef}
          >
              <TorusList/>
              <OrbitControls/>
          </Canvas>
          <button onClick={addTorus}>追加(リング数: {usedOrbitIndexes.length})</button>
          <button
            /* TODO いらなくなったらこのbuttonごと消す */
            style={{
              marginLeft: "8rem"
            }}
            onClick={() => {
              fetch("https://wawwdtestdb-default-rtdb.firebaseio.com/rings.json", {
                method: 'DELETE'
              });
            }}
          >
            サーバーデータ削除
          </button>
          <button
            onClick={captureImage}
            style={{
              position: "absolute",
              top: "80%",
              left: "50%",
              height: "2rem"
            }}
          >
            Capture
          </button>
        </div>
    </LocationDataProvider>
  );
}