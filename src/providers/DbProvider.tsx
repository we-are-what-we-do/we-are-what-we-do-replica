import { createContext, useState, ReactNode, useEffect } from 'react';
import { TorusInfo } from "./../redux/features/torusInfo-slice";
import {
    RingData,
    RingsData,
    convertToTori,
    getLatestRing
} from "./../redux/features/handleRingData";
import { getRingData } from "./../api/fetchDb";


/* 型定義 */
// contextに渡すデータの型
type DbContent = {
    ringsData: RingsData;
    latestRing: RingData | null;
    toriData: TorusInfo[];
    initializeRingData: (location?: string) => Promise<void>;
    addTorusData: (newTorus: TorusInfo) => void;
    setLatestRing: React.Dispatch<React.SetStateAction<RingData | null>>;
    isLoadedData: boolean;
};


/* Provider */
const initialData: DbContent = {
    ringsData: {},
    latestRing: null,
    toriData: [],
    initializeRingData: () => Promise.resolve(),
    addTorusData: () => {},
    setLatestRing: () => null,
    isLoadedData: true
};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){
    // リングのデータを管理する
    const [ringsData, setRingsData] = useState<RingsData>({}); // サーバーから取得したリングデータ
    const [latestRing, setLatestRing] = useState<RingData | null>(null); // 直前に追加されたリングデータ
    const [toriData, setTori] = useState<TorusInfo[]>([]); // Three.jsで使用するリングデータ

    // データを取得済みかどうかを管理する
    const [isLoadedData, setIsLoadedData] = useState<boolean>(false);

    // 初回レンダリング時、サーバーからデータを取得する
    useEffect(() => {
        initializeRingData().then(() => {
            setIsLoadedData(true);
        });
    }, [])

    // リングのデータを、サーバーから取得したデータで初期化する関数
    async function initializeRingData(): Promise<void>{
        const newRingsData: RingsData = await getRingData() ?? {};
        // リングデータを70個までに限定して切り出す(一応)
        const extractedRingData: RingsData = getLatestLap(newRingsData);
        const newLatestRing: RingData | null = getLatestRing(newRingsData);
        console.log({newLatestRing});
        let newTori: TorusInfo[] = convertToTori(newRingsData);
        setRingsData(extractedRingData);
        setLatestRing(newLatestRing);
        setTori(newTori);

        // TODO セキュリティの観点から、後で消す
        console.log(
            "サーバーからデータを取得しました:\n", newRingsData,
            "\nリング数:", Object.keys(newRingsData).length
        );
    }

    // torusArrayに新しいtorusデータを一つ追加する関数
    function addTorusData(newTorus: TorusInfo): void{
        setTori((prevTori) => {
            const newTori: TorusInfo[] = prevTori.slice();
            newTori.push(newTorus);
            return newTori;
        });
    };

    return (
        <DbContext.Provider
            value={{
                ringsData,
                latestRing,
                toriData,
                initializeRingData,
                addTorusData,
                setLatestRing,
                isLoadedData
            }}
        >
            {children}
        </DbContext.Provider>
    );
}


/* 仮定義関数 */
import { positionArray } from '../torusPosition';
// オブジェクトの最後のn個のリングデータを直接取得する関数(非推奨)
// TODO サーバーサイドに最新リングのみを取得するapiを作った方がいいかも
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
        // リングが0～70個の場合
        result = Object.assign({}, data);
    }else{
        // リングが70個より多い場合
        const latestLapLength: number = ringAmount % orbitLength; // 最新のDEI周が何個のリングでできているか
        if(latestLapLength === 0){
            // リング個数が70の倍数のとき
            result = getLastRings(data, orbitLength); // 0個ではなく、70個取得する
        }else{
            result = getLastRings(data, latestLapLength);
        }
    }
    return result;
}