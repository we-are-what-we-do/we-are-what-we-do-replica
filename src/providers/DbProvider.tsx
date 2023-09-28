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
};


/* Provider */
const initialData: DbContent = {
    ringsData: {},
    latestRing: null,
    toriData: [],
    initializeRingData: () => Promise.resolve(),
    addTorusData: () => {}
};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){
    // リングのデータを管理する
    const [ringsData, setRingsData] = useState<RingsData>({}); // サーバーから取得したリングデータ
    const [latestRing, setLatestRing] = useState<RingData | null>(null); // 直前に追加されたリングデータ
    const [toriData, setTori] = useState<TorusInfo[]>([]); // Three.jsで使用するリングデータ

    // 初回レンダリング時、サーバーからデータを取得する
    useEffect(() => {
        initializeRingData();
    }, [])

    // リングのデータを、サーバーから取得したデータで初期化する関数
    async function initializeRingData(): Promise<void>{
        const newRingsData: RingsData = await getRingData() ?? {};
        const newLatestRing: RingData | null = getLatestRing(newRingsData);
        let newTori: TorusInfo[] = convertToTori(newRingsData);
        setRingsData(newRingsData);
        setLatestRing(newLatestRing);
        setTori(newTori);

        console.log("サーバーからデータを取得しました:\n", newRingsData); // TODO 後で消す
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
                addTorusData
            }}
        >
            {children}
        </DbContext.Provider>
    );
}