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
    toriByLocation: ToriByLocation;
    initializeRingData: (location: string) => Promise<void>;
    addTorus: (location: string, newTorus: TorusInfo) => void;
};


/* Provider */
const initialData: DbContent = {
    toriByLocation: {},
    initializeRingData: () => Promise.resolve(),
    addTorus: () => {}
};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){
    // リングのデータを管理する
    const [toriByLocation, setTori] = useState<ToriByLocation>({});

    // リングのデータを、サーバーから取得したデータで初期化する関数
    async function initializeRingData(location?: string): Promise<void>{
        const ringsData: RingsData = await getRingData(location) || {};
        let newTori: ToriByLocation = convertToTori(ringsData);
        setTori(newTori);
    }

    // torusArrayに新しいtorusデータを一つ追加する関数
    function addTorus(location: string, newTorus: TorusInfo): void{
        setTori((prevTori) => {
            const newArray: TorusInfo[] = prevTori[location] || [];
            newArray.push(newTorus);
            prevTori[location] = newArray;
            return prevTori;
        });
    };

    return (
        <DbContext.Provider
            value={{
                toriByLocation,
                initializeRingData,
                addTorus
            }}
        >
            {children}
        </DbContext.Provider>
    );
}