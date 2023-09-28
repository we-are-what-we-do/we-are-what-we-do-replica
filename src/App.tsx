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
    // latestRing,
    // toriData,
    // usedOrbitIndexes,
    // initializeRingData,
    // addTorusData
  } = useContext(DbContext);

  const [usedOrbitIndexes, setUsedOrbitIndexes] = useState<number[]>([]); // リングが既に埋まっている軌道内位置のデータ


  let shufflePosition: RingPosition[];//シャッフル後の全てのリングpositionを格納
  let randomPosition: RingPosition | undefined; //配列から取り出したリング

  const [ringCount, setRingCount] = useState<number>(0);

  const dispatch = useDispatch<AppDispatch>();

  // リングの初期表示を行う
  useEffect(() => {
    initializeRingDraw();
  }, [ringsData])

  // 現在のリングのデータ(ringsData)で、3Dオブジェクトを初期化する関数
  function initializeRingDraw(): void{
    dispatch(resetHandle()); // 全3Dを消去する
    const extractedRingData: RingsData = getLatestLap(ringsData); // リングデータを71個までに限定して切り出す(一応)

    // 3Dオブジェクトの初期表示を行う
    Object.entries(extractedRingData).forEach(([_key, value], index) => {
      // リングデータを使用して、3Dオブジェクトを1つ作成する
      const newTorus: TorusInfo = convertToTorus(value);
      dispatch(pushTorusInfo(newTorus)); //リング情報をオブジェクトに詰め込みstoreへ送る

      setRingCount((prev) => prev + 1); // リング数を1増やす
      setUsedOrbitIndexes((prev) => [...prev, index]); // 使用済みの軌道番号として保管する
    });
  }

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

  // リングの3Dオブジェクトを追加する関数
  const addTorus = () => { 
    let rX: number;//回転x軸
    let rY: number;//回転y軸
    let torusScale: number = 0.08;//torusの大きさ
    let num = ringCount;
    const color = 0xffffff * Math.random();
    
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
    </div>

  );
}
export default App;
