import { createContext, useState, ReactNode, useEffect } from 'react';
import { RingData } from '../types';
import { getRingData } from '../api/fetchDb';


/* 型定義 */
// contextに渡すデータの型
type DbContent = {
    latestRing: RingData | null;
    setLatestRing: React.Dispatch<React.SetStateAction<RingData | null>>;
};


/* Provider */
const initialData: DbContent = {
    latestRing: null,
    setLatestRing: () => null
};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){
    // リングのデータを管理する
    const [latestRing, setLatestRing] = useState<RingData | null>(null); // 直前に追加されたリングデー

    useEffect(() => {
        async () => {
            const ringData: RingData[] = await getRingData();
            const latestRingData: RingData = ringData.splice(-1)[0];
            setLatestRing(latestRingData);
        }
    })

    return (
        <DbContext.Provider
            value={{
                latestRing,
                setLatestRing
            }}
        >
            {children}
        </DbContext.Provider>
    );
}
