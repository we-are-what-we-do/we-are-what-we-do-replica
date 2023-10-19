import { createContext, useState, ReactNode, useEffect } from 'react';

/* 型定義 */
// contextに渡すデータの型
type Context = {
    location: string | null;
    currentLatitude: number | null;
    currentLongitude: number | null;
};


/* Provider */
const initialData: Context = {
    location: null,
    currentLatitude: null,
    currentLongitude: null
};

export const GpsContext = createContext<Context>(initialData);

// GPSの状態を管理するプロバイダー
export function GpsProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    // リングデータをサーバーに送信する際に必要なGPS情報を管理するstate
    const [location, setLocation] = useState<string | null>(null); // 現在値
    const [currentLatitude, setCurrentLatitude] = useState<number | null>(null); // 現在地の緯度
    const [currentLongitude, setCurrentLongitude] = useState<number | null>(null); // 現在地の経度

    /* useEffect等 */
    useEffect(() => {
        // 現在地の緯度・経度をstateに保存する
        getCurrentLocation().then(res => {
            const [currentLat, currentLon] = res;
            setCurrentLatitude(currentLat);
            setCurrentLongitude(currentLon);
            setLocation("不明");
        });
    }, []);

    // 現在地の緯度経度を取得するPromiseを返す関数
    const getCurrentLocation = (): Promise<[number, number]> => {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve([position.coords.latitude, position.coords.longitude]);
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true
                }
            );
        });
    };

    return (
        <GpsContext.Provider
            value={{
                location,
                currentLatitude,
                currentLongitude
            }}
        >
            {children}
        </GpsContext.Provider>
    );
}