import { useContext } from "react";
import { postRingData } from './../api/fetchDb';
import { DbContext } from "../providers/DbProvider";
import { RingContext } from "./../providers/RingProvider";
import { SocketContext } from "../providers/SocketProvider";
import { RingData } from "../handleRingData";
import { positionArray } from "./../torusPosition";
import { GpsContext } from "../providers/GpsProvider";

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
        hasPostRing
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
            addedRingData = getRingDataToAdd(newTorus);
            if(addedRingData === null){
                // リング描画を既に追加してしまっていて後に戻れないため、エラーを投げる(console.errorではダメ)
                throw new Error("追加するリングデータを取得できませんでした");
            };

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
        await postRingData(addedRingData);
        console.log("サーバーにデータを送信しました:\n", addedRingData);

        // テスト用のstate更新
        setLatestRing(addedRingData);
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
                top: "5%"
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