import { createContext, useState, useEffect, ReactNode } from 'react';

/* 型定義 */
// contextに渡すデータの型
type DbContent = {

};

// リングの型
type RingData = {
    "location": string; // 撮影場所(英名)
    "locationJp": string; // 撮影場所(和名)
    "ringCount": number; // リング数
    "ipAddress": string; // IPアドレス
    "angleX": number; // 角度(右手親指)
    "angleY": number; // 角度(右手人差し指)
    "color": string; // 色("#"抜きのカラーコード)
    "lastUpdated":  number // 最終更新日時(タイムスタンプ)
};
// type RingsData = {
//     [id: string]: RingData;
// };

/* 関数定義 */


/* Provider */
const initialData: DbContent = {

};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){

    useEffect(() => {

    }, [])

    return (
        <DbContext.Provider
            value={{

            }}
        >
            {children}
        </DbContext.Provider>
    );
}