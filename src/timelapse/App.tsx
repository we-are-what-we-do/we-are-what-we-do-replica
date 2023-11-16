import "./App.css";
import { useEffect, useRef, useState } from "react";
import { Canvas } from '@react-three/fiber';
import TorusList from './TorusList';
import DisplayInfo from "./DisplayInfo";
import { RingData } from "../types";
import { FeatureCollection, Point } from "geojson";
import { getAllRingData, getLocationConfig } from "../api/fetchDb";
import { useKey } from "rooks";
import Utilities from "./Utilities";


export default function App(){
    /* stateやref */
    // リングデータを管理するstate
    const [allRings, setAllRings] = useState<RingData[][] | null>(null); // 全リングデータ
    const [drawingRings, setDrawingRings] = useState<RingData[]>([]); // 描画中のリング周
    const [targetIndexes, setTargetIndexes] = useState<[number, number]>([0, 0]); // 描画上の最新リングが、全リングデータのどこのindexを参照しているか

    // ロケーションデータを管理するref
    const locationsData = useRef<FeatureCollection<Point> | null>(null); // ロケーション設定のGeoJSONデータ

    // タイムラプス再生設定を管理するstate
    const [uiVisible, setUiVisible] = useState<boolean>(true);
    const [playbackSpeed, setPlaybackSpeed] = useState<string>("1"); // タイムラプスの再生速度
    const [enableMovingTorus, setEnableMovingTorus] = useState<boolean>(false); // リングのアニメーションを有効にするかどうか
    const [backgroundImageVisible, setBackgroundImageVisible] = useState<boolean>(true); // 背景を表示するかどうか
    const [backgroundImagePath, setBackgroundImagePath] = useState<string | null>(null); // 背景画像のパス

    /* useState */
    // リングデータとロケーションデータを取得する
    useEffect(() => {
        (async() => {
            const newAllRings: RingData[][] = await getAllRingData();
            setAllRings(newAllRings);

            const newLocations: FeatureCollection<Point> = await getLocationConfig();
            locationsData.current = newLocations;

            console.log("データの取得が完了しました");
        })();
    }, []);

    // キーボードにイベントを割り当てる
    useKey(["Space"], playTimeLapse); // Spaceキーでタイムラプスを再生するよう設定
    useKey(["Shift"], toggleUiVisible); // CtrlキーでUIの表示/非表示を切り替えるよう設定



    /* functions */
    // タイムラプスの再生を開始する関数
    async function playTimeLapse(){
        // データをサーバーから取得できていない場合、処理を中止する
        if(!allRings || !locationsData.current){
            console.log("データの取得待ちです");
            return;
        }

        // 開始を告げるメッセージをコンソールに出力する
        const firstRing: RingData = allRings[0][0];
        const firstDate: Date = new Date(firstRing.created_at);
        const firstTime: string = convertTimeToString(firstDate);
        const lastInstance: RingData[] = allRings[allRings.length - 1];
        const lastRing: RingData = lastInstance[lastInstance.length - 1];
        const lastDate: Date = new Date(lastRing.created_at);
        const lastTime = convertTimeToString(new Date(lastDate));
        console.log(`${firstTime} から ${lastTime} までのタイムラプスを${playbackSpeed}倍速で再生します`);

        // 初期化処理
        setTargetIndexes([0, 0]);
        let prevRing: RingData | null = null;

        for(let i: number = 0; i < allRings.length; i++){
            const instance: RingData[] = allRings[i];

            // 新しい周の描画を開始する際、描画を初期化する
            setDrawingRings([]);

            for(let j: number = 0; j < instance.length; j++){
                const ring: RingData = instance[j];

                // リング間の生成時間の差分だけ待機する
                if(prevRing){
                    const prevTime: number = new Date(prevRing.created_at).getTime();
                    const currentTime: number = new Date(ring.created_at).getTime();
                    const timeDistance: number = currentTime - prevTime;
                    const playbackSpeedNum: number = Math.abs((Number(playbackSpeed) || 1));
                    const waitTime: number = timeDistance / playbackSpeedNum;
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }

                // リングを描画に追加する
                setDrawingRings(prev => [...prev, ring]);
                setBackgroundImagePath(ring.location); // 背景画像を切り替える
                setTargetIndexes([i, j]);
                prevRing = ring;
            }
        }
    }

    // UIの表示/非表示を切り替える関数
    function toggleUiVisible(){
        setUiVisible(prev => !prev);
    }


    return(
        <div
            className="canvas"
            style={{ backgroundImage: (backgroundImageVisible) ? (backgroundImagePath ?? "") : ""}}
        >
            <Canvas camera={{ position: [0,0,8], far: 50}} >
                <color attach="background" args={[0xff000000]} /> {/*背景色*/}
                <ambientLight intensity={1} />
                <directionalLight intensity={1.5} position={[1,1,1]} />
                <directionalLight intensity={1.5} position={[1,1,-1]} />
                <pointLight intensity={1} position={[1,1,5]} />
                <pointLight intensity={1} position={[1,1,-5]} />
                <TorusList
                    rings={drawingRings}
                    enableMovingTorus={enableMovingTorus}
                />
            </Canvas>
            {uiVisible && (
                <>
                    <DisplayInfo
                        allRings={allRings ?? []}
                        targetIndexes={targetIndexes}
                        locationsData={locationsData}
                    />
                    <Utilities
                        props={{
                            setUiVisible,
                            playbackSpeed,
                            setPlaybackSpeed,
                            enableMovingTorus,
                            setEnableMovingTorus,
                            backgroundImageVisible,
                            setBackgroundImageVisible
                        }}
                    />
                </>
            )}
        </div>
    );
}

// Dateオブジェクトを文字列に変換する関数
export function convertTimeToString(date: Date){
    const year   = date.getFullYear();
    const month  = date.getMonth() + 1;
    const day    = date.getDate();
    const hour   = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    const result: string = `${year}/${month}/${day} ${hour}:${minute}`;
    return result;
}