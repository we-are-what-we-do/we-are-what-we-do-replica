import "./App.css";
import { useContext, useEffect, useState } from "react";
import { OrbitControls, Text } from "@react-three/drei";
import { Canvas } from '@react-three/fiber';
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import { TorusInfo, pushTorusInfo, resetHandle } from "./redux/features/torusInfo-slice";
import { v4 as uuidv4 } from 'uuid';
import { RingPosition, positionArray } from "./torusPosition";
import TorusList from './components/TorusList';
import { DbContext } from "./providers/DbProvider";
import { RingData, RingPositionWithIndex, RingsData, convertToTorus, getRandomPositionExceptIndexes } from "./redux/features/handleRingData";
import { postRingData } from "./api/fetchDb";


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
    result = getLastRings(data, latestLapLength);
  }
  return result;
}


function App() {
  const {
    ringsData,
    latestRing,
    // toriData,
    // usedOrbitIndexes,
    // initializeRingData,
    // addTorusData
  } = useContext(DbContext);

  const [usedOrbitIndexes, setUsedOrbitIndexes] = useState<number[]>([]); // リングが既に埋まっている軌道内位置のデータ
  const [ringCount, setRingCount] = useState<number>(0); // DEI軌道内のリング数(0～71)

  const dispatch = useDispatch<AppDispatch>();

  // リングの初期表示を行う
  useEffect(() => {
    initializeRingDraw();
  }, [ringsData])

  // 現在のリングのデータ(ringsData)で、3Dオブジェクトを初期化する関数
  function initializeRingDraw(): void{
    dispatch(resetHandle()); // 全3Dを消去する
    setRingCount(0);
    setUsedOrbitIndexes([]);

    const extractedRingData: RingsData = getLatestLap(ringsData); // リングデータを71個までに限定して切り出す(一応)

    // 3Dオブジェクトの初期表示を行う
    Object.entries(extractedRingData).forEach(([_key, value]) => {
      // リングデータを使用して、3Dオブジェクトを1つ作成する
      const newTorus: TorusInfo = convertToTorus(value);
      dispatch(pushTorusInfo(newTorus)); //リング情報をオブジェクトに詰め込みstoreへ送る

      setRingCount((prev) => prev + 1); // リング数を1増やす
      setUsedOrbitIndexes((prev) => [...prev, value.orbitIndex]); // 使用済みの軌道番号として保管する
    });
  }

  // リングの3Dオブジェクトを追加する関数
  const addTorus = () => { 
    let rX: number;//回転x軸
    let rY: number;//回転y軸
    let torusScale: number = 0.08;//torusの大きさ
    let num: number = ringCount;
    let newOrbitIndex: number = -1;
    const color = 0xffffff * Math.random();
    let positionWithIndex: RingPositionWithIndex | null = null;
    let randomPosition: RingPosition | null = null; // ランダムなリング位置
    const orbitLength: number = positionArray.length; // DEI一周に必要なリングの数
    let newOrbitIndexes: number[] = usedOrbitIndexes.slice(); // 使用済みのリング軌道内位置

    // リングの角度を求める
    if (num % 2 == 0) {                   //偶数の時の角度
      rX = Math.floor(Math.random());
      rY = Math.floor(Math.random());
    } else {                              //奇数の時の角度
      rX = Math.floor(Math.random() * 2); 
      rY = Math.floor(Math.random() * 5);
    }

    // 既に全てのリングが埋まっている場合
    if (num >= orbitLength) {
      // 描画とリング軌道内位置の空き情報を初期化する
      dispatch(resetHandle());
      newOrbitIndexes = [];
      num = 0;
    }

    // DEI軌道の中から、空いているリングの位置をランダムに取得する
    console.log(newOrbitIndexes);
    positionWithIndex = getRandomPositionExceptIndexes(positionArray, newOrbitIndexes); 
    if(positionWithIndex){
      randomPosition = positionWithIndex.ringPosition;
      newOrbitIndex = positionWithIndex.index;
    }else{
      throw new Error("DEI軌道のリングが全て埋まっているのに、リングを追加しようとしました");
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

    num++;
    newOrbitIndexes.push(newOrbitIndex);

    // サーバーにリングのデータを追加する
    const newRingData: RingData = {
      location: "anywhere", // 撮影場所
      locationJp: "どこか", // 撮影場所日本語
      latitude: 0, // 撮影地点の緯度
      longitude: 0, // 撮影地点の経度
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

    // stateを更新する
    setRingCount(num);
    setUsedOrbitIndexes(newOrbitIndexes);
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
      <button
        /* TODO いらなくなったらこのbuttonごと消す */
        style={{
          marginTop: "2rem"
        }}
        onClick={() => {
          fetch("https://wawwdtestdb-default-rtdb.firebaseio.com/api/ring-data.json", {
            method: 'DELETE'
          });
        }}
      >
        サーバーデータ削除
      </button>
      <button style={{marginTop: "4rem"}}>リング数: {ringCount}</button>
    </div>

  );
}
export default App;
