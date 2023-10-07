import "./App.css";
import { useContext, useEffect, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import TorusList from './components/TorusList';
import { getLocationConfig, postNftImage, postRingData } from './api/fetchDb';
import { FeatureCollection, Point } from 'geojson';
import { haversineDistance } from './api/distanceCalculations';
import LocationDataProvider from "./providers/LocationDataProvider";
import Camera from "./components/Camera";
import { CaptureContext } from "./providers/CaptureProvider";
import { CameraContext } from "./providers/CameraProvider";
import { DbContext } from "./providers/DbProvider";
import { RingContext } from "./providers/RingProvider";
import { RingData } from "./redux/features/handleRingData";


export default function App() {
    // サーバーから取得したリングデータを管理するcontext
    const {
      setLatestRing
  } = useContext(DbContext);

  // リングのデータを追加するためのcontext
  const {
    addTorus,
    setCurrentIp,
    setCurrentLatitude,
    setCurrentLongitude,
    setLocation,
    setLocationJp,
    setUsedOrbitIndexes,
    usedOrbitIndexes,
    initializeRingDraw
  } = useContext(RingContext);

  // アウトカメラ/インカメラを切り替えるためのcontext
  const { switchCameraFacing } = useContext(CameraContext);

  // 写真撮影(リング+カメラ)のためのcontext
  const {
    captureImage,
    saveImage,
    canvasRef
  } = useContext(CaptureContext);


  // 撮影ボタンを押したときの処理
  async function handleTakePhotoButton(): Promise<void>{
    // 新しいリングを追加して描画する
    // 追加したリングのデータを取得する
    const newRingData: RingData = await addTorus();

    // 写真撮影(リング)をする
    // 撮影した写真をダウンロードする
    // 撮影した写真をbase64形式で取得する
    const newImage: string | null = captureImage();
    if(newImage === null){
      console.error("base64形式の画像を取得できませんでした");
      alert("申し訳ございません、写真を撮影できませんでした。");
      return;
    }

    // 撮影した写真に確認を取る
    const isPhotoOk: boolean = confirm("撮影画像はこちらでよいですか");

    if(isPhotoOk){
      // 撮影した写真に承諾が取れたら、サーバーにリングを送信する
      try{
        // リングのデータを送信する
        await postRingData(newRingData); //サーバーにリングデータを送信する
        await postNftImage(newImage); // base64形式の画像をサーバーに送信する
        console.log("サーバーにデータを送信しました:\n", newRingData);

        // 画像として保存する
        saveImage(newImage);

        // 最新のリングを更新する
        setLatestRing(newRingData);

        // 使用済みの軌道番号として保存しておく
        const newOrbitIndex: number = newRingData?.orbitIndex ?? -1;
        setUsedOrbitIndexes((prev) => [...prev, newOrbitIndex]);
      }catch(error){
        // サーバーにリングデータを送信できなかった際のエラーハンドリング
        console.error("サーバーにデータを送信できませんでした\n以下の可能性があります\n- 送信しようとしたリングデータがコンフリクトを起こした\n- サーバーにアクセスできない", error);
        alert("申し訳ございません、リングを追加できませんでした。\nしばらく待ってから再度お試しください。");
        location.reload(); //ページをリロードする
      }
    }else{
      // 再撮影を望む場合、描画に追加したリングを初期化して処理を止める
      initializeRingDraw(); // リング描画を初期化する
    }
  }


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
            camera={{ position: [0,0,10] }}
            ref={canvasRef}
          >
              <TorusList/>
              <ambientLight intensity={1} />
              <directionalLight intensity={1.5} position={[1,1,1]} />
              <directionalLight intensity={1.5} position={[1,1,-1]} />
              <pointLight intensity={1} position={[1,1,5]}/>
              <pointLight intensity={1} position={[1,1,-5]}/>
              <OrbitControls/>
          </Canvas>
          <button
            onClick={handleTakePhotoButton}
            style={{
              position: "absolute",
              top: "65%",
              left: "50%",
              height: "2rem"
            }}
          >
            撮影
          </button>
          <button
            onClick={addTorus}
            style={{
              position: "absolute",
              top: "85%",
              left: "40%",
              height: "2rem"
            }}
          >
            追加(リング数: {usedOrbitIndexes.length})
          </button>
          <button
            style={{
              position: "absolute",
              top: "85%",
              left: "70%",
              height: "2rem"
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
              top: "75%",
              left: "40%",
              height: "2rem"
            }}
          >
            キャプチャ
          </button>
          <button
            onClick={switchCameraFacing}
            style={{
              position: "absolute",
              top: "75%",
              left: "60%",
              height: "2rem"
            }}
          >
            カメラ切り替え
          </button>
        </div>
    </LocationDataProvider>
  );
}