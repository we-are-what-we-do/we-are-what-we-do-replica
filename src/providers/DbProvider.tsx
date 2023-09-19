import { createContext, useState, ReactNode } from 'react';
import {
    RingsData,
    getRingData
} from "./../api/fetchDb";


/* 型定義 */
// contextに渡すデータの型
type DbContent = {
    ringData: RingsData;
    initializeRingData: (location: string) => Promise<void>;
};


/* Provider */
const initialData: DbContent = {
    ringData: {},
    initializeRingData: () => Promise.resolve(),
};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){
    // リングのデータを管理する
    const [ringData, setRingData] = useState<RingsData>({});

    // リングのデータを入力する関数
    // 現在いるピンの位置(リングのデータを取得したいピンの位置)のidを、引数に渡してください
    async function initializeRingData(location: string): Promise<void>{
        let newRingsData: RingsData = {};
        newRingsData = await getRingData(location);
        setRingData(newRingsData || {});
    }

    return (
        <DbContext.Provider
            value={{
                ringData,
                initializeRingData
            }}
        >
            {children}
        </DbContext.Provider>
    );
}