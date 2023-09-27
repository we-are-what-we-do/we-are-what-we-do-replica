import { createContext, useState, ReactNode } from 'react';
import { TorusInfo } from "./../redux/features/torusInfo-slice";
import {
    RingData,
    RingsData,
    getRingData,
    convertToTori,
    getLatestRing
} from "./../api/fetchDb";


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
    const [ringsData, setRingsData] = useState<RingsData>({});
    const [latestRing, setLatestRing] = useState<RingData | null>(null);
    const [toriData, setTori] = useState<TorusInfo[]>([]);

    // リングのデータを、サーバーから取得したデータで初期化する関数
    async function initializeRingData(): Promise<void>{
        const newRingsData: RingsData = await getRingData() ?? {};
        const newLatestRing: RingData | null = getLatestRing(newRingsData);
        let newTori: TorusInfo[] = convertToTori(newRingsData);
        setRingsData(newRingsData);
        setLatestRing(newLatestRing);
        setTori(newTori);
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