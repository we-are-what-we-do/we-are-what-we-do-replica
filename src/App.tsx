import "./App.css";
import { useContext, useEffect, useState, useRef } from "react";
import { useDispatch } from 'react-redux';

import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import { Ring, positionArray } from "./torusPosition";
import { AppDispatch } from "./redux/store";
import { TorusInfo, pushTorusInfo, resetHandle } from "./redux/features/torusInfo-slice";
import { v4 as uuidv4 } from 'uuid';
import { RingPosition } from "./torusPosition";
import TorusList from './components/TorusList';

// import  Geolocation_test  from './components/GeoLocation_test';
import { getLocationConfig } from './api/fetchDb';
import { FeatureCollection, Point } from 'geojson';
import { haversineDistance } from './api/distanceCalculations';
// import { LocationDataProvider } from './providers/LocationDataProvider';
import { DbContext } from "./providers/DbProvider";
import { RingData, RingPositionWithIndex, RingsData, convertToTorus, getRandomPositionExceptIndexes } from "./redux/features/handleRingData";
import { postRingData } from "./api/fetchDb";
import  Geolocation  from './components/GeoLocation';
import Camera from "./components/Camera";
import { saveAs } from 'file-saver';
import * as THREE from 'three';

// オブジェクトの最後のn個のリングデータを直接取得する関数(非推奨)
// TODO 仮定義なので、APIの方でリングデータが0～71個に限定されていることを確認次第、削除する
function getLastRings(obj: RingsData, lastAmount: number): RingsData{
  const keys: string[] = Object.keys(obj);
  const lastKeys: string[] = keys.slice(-lastAmount); // オブジェクトの最後のn個のキーを取得

  const result: RingsData = {};
  for (const key of lastKeys) {
    result[key] = obj[key]; // キーを使用してプロパティを抽出
  }

  return result;
}

// 過去周のDEI周を切り捨てる関数
// TODO 仮定義なので、APIの方でリングデータが0～71個に限定されていることを確認次第、削除する
function getLatestLap(data: RingsData): RingsData{
  const orbitLength: number = positionArray.length; // DEI一周に必要なリングの数
  const ringAmount: number = Object.keys(data).length; // リングデータの数
  let result: RingsData = {}; // 0～71個のリングデータ
  if(ringAmount <= orbitLength){
    // リングが0～71個の場合
    result = Object.assign({}, data);
  }else{
    // リングが71個より多い場合
    const latestLapLength: number = ringAmount % orbitLength; // 最新のDEI周が何個のリングでできているか
    if(latestLapLength === 0){
      // リング個数が71の倍数のとき
      result = getLastRings(data, 71);
    }else{
      result = getLastRings(data, latestLapLength);
    }
  }
  return result;
}

function App() {
 // サーバーから取得したリングデータを管理するcontext
  const {
    ringsData,
    latestRing
  } = useContext(DbContext);

  const [usedOrbitIndexes, setUsedOrbitIndexes] = useState<number[]>([]); // リングが既に埋まっている軌道内位置のデータ

  // リングデータをサーバーに送信する際に必要な情報を管理するstate
  const [location, setLocation] = useState<string | null>(null); // 現在値
  const [locationJp, setLocationJp] = useState<string | null>(null); // 現在地(和名)
  const [currentLatitude, setCurrentLatitude] = useState<number | null>(null); // 現在地の緯度
  const [currentLongitude, setCurrentLongitude] = useState<number | null>(null); // 現在地の経度

  const dispatch = useDispatch<AppDispatch>();

  // リングの初期表示を行う
  useEffect(() => {
    initializeRingDraw();
  }, [ringsData])


  // 現在のリングのデータ(ringsData)で、3Dオブジェクトを初期化する関数
  function initializeRingDraw(): void{
    dispatch(resetHandle()); // 全3Dを消去する
    setUsedOrbitIndexes([]);

    const extractedRingData: RingsData = getLatestLap(ringsData); // リングデータを71個までに限定して切り出す(一応)

    // 3Dオブジェクトの初期表示を行う
    Object.entries(extractedRingData).forEach(([_key, value]) => {
      // リングデータを使用して、3Dオブジェクトを1つ作成する
      const newTorus: TorusInfo = convertToTorus(value);
      dispatch(pushTorusInfo(newTorus)); //リング情報をオブジェクトに詰め込みstoreへ送る

      setUsedOrbitIndexes((prev) => [...prev, value.orbitIndex]); // 使用済みの軌道番号として保管する
    });
  }

  // リングの3Dオブジェクトを追加する関数
  const addTorus = () => { 
    let rX: number;//回転x軸
    let rY: number;//回転y軸
    let torusScale: number = 0.08;//torusの大きさ
    let newOrbitIndex: number = -1;
    const color = 0xffffff * Math.random();
    let positionWithIndex: RingPositionWithIndex | null = null;
    let randomPosition: RingPosition | null = null; // ランダムなリング位置
    const orbitLength: number = positionArray.length; // DEI一周に必要なリングの数
    let newOrbitIndexes: number[] = usedOrbitIndexes.slice(); // 使用済みのリング軌道内位置

    // 既に全てのリングが埋まっている場合
    if (newOrbitIndexes.length >= orbitLength) {
      // 描画とリング軌道内位置の空き情報を初期化する
      dispatch(resetHandle());
      newOrbitIndexes = [];
    }

    // DEI軌道の中から、空いているリングの位置をランダムに取得する
    // console.log("現在埋まっているリング位置:\n", newOrbitIndexes);
    positionWithIndex = getRandomPositionExceptIndexes(positionArray, newOrbitIndexes); 
    if(positionWithIndex){
      randomPosition = positionWithIndex.ringPosition;
      newOrbitIndex = positionWithIndex.index;
    }else{
      throw new Error("DEI軌道のリングが全て埋まっているのに、リングを追加しようとしました");
    }

    // リングの角度を求める
    // 軌道設定配列のindexが偶数と奇数で分ける
    if (newOrbitIndex % 2 == 0) {                   //偶数の時の角度
      rX = Math.floor(Math.random());
      rY = Math.floor(Math.random());
    } else {                              //奇数の時の角度
      rX = Math.floor(Math.random() * 2); 
      rY = Math.floor(Math.random() * 5);
    }

    //リング情報をオブジェクトに詰め込みstoreへ送る
    const newTorus: TorusInfo = {
      id: uuidv4(),
      color: color,
      rotateX: rX,
      rotateY: rY,
      positionX: randomPosition.positionX,
      positionY: randomPosition.positionY,
      scale: torusScale,
    };
    dispatch(pushTorusInfo(newTorus));

    newOrbitIndexes.push(newOrbitIndex);

    // サーバーにリングのデータを追加する
    const newRingData: RingData = {
      location: location ?? "", // 撮影場所
      locationJp: locationJp ?? "", // 撮影場所日本語
      latitude: currentLatitude ?? 0, // 撮影地点の緯度
      longitude: currentLongitude ?? 0, // 撮影地点の経度
      userIp: ip, // IPアドレス
      ringCount: (latestRing?.ringCount ?? 0) + 1, // リング数
      orbitIndex: newOrbitIndex, // リング軌道内の順番(DEI中の何個目か、0~70)
      rotateX: rX, // リング角度(右手親指)
      rotateY: rY, // リング角度(右手人差し指)
      positionX: randomPosition.positionX, // リング位置(横方向)
      positionY: randomPosition.positionY, // リング位置(縦方向)
      ringColor: color, // リング色
      scale: torusScale, //リングの大きさ
      creationDate:  new Date().getTime() // 撮影日時
    };
    postRingData(newRingData);
    console.log("サーバーにデータを送信しました:\n", newRingData);

    // stateを更新する
    setUsedOrbitIndexes(newOrbitIndexes);
  };


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
    console.error("There was an error fetching the IP address:", error);
  }
  return result; 
}

// アクティブなIPアドレスと前回登録したIPアドレスを比較した結果をipFlagにセット
useEffect(() => {
  compareCurrentIPWithLastIP().then(result => {
    setIpFlag(result);
  });
}, []);
console.log(`ipFlag : ${ipFlag}`);


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
    geoJSONData.features.forEach((feature, _index) => {

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
        // console.log(`Feature ${index + 1} is within ${RADIUS} meters of your current location.`);
      } else {
        // console.log(`Feature ${index + 1} is ${distance} meters away from your current location.`);

      }
    })
  } catch (error) {
    console.error("Error fetching GeoJSON Point data or getting current location:", error);
  }
  return result; 
}




// const videoRef = useRef<HTMLVideoElement>(null);
const canvasRef = useRef<HTMLCanvasElement>(null);
const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

useEffect(() => {
  if (canvasRef.current) {
    rendererRef.current = new THREE.WebGLRenderer({ canvas: canvasRef.current, preserveDrawingBuffer: true });
  }
}, []);

const captureImage = () => {
  if (rendererRef.current) {
    const dataURL = rendererRef.current.domElement.toDataURL('image/png');
    console.log(dataURL);
    saveImage(dataURL);
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



  return(
    <div className="Test">
        <h1>カメラアクセス</h1>
        <Camera />
        <div id='canvas'>
          <Canvas
          onCreated={({ gl }) => {
            gl.setClearColor(0xFF0000, 0);
            gl.autoClear = false;
            gl.clearDepth()
          }}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0,0,10] }}
          ref={canvasRef}>
              <TorusList />
              <OrbitControls/>
          </Canvas>

          <button onClick={captureImage} style={{position: "absolute", top: "80%", left: "50%", height: "2rem", zIndex: 1000}}>Capture</button>

          {/* <button onClick={addTorus}>追加</button> */}
          {/* <Geolocation_test setPosition={setPosition} /> */}
        </div>

        <h1>GPSアクセス</h1>
        <Geolocation />
        <h1>IPアドレス</h1>

    </div>
 


  );
}
export default App;
