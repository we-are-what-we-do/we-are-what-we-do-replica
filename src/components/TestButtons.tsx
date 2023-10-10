import { useContext } from "react";
import { postRingData } from './../api/fetchDb';
import { DbContext } from "../providers/DbProvider";
import { RingContext } from "./../providers/RingProvider";
import { RingData } from "../redux/features/handleRingData";
import { positionArray } from "./../torusPosition";

export default function TestButtons(props: {
    hasPostRing: React.MutableRefObject<boolean>;
}) {
    /* useState等 */
    const {
        hasPostRing
    } = props;

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


    /* 関数定義 */
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
        <div>
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
                onClick={testDeleteRing}
                style={{
                position: "absolute",
                top: "90%",
                left: "70%",
                height: "2rem"
                }}
            >
                リングデータ削除(テスト用)
            </button>
            <span style={{position: "absolute", top: "90%"}}>リング数: {usedOrbitIndexes.length}/{positionArray.length}</span>
        </div>
    );
};