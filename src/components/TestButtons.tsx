import { useContext } from "react";
import { postRingData } from './../api/fetchDb';
import { DbContext } from "../providers/DbProvider";
import { RingContext } from "./../providers/RingProvider";
import { SocketContext } from "../providers/SocketProvider";
import { RingData, getIso8601DateTime } from "../handleRingData";
import { positionArray } from "./../torusPosition";
import { GpsContext } from "../providers/GpsProvider";
import { v4 as uuidv4 } from 'uuid';


export const TEST_LOCATION_ID: string = "36e94259-ceda-49fd-b6f7-29df955adfff";


export default function TestButtons() {
    /* useState等 */
    // サーバーから取得したリングデータを管理するcontext
    const {
        setLatestRing
    } = useContext(DbContext);

    // リングのデータを追加するためのcontext
    const {
        getRingDataToAdd,
        addTorus,
        usedOrbitIndexes,
        setUsedOrbitIndexes
    } = useContext(RingContext);

    // websocketを管理するcontext
    const {
        hasPostRing,
        socketRef
    } = useContext(SocketContext);

    // GPSの状態を管理するcontext
    const {
        currentLatitude,
        currentLongitude
    } = useContext(GpsContext);

    /* 関数定義 */
    // サーバーにリングを追加する処理(テスト用)
    async function testAddRing(): Promise<void>{
        let addedRingData: RingData | null = null;
        if(hasPostRing.current){
            // 初期追加のリングを送信済みの場合
            // リングを追加して描画する
            const newTorus = addTorus(usedOrbitIndexes).torusData;

            // 描画に追加したリングのデータを取得する
            addedRingData = generateTestRingData(newTorus.orbitIndex, newTorus.ringHue);

            setUsedOrbitIndexes((prev) => [...prev, addedRingData!.indexed]);
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
        // await postRingData(addedRingData);
        socketRef.current?.send(JSON.stringify(addedRingData));
        console.log("サーバーにデータを送信しました:\n", addedRingData);

        // テスト用のstate更新
        setLatestRing(addedRingData);
    }

    // ランダムにリングデータを作成する関数
    function generateTestRingData(orbitIndex: number, ringHue: number): RingData{
        return {
            location: TEST_LOCATION_ID,
            latitude: 0, // 撮影地点の緯度
            longitude: 0, // 撮影地点の経度
            user: uuidv4(), // ユーザーID
            indexed: orbitIndex, // リング軌道内の順番(DEI中の何個目か、0~70)
            hue: ringHue, // リングの色調
            created_at: getIso8601DateTime() // 撮影日時
        };
    }

    // サーバーからリングデータを削除する処理(テスト用)
    async function testDeleteRing(): Promise<void>{
        await fetch("https://wawwdtestdb-default-rtdb.firebaseio.com/rings.json", {
            method: 'DELETE'
        });
        await fetch("https://wawwdtestdb-default-rtdb.firebaseio.com/nft.json", {
            method: 'DELETE'
        });
        location.reload();
    }


    return (
        <div
            style={{
                width: "100%",
                position: "absolute",
                top: "10%"
            }}
        >
            <button
                onClick={testAddRing}
                style={{
                    position: "relative"
                }}
            >
                リング追加(テスト用)
            </button>
            <button
                onClick={testDeleteRing}
                style={{
                    position: "relative",
                }}
            >
                リングデータ削除(テスト用)
            </button>
            <br/>
            <span
                style={{
                    position: "relative",
                    color: "white"
                }}
            >
                リング数: {usedOrbitIndexes.length}/{positionArray.length}
                <br/>
                現在地: {currentLatitude}, {currentLongitude}
            </span>
        </div>
    );
};