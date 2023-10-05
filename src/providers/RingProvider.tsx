import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { DbContext } from './DbProvider';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { TorusInfo, pushTorusInfo, resetHandle } from '../redux/features/torusInfo-slice';
import { Ring, torusScale } from '../torusPosition';
import { RingData, RingPositionWithIndex, convertToTorus, getRandomPositionExceptIndexes } from '../redux/features/handleRingData';
import { postRingData } from '../api/fetchDb';


/* 型定義 */
// contextに渡すデータの型
type RingContent = {
    addTorus: () => void,
    setCurrentIp: React.Dispatch<React.SetStateAction<string>>;
    setCurrentLatitude: React.Dispatch<React.SetStateAction<number | null>>;
    setCurrentLongitude: React.Dispatch<React.SetStateAction<number | null>>;
    setLocation: React.Dispatch<React.SetStateAction<string | null>>;
    setLocationJp: React.Dispatch<React.SetStateAction<string | null>>;
    usedOrbitIndexes: number[];
};

type CreateTorusArgument = {
    usedOrbitIndexes: number[];
    location: string;
    locationJp: string;
    latitude: number;
    longitude: number;
    userIp: string;
};


/* Provider */
const initialData: RingContent = {
    addTorus: () => {},
    setCurrentIp: () => {},
    setCurrentLatitude: () => {},
    setCurrentLongitude: () => {},
    setLocation: () => {},
    setLocationJp: () => {},
    usedOrbitIndexes: []
};

export const RingContext = createContext<RingContent>(initialData);

export function RingProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    // サーバーから取得したリングデータを管理するcontext
    const {
        ringsData,
        latestRing,
        setLatestRing
    } = useContext(DbContext);

    const [usedOrbitIndexes, setUsedOrbitIndexes] = useState<number[]>([]); // リングが既に埋まっている軌道内位置のデータ

    // リングデータをサーバーに送信する際に必要な情報を管理するstate
    const [currentIp, setCurrentIp] = useState<string>(""); // ユーザーのipアドレス
    const [currentLatitude, setCurrentLatitude] = useState<number | null>(null); // 現在地の緯度
    const [currentLongitude, setCurrentLongitude] = useState<number | null>(null); // 現在地の経度
    const [location, setLocation] = useState<string | null>(null); // 現在値
    const [locationJp, setLocationJp] = useState<string | null>(null); // 現在地(和名)


    // dispatch
    const dispatch = useDispatch<AppDispatch>();


    /* useEffect等 */
    // ringsDataに変更があれば、リングの初期表示を行う
    useEffect(() => {
        initializeRingDraw();
    }, [ringsData])


    /* 関数定義 */
    // 現在のリングのデータ(ringsData)で、3Dオブジェクトを初期表示する関数
    function initializeRingDraw(): void{
        // 初期化処理
        dispatch(resetHandle()); // 全3Dを消去する
        setUsedOrbitIndexes([]);

        // リングデータを71個までに限定して切り出す(一応)
        const extractedRingData: RingsData = getLatestLap(ringsData);

        // 3Dオブジェクトの初期表示を行う
        Object.entries(extractedRingData).forEach(([_key, value]) => {
            // リングデータを使用して、3Dオブジェクトを1つ作成する
            const newTorus: TorusInfo = convertToTorus(value);
            dispatch(pushTorusInfo(newTorus)); //リング情報をオブジェクトに詰め込みstoreへ送る

            setUsedOrbitIndexes((prev) => [...prev, value.orbitIndex]); // 使用済みの軌道番号として保管する
        });
    }

    // リングのデータを生成する関数
    function createTorus({
        usedOrbitIndexes,
        location,
        locationJp,
        latitude,
        longitude,
        userIp
    }: CreateTorusArgument): RingData | null{
        const orbitLength: number = positionArray.length; // DEI一周に必要なリングの数
        const color: number = 0xffffff * Math.random(); // リングの色
        let positionWithIndex: RingPositionWithIndex | null = null; // DEI内の軌道番号, リングの軌道設定
        let newOrbitIndex: number = -1; // DEI内の軌道番号
        let randomPosition: Ring | null = null; // ランダムなリング位置

        // 既に全てのリングが埋まっている場合
        if (usedOrbitIndexes.length >= orbitLength) {
            return null;
        }

        // DEI軌道の中から、空いているリングの位置をランダムに取得する
        // console.log("現在埋まっているリング位置:\n", usedOrbitIndexes);
        positionWithIndex = getRandomPositionExceptIndexes(positionArray, usedOrbitIndexes); 
        if(positionWithIndex){
            newOrbitIndex = positionWithIndex.index;
            randomPosition = positionWithIndex.ringPosition;
        }else{
            throw new Error("DEI軌道のリングが全て埋まっているのに、リングを作成しようとしました");
        }

        if(!randomPosition){
            throw new Error("リングのrandomPositionが取得できていません");
        }

        // 最終的なRingDataを生成する
        const newRingData: RingData = {
            location, // 撮影場所
            locationJp, // 撮影場所日本語
            latitude, // 撮影地点の緯度
            longitude, // 撮影地点の経度
            userIp, // IPアドレス
            ringCount: (latestRing?.ringCount ?? 0) + 1, // リング数
            orbitIndex: newOrbitIndex, // リング軌道内の順番(DEI中の何個目か、0~70)
            rotateX: randomPosition.rotateX, // リング角度(右手親指)
            rotateY: randomPosition.rotateY, // リング角度(右手人差し指)
            positionX: randomPosition.positionX, // リング位置(横方向)
            positionY: randomPosition.positionY, // リング位置(縦方向)
            ringColor: color, // リング色
            scale: torusScale, //リングの大きさ
            creationDate:  new Date().getTime() // 撮影日時
            };

            return newRingData;
    }

    // リングの3Dオブジェクトを追加する関数
    function addTorus(): void{
        // 追加するためのリングを生成する
        let newRingData: RingData | null = createTorus({
            usedOrbitIndexes,
            location: location ?? "unknown",
            locationJp: locationJp ?? "不明",
            latitude: currentLatitude ?? 0,
            longitude: currentLongitude ?? 0,
            userIp: currentIp,
        });

        // DEIが完成している場合、描画を初期化してから、リング生成をもう一度試みる
        if(!newRingData){
            // 描画とリング軌道内位置の空き情報を初期化する
            dispatch(resetHandle());
            const initialOrbitIndexes: number[] = []; // リングがないときの軌道番号配列
            setUsedOrbitIndexes(initialOrbitIndexes);

            // リング生成をもう一度試みる
            newRingData = createTorus({
                usedOrbitIndexes: initialOrbitIndexes,
                location: location ?? "unknown",
                locationJp: locationJp ?? "不明",
                latitude: currentLatitude ?? 0,
                longitude: currentLongitude ?? 0,
                userIp: currentIp,
            });

            // それでもダメだった場合、エラーを返す
            if(!newRingData){
                throw new Error("新たなDEI周にリングを生成できませんでした。");
            }
        }

        //リング情報をオブジェクトに詰め込みstoreへ送る
        const newTorus: TorusInfo = convertToTorus(newRingData);
        dispatch(pushTorusInfo(newTorus));

        // 使用済みの軌道番号として保存しておく
        const newOrbitIndex: number = newRingData?.orbitIndex ?? -1;
        setUsedOrbitIndexes((prev) => [...prev, newOrbitIndex]);

        // リングのデータを送信する
        postRingData(newRingData);
        setLatestRing(newRingData); // 最新のリングを更新する
        console.log("サーバーにデータを送信しました:\n", newRingData);
    };

    return (
        <RingContext.Provider
            value={{
                addTorus,
                setCurrentIp,
                setCurrentLatitude,
                setCurrentLongitude,
                setLocation,
                setLocationJp,
                usedOrbitIndexes
            }}
        >
            {children}
        </RingContext.Provider>
    );
}


/* 仮定義関数 */
import { RingsData } from '../redux/features/handleRingData';
import { positionArray } from '../torusPosition';
// オブジェクトの最後のn個のリングデータを直接取得する関数(非推奨)
// TODO 仮定義なので、APIの方でリングデータが0～70個に限定されていることを確認次第、削除する
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
    if(latestLapLength === 0){
        // リング個数が71の倍数のとき
        result = getLastRings(data, orbitLength);
    }else{
        result = getLastRings(data, latestLapLength);
    }
    }
    return result;
}