import "./App.css";
import TorusList from './components/TorusList';
import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import { Ring, positionArray } from "./torusPosition";
import { AppDispatch } from "./redux/store";
import { useDispatch } from "react-redux";
import { pushTorusInfo, resetHandle } from "./redux/features/torusInfo-slice";
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from 'react';
// import  Geolocation_test  from './components/GeoLocation_test';
import { getLocationConfig } from './api/fetchDb';
import { FeatureCollection, Point } from 'geojson';
import { haversineDistance } from './api/distanceCalculations';
import { LocationDataProvider } from './providers/LocationDataProvider';

function App() {
  let torusScale     : number;
  let shufflePosition: Ring[];
  let randomPosition : Ring | undefined;
  let num = 0;

  const dispatch = useDispatch<AppDispatch>();

  //配列内をシャッフルする
  function shuffleArray(sourcceArray: Ring[]) {
    const array = sourcceArray.concat();
    const arrayLength = array.length;

    for (let i = arrayLength - 1; i >= 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
  }
  shufflePosition = shuffleArray(positionArray);


  //写真をとったら（仮clickアクション）
  function addTorus() { 
    console.log(num + 1);
    
    torusScale = 0.08;
    const color = `hsl(${Math.floor(Math.random() * 361)}, 100%, 50%)`;

    randomPosition = shufflePosition[num];

    if (num == 70) {
      console.log("reset");
      dispatch(resetHandle());
      shufflePosition = shuffleArray(positionArray);
      num = 0;
      randomPosition = shufflePosition[num];
    } 

    //リング情報をstoreへ送る
    dispatch(pushTorusInfo(
      {
        id:        uuidv4(),
        color:     color,
        rotateX:   randomPosition.rotateX,
        rotateY:   randomPosition.rotateY,
        positionX: randomPosition.positionX, 
        positionY: randomPosition.positionY,
        scale:     torusScale,
      }
    ));
    num++;
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

    console.log(`Your latitude is: ${currentLat}`);
    console.log(`Your longitude is: ${currentLon}`);

    // ピンの位置情報を取得
    const geoJSONData: FeatureCollection<Point> = await getLocationConfig();

    // 各ピンの位置と現在地との距離をチェック
    for (const feature of geoJSONData.features) {
      const [longitude, latitude] = feature.geometry.coordinates;
      const distance = haversineDistance(currentLat, currentLon, latitude, longitude);
      console.log(`Location is: ${feature.properties.location}`);
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
  });
}, []);
console.log(`gpsFlag : ${gpsFlag}`);

  return(
    <LocationDataProvider> 
      {errorMessage && (
        <div className="error-message-box">
          {errorMessage}
        </div>
      )}
      <div id='canvas'>
        <Canvas camera={{ position: [0,0,10] }}>
        <color attach="background" args={[0xff000000]} /> {/*背景色*/}
            <TorusList />
            <OrbitControls/>
        </Canvas>
        <button onClick={addTorus}>追加</button>
        {/* <Geolocation_test setPosition={setPosition} /> */}
      </div>
    </LocationDataProvider>
  );
}
export default App;