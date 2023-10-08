import "./App.css";
import { useContext, useEffect, useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import TorusList from './components/TorusList';
import { getLocationConfig, postNftImage, postRingData } from './api/fetchDb';
import { FeatureCollection, Point } from 'geojson';
import { haversineDistance } from './api/distanceCalculations';
import LocationDataProvider from "./providers/LocationDataProvider";
import Camera from "./components/Camera";
import { ToastContainer } from 'react-toastify';
import {showErrorToast, showInfoToast, showConfirmToast} from "./components/ToastHelpers"
import 'react-toastify/dist/ReactToastify.css';
import { CaptureContext } from "./providers/CaptureProvider";
import { CameraContext } from "./providers/CameraProvider";
import { DbContext } from "./providers/DbProvider";
import { RingContext } from "./providers/RingProvider";
import { RingData } from "./redux/features/handleRingData";
import { positionArray } from "./torusPosition";


export default function App() {
    // サーバーから取得したリングデータを管理するcontext
    const {
      latestRing,
      setLatestRing
  } = useContext(DbContext);

  // リングのデータを追加するためのcontext
  const {
    getRingDataToAdd,
    setCurrentIp,
    setCurrentLatitude,
    setCurrentLongitude,
    setLocation,
    setLocationJp,
    addTorus,
    usedOrbitIndexes,
    setUsedOrbitIndexes
  } = useContext(RingContext);

  // アウトカメラ/インカメラを切り替えるためのcontext
  const {
    videoRef,
    switchCameraFacing
  } = useContext(CameraContext);

  // 写真撮影(リング+カメラ)のためのcontext
  const {
    captureImage,
    saveImage,
    canvasRef
  } = useContext(CaptureContext);

  // 既にリングを追加したかどうかを管理するref
  const hasPostRing = useRef<boolean>(false);

  // 3Dの視点移動(OrbitControl)が有効かどうかを管理するstate
  const [enableOrbitControl, setEnableOrbitControl] = useState<boolean>(true);


  // 初回レンダリング時、案内を送信する
  useEffect(() => {
    // 「ARリングを増やしましょう。」というメッセージボックスを表示する
    showInfoToast("I003");
  }, []);


  // 撮影ボタンを押したときの処理
  async function handleTakePhotoButton(): Promise<void>{
    // 撮影する写真に確認を取る
    if(hasPostRing.current) console.log("2回目以降の撮影を行います\n(リングデータの送信は行いません)");
    videoRef.current?.pause(); // カメラを一時停止する
    setEnableOrbitControl(false); // 3Dの視点を固定する

    // 写真(リング+カメラ)を撮影をして、base64形式で取得する
    const newImage: string | null = captureImage();

    // 撮影した写真に確認を取る
    const isPhotoOk: boolean = await showConfirmToast(); // 「撮影画像はこちらでよいですか」というメッセージボックスを表示する

    if(isPhotoOk){
      // 撮影した写真に承諾が取れたら、サーバーにリングを送信する
      try{
        // 描画に追加したリングのデータを取得する
        const addedRingData: RingData | null = getRingDataToAdd();

        // エラーハンドリング
        if(!addedRingData) throw new Error("追加したリングデータを取得できませんでした");
        if(!newImage) throw new Error("写真を撮影できませんでした");

        // リングデータを送信する
        // if((hasPostRing.current) || (!Boolean(ipFlag))){
        if(hasPostRing.current){ // TODO 後で条件を修正し、連続撮影を防ぐ
          // 連続撮影になる場合
          // あるいは既にリングデータを送信済みの場合
          // 写真ダウンロードのみ行う
          if(hasPostRing.current) console.log("既にリングデータをサーバーに送信済みです");
          if(!Boolean(ipFlag)) console.log("連続撮影はできません");
          showInfoToast("I002"); // 「連続撮影はできません。」というメッセージボックスを表示する
        }else{
          // リングデータをまだ送信していない場合、リングデータを送信する
          await postRingData(addedRingData); //サーバーにリングデータを送信する
          await postNftImage(newImage); // base64形式の画像をサーバーに送信する
          console.log("サーバーにデータを送信しました:\n", addedRingData);

          hasPostRing.current = true; // リングデータを送信済みとしてstateを更新する

          // 「ARリングの生成に成功しました。」というメッセージボックスを表示する
          showInfoToast("I005");
        };

        // 撮影した写真をダウンロードする
        saveImage(newImage);
      }catch(error){
        // サーバーにリングデータを送信できなかった際のエラーハンドリング
        console.error("サーバーにデータを送信できませんでした\n以下の可能性があります\n- 送信しようとしたリングデータがコンフリクトを起こした\n- サーバーにアクセスできない", error);
        showErrorToast("E099"); // 「しばらく待ってから再度お試しください。」というメッセージボックスを表示する
        location.reload(); //ページをリロードする
      }
    }else{
      // 再撮影を望む場合、処理を止める
      console.log("撮影やり直しのために処理を中断しました");
    }

    videoRef.current?.play(); // カメラを再生する
    setEnableOrbitControl(true); // 3Dの視点固定を解除する
  }


  // サーバーにリングを追加する処理(テスト用)
  async function testAddRing(): Promise<void>{
    let addedRingData: RingData | null = null;
    if(hasPostRing.current){
      // 初期追加のリングを送信済みの場合
      // リングを追加して描画する
      const newTorus = addTorus(usedOrbitIndexes);

      // 描画に追加したリングのデータを取得する
      addedRingData = getRingDataToAdd(newTorus);
      if(addedRingData === null){
        // リング描画を既に追加してしまっていて後に戻れないため、エラーを投げる(console.errorではダメ)
        throw new Error("追加するリングデータを取得できませんでした");
      };

      setUsedOrbitIndexes((prev) => [...prev, addedRingData!.orbitIndex]);
    }else{
      // まだ初期追加のリングを送信していない場合
      // 既に描画に追加したリングのデータを取得する
      addedRingData = getRingDataToAdd();
      if(!addedRingData){
        console.error("追加したリングデータを取得できませんでした");
        return;
      };

      hasPostRing.current = true; // リングデータを送信済みとしてstateを更新する
    };

    //サーバーにリングデータを送信する
    await postRingData(addedRingData);
    console.log("サーバーにデータを送信しました:\n", addedRingData);

    // テスト用のstate更新
    setLatestRing(addedRingData);
  }


  // // // // // // // // // // // // // // // // // // // // // // 
  // compareCurrentIPWithLastIP
  // アクティブなIPアドレスと前回登録したIPアドレスを比較
  // // // // // // // // // // // // // // // // // // // // // // 

  // ipFlag
  const [ipFlag, setIpFlag] = useState<number>(0);

  async function compareCurrentIPWithLastIP() : Promise<number> {
    // ipFlagの戻り値 デフォルト0
    let result = 0;
    
    try {
      // 現在のIPアドレスを取得
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      const currentIP: string = data.ip;
      setCurrentIp(currentIP); // useStateで現在のipを保管する
      console.log(`Your current IP is: ${currentIP}`);

      // 前回登録時のIPアドレスを取得
      const lastIP: string | null = latestRing?.userIp ?? null;
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
    // gpsFlagの戻り値 デフォルト0
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

    // GPSがピンの範囲外の場合、「ARリングはピン設置箇所の近くでのみ表示されます。」というメッセージボックスを表示する
    if(!Boolean(result)){
      showErrorToast("E001");
    };

    return result;
  }

  // GeoJSON Pointデータと現在地の比較を実行した結果をgpsFlagにセット
  useEffect(() => {
    compareCurrentLocationWithPin().then(result => {
      setGpsFlag(result);
      console.log(`gpsFlag : ${result}`);
    });
  }, []);


  return(
    <LocationDataProvider> 
      {errorMessage && (
        <div className="error-message-box">
          {errorMessage}
        </div>
      )}
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
      <button
        onClick={handleTakePhotoButton}
        style={{
          position: "absolute",
          top: "80%",
          left: "50%",
          height: "2rem"
        }}
      >
        撮影
      </button>
      <button
        onClick={switchCameraFacing}
        style={{
          position: "absolute",
          top: "80%",
          left: "70%",
          height: "2rem"
        }}
      >
        カメラ切り替え
      </button>
      <button
        onClick={testAddRing}
        style={{
          position: "absolute",
          top: "90%",
          left: "50%",
          height: "2rem"
        }}
      >
        リング追加(テスト用)
      </button>
      <button
        onClick={() => {
          fetch("https://wawwdtestdb-default-rtdb.firebaseio.com/rings.json", {
            method: 'DELETE'
          });
          location.reload();
        }}
        style={{
          position: "absolute",
          top: "90%",
          left: "70%",
          height: "2rem"
        }}
      >
        リングデータ削除(テスト用)
      </button>
      <button
        onClick={() => setEnableOrbitControl((prev) => !prev)}
        style={{
          position: "absolute",
          top: "80%",
          left: "40%",
          height: "2rem"
        }}
      >
        視点固定切り替え
      </button>
      <span style={{position: "absolute", top: "90%"}}>リング数: {usedOrbitIndexes.length}/{positionArray.length}</span>
      <ToastContainer />
    </LocationDataProvider>
  );
}