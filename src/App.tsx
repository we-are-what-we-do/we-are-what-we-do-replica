import "./App.css";
import { OrbitControls, Text } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import { pushTorusInfo, resetHandle } from "./redux/features/torusInfo-slice";
import { v4 as uuidv4 } from 'uuid';
import { RingPosition, positionArray } from "./torusPosition";
import TorusList from './components/TorusList';
import { useEffect, useState } from 'react';
import  Geolocation_test  from './components/GeoLocation_test';
import { getLocationConfig } from './api/fetchDb';
import { FeatureCollection, Point } from 'geojson';
import { haversineDistance } from './api/distanceCalculations';

function App() {
  let rX: number;//回転x軸
  let rY: number;//回転y軸
  let torusScale: number;//torusの大きさ

  let shufflePosition: RingPosition[];//シャッフル後の全てのリングpositionを格納
  let randomPosition: RingPosition | undefined; //配列から取り出したリング

  let num = 0;

  const dispatch = useDispatch<AppDispatch>();

  //配列の中をシャッフルする
  function shuffleArray(sourceArray: RingPosition[]) {
    const array = sourceArray.concat();
    const arrayLength = array.length;

    for (let i = arrayLength - 1; i >= 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));
        [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
    }
    return array;
  }
  shufflePosition = shuffleArray(positionArray);


  const addTorus = () => { 
    const color = 0xffffff * Math.random();
    torusScale = 0.08;
    randomPosition = shufflePosition.pop();
    
    if (num % 2 == 0) {                   //偶数の時の角度
      rX = Math.floor(Math.random());
      rY = Math.floor(Math.random());
    } else {                              //奇数の時の角度
      rX = Math.floor(Math.random() * 2); 
      rY = Math.floor(Math.random() * 5);
    }

    //配列内シャッフルして最後から取り出していく
    if (num == 71) {
      dispatch(resetHandle());
      shufflePosition = shuffleArray(positionArray);
      randomPosition = shufflePosition.pop();
      num = 0;
    }

    //リング情報をオブジェクトに詰め込みstoreへ送る
    dispatch(pushTorusInfo(
      {
        id: uuidv4(),
        color: color,
        rotateX: rX,
        rotateY: rY,
        positionX: randomPosition?.positionX,
        positionY: randomPosition?.positionY,
        scale: torusScale, 
      }
    ));
    num++;
  };

  const [ip, setIp] = useState<string>("");

  useEffect(() => {
    fetch('https://api.ipify.org?format=json') // 外部APIを使って公開IPアドレスを取得
      .then(response => response.json())
      .then(data => {
        setIp(data.ip);
        console.log(`Your IP is: ${data.ip}`);
      })
      .catch(error => {
        console.error("There was an error fetching the IP address:", error);
      });
  }, []);



  // //現在地とピンに設定された緯度経度を比較
  // async function fetchGeoJSONPointData() {
  //   //現在地の緯度経度を取得
  //   const setPosition = (latitude: number, longitude: number) => {
  //     console.log(`Your latitude is: ${latitude}`);
  //     console.log(`Your longitude is: ${longitude}`);
  //   };

  //   //ピンに設定された緯度経度を取得
  //   try {
  //     const geoJSONData: FeatureCollection<Point> = await getLocationConfig();
  //     // console.log(geoJSONData);　// 取得したデータをコンソールに出力
  //     // FeatureCollectionの中の各Featureの緯度と経度をコンソールに出力
  //     geoJSONData.features.forEach((feature, index) => {
  //       const [longitude, latitude] = feature.geometry.coordinates;
  //       console.log(`Feature ${index + 1}: Latitude: ${latitude}, Longitude: ${longitude}`);
  //     });
  
  //     // 現在地と比較

  
  //   } catch (error) {
  //     console.error("Error fetching GeoJSON Point data:", error);
  //   }
  // }
  // // GeoJSON Pointデータを取得
  // fetchGeoJSONPointData();



// 環境変数(REACT_APP_RADIUS)から半径の値を取得 
// 環境変数が数値でない、または設定されていない場合はデフォルト値として 1000m を使用
// const RADIUS = process.env.REACT_APP_RADIUS ? parseInt(process.env.REACT_APP_RADIUS) : 1000;
const RADIUS = 1000;

// 現在地の取得とピンの位置を比較する関数
async function fetchGeoJSONPointData() {
  // 現在地の緯度経度を取得するPromiseを返す関数
  const getCurrentLocation = (): Promise<[number, number]> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
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
    geoJSONData.features.forEach((feature, index) => {
      const [longitude, latitude] = feature.geometry.coordinates;
      const distance = haversineDistance(currentLat, currentLon, latitude, longitude);

      if (distance <= RADIUS) {
        console.log(`Feature ${index + 1} is within ${RADIUS} meters of your current location.`);
      } else {
        console.log(`Feature ${index + 1} is ${distance} meters away from your current location.`);
      }
    });
  } catch (error) {
    console.error("Error fetching GeoJSON Point data or getting current location:", error);
  }
}

// GeoJSON Pointデータと現在地の比較を実行
fetchGeoJSONPointData();



  return(
    <div id='canvas'>
      <Canvas camera={{ position: [0,0,10] }}>
          <TorusList />
          <axesHelper scale={10}/>
          <OrbitControls/>
          <Text position={[0, 5, 0]} >
            React Three Fiber
          </Text>
      </Canvas>
      <button onClick={addTorus}>追加</button>
      {/* <Geolocation_test setPosition={setPosition} /> */}
    </div>

  );
}
export default App;