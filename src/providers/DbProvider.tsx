import { createContext, useState, ReactNode } from 'react';
import { TorusInfo } from "./../redux/features/torusInfo-slice";
import {
    RingsData,
    getRingData,
    convertToTori,
    ToriByLocation
} from "./../api/fetchDb";


/* 型定義 */
// contextに渡すデータの型
type DbContent = {
    ringsData: RingsData;
    toriByLocation: ToriByLocation;
    initializeRingData: (location?: string) => Promise<void>;
    addTorus: (location: string, newTorus: TorusInfo) => void;
};


/* Provider */
const initialData: DbContent = {
    ringsData: {},
    toriByLocation: {},
    initializeRingData: () => Promise.resolve(),
    addTorus: () => {}
};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){
    // リングのデータを管理する
    const [ringsData, setRingsData] = useState<RingsData>({});
    const [toriByLocation, setTori] = useState<ToriByLocation>({});

    // リングのデータを、サーバーから取得したデータで初期化する関数
    async function initializeRingData(location?: string): Promise<void>{
        const newRingsData: RingsData = await getRingData(location) || {};
        let newTori: ToriByLocation = convertToTori(ringsData);
        setRingsData(newRingsData);
        setTori(newTori);
    }

    // torusArrayに新しいtorusデータを一つ追加する関数
    function addTorus(location: string, newTorus: TorusInfo): void{
        setTori((prevTori) => {
            const newTori: ToriByLocation = Object.assign({}, prevTori);
            const newArray: TorusInfo[] = prevTori[location]?.slice() || [];
            newArray.push(newTorus);
            newTori[location] = newArray;
            return newTori;
        });
    };

    return (
        <DbContext.Provider
            value={{
                ringsData,
                toriByLocation,
                initializeRingData,
                addTorus
            }}
        >
            {children}
        </DbContext.Provider>
    );
}