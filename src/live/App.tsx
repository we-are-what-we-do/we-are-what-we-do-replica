import "./App.css";
import { useContext, useEffect, useRef, useState } from "react";
import { Canvas } from '@react-three/fiber';
import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux/store";
import { TorusInfo, pushTorusInfo, resetHandle } from "./../redux/features/torusInfo-slice";
import { getUpdateTime } from "./redux/features/updateTime-slice";
import TorusList from './components/TorusList';
import DisplayInfo from "./components/DisplayInfo";
import { RingsData, convertToTorus } from "../handleRingData";
import { DbContext, getLatestLap } from "./../providers/DbProvider";
import { FeatureCollection, Point } from "geojson";
import { getLocationConfig, getLocationJp, getRingData } from "../api/fetchDb";


function App() {
  // サーバーから取得したリングデータを管理するcontext
  const {
    ringsData,
    latestRing,
    initializeRingData
  } = useContext(DbContext);

  const dispatch = useDispatch<AppDispatch>();

  // リングの表示を行う
  useEffect(() => {
    initializeRingDraw();
  }, [ringsData]);

  const [ringCount, setRingCount] = useState<number>(0);
  useEffect(() => {
      // データ更新時、全データを取得し、リング数を取得する
      getRingData().then((ringsData) => {
          const newRingCount: number = Object.keys(ringsData).length;
          setRingCount(newRingCount);
      })
  }, [ringsData]);

  // 最終更新日の表示を行う
  useEffect(() => {
    initializeLatestRing();
  }, [latestRing])

  // GeoLocationを取得する
  const geoJsonRef = useRef<FeatureCollection<Point> | null>(null); // GeoJSONデータ
  useEffect(() => {
    getLocationConfig().then((data) => {
      geoJsonRef.current = data;
    })
  }, []);

  // 最終更新場所を更新する
  const [latestLocationJp, setLatestLocationJp] = useState<string | null>(null);
  useEffect(() => {
    const geoData = geoJsonRef.current;
    if(!geoData) return;
    if(!latestRing) return;
    const newLatestLocationJp: string | null = getLocationJp(geoData, latestRing.location);
    setLatestLocationJp(newLatestLocationJp);
  }, [latestRing]);

  // 一定時間おきにサーバーからデータを取得し、リング表示を初期化する
  useEffect(() => {
    initializeRingData();
    const intervalTime: number = 1000 * 60 * 1; // 1分置きに更新する
    const intervalFunc = setInterval(() => {
        initializeRingData();
        // console.log("リングデータを更新しました")
    }, intervalTime);
    return () => clearInterval(intervalFunc);
}, []);
  
  // 現在のリングのデータ(ringsData)で、3Dオブジェクトを初期化する関数
  function initializeRingDraw(): void{
    dispatch(resetHandle()); // 全3Dを消去する

    const extractedRingData: RingsData = getLatestLap(ringsData); // リングデータを70個までに限定して切り出す(一応)

    // 3Dオブジェクトの初期表示を行う
    Object.values(extractedRingData).forEach((value) => {
      // リングデータを使用して、3Dオブジェクトを1つ作成する
      const newTorus: TorusInfo = convertToTorus(value);
      dispatch(pushTorusInfo(newTorus)); //リング情報をオブジェクトに詰め込みstoreへ送る
    });
  };

  // 最終更新日時の情報を初期化する関数
  function initializeLatestRing(): void{
    //最終更新日時の情報をstoreへ送る
    const date         = new Date(latestRing?.created_at ?? 0);
    const year         = date.getFullYear();
    const month        = date.getMonth() + 1;
    const day          = date.getDate();
    const hour         = date.getHours().toString().padStart(2, "0");
    const minute       = date.getMinutes().toString().padStart(2, "0");
    // const second       = date.getSeconds().toString().padStart(2, "0");

    // dispatch(getUpdateTime(`${year}/${month}/${day} ${hour}:${minute}:${second}`));
    dispatch(getUpdateTime(`${year}/${month}/${day} ${hour}:${minute}`));
  };

  return(
    <div className='canvas'>
      <Canvas camera={{ position: [0,0,8] }} >
        <color attach="background" args={[0xff000000]} /> {/*背景色*/}
          <ambientLight intensity={1} />
          <directionalLight intensity={1.5} position={[1,1,1]} />
          <directionalLight intensity={1.5} position={[1,1,-1]} />
          <pointLight intensity={1} position={[1,1,5]}/>
          <pointLight intensity={1} position={[1,1,-5]}/>
        <TorusList />
      </Canvas>
      <DisplayInfo ringCount={ringCount} latestLocationJp={latestLocationJp} />
    </div>
  );
}
export default App;