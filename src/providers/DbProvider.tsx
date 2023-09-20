import { createContext, useState, ReactNode } from 'react';
import { TorusInfo } from "./../redux/features/torusInfo-slice";
import {
    RingsData,
    getRingData,
    convertToTorusMany
} from "./../api/fetchDb";


/* 型定義 */
// contextに渡すデータの型
type DbContent = {
    torusArray: TorusInfo[];
    initializeRingData: (location: string) => Promise<void>;
    addTorus: (newTorus: TorusInfo) => void;
};


/* Provider */
const initialData: DbContent = {
    torusArray: [],
    initializeRingData: () => Promise.resolve(),
    addTorus: () => {}
};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){
    // リングのデータを管理する
    const [torusArray, setTorusArray] = useState<TorusInfo[]>([]);

    // リングのデータを、サーバーから取得したデータで初期化する関数
    // 現在いるピンの位置(リングのデータを取得したいピンの位置)のidを、引数に渡してください
    async function initializeRingData(location: string): Promise<void>{
        const ringsData: RingsData = await getRingData(location) || {};
        let newTorusArray: TorusInfo[] = convertToTorusMany(ringsData);
        setTorusArray(newTorusArray);
    }

    // torusArrayに新しいtorusデータを一つ追加する関数
    function addTorus(newTorus: TorusInfo): void{
        setTorusArray((prevTorusArray) => [...prevTorusArray, newTorus]);
    };

    return (
        <DbContext.Provider
            value={{
                torusArray,
                initializeRingData,
                addTorus
            }}
        >
            {children}
        </DbContext.Provider>
    );
}