import { createContext, useState, ReactNode, useEffect } from 'react';
import { FeatureCollection, Point } from 'geojson';
import { getLocationConfig } from '../api/fetchDb';
import { haversineDistance } from '../api/distanceCalculations';
import { showInfoToast } from '../components/ToastHelpers';


/* 定数定義 */
// 環境変数(REACT_APP_RADIUS)から半径の値を取得 
// 環境変数が数値でない、または設定されていない場合はデフォルト値として 1000m を使用
// const RADIUS = process.env.REACT_APP_RADIUS ? parseInt(process.env.REACT_APP_RADIUS) : 1000;
const RADIUS = 1000;


/* 型定義 */
// contextに渡すデータの型
type Context = {
    gpsFlag: number;
    location: string | null;
    locationJp: string | null;
    currentLatitude: number | null;
    currentLongitude: number | null;
    errorMessage: string | null;
};


/* Provider */
const initialData: Context = {
    gpsFlag: 0,
    location: null,
    locationJp: null,
    currentLatitude: null,
    currentLongitude: null,
    errorMessage: null
};

export const GpsContext = createContext<Context>(initialData);

// GPSの状態を管理するプロバイダー
export function GpsProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    const [gpsFlag, setGpsFlag] = useState<number>(0); // GPSが取得できているかどうかのフラグ
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // errorMessage

    // リングデータをサーバーに送信する際に必要なGPS情報を管理するstate.
    const [location, setLocation] = useState<string | null>(null); // 現在値
    const [locationJp, setLocationJp] = useState<string | null>(null); // 現在地(和名)
    const [currentLatitude, setCurrentLatitude] = useState<number | null>(null); // 現在地の緯度
    const [currentLongitude, setCurrentLongitude] = useState<number | null>(null); // 現在地の経度


    /* useEffect等 */
    // GeoJSON Pointデータと現在地の比較を実行した結果をgpsFlagにセット
    useEffect(() => {
        compareCurrentLocationWithPin().then(result => {
            setGpsFlag(result);
            console.log(`gpsFlag : ${result}`);
        });
    }, []);


    /* 関数定義 */
    // 現在地の取得とピンの位置を比較する関数
    async function compareCurrentLocationWithPin() : Promise<number> {
        // gpsFlagの戻り値 デフォルト0
        let result = 0;

        // 現在地の緯度経度を取得するPromiseを返す関数
        const getCurrentLocation = (): Promise<[number, number]> => {
            return new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve([position.coords.latitude, position.coords.longitude]);
                    },
                    (error) => {
                        if (error.code === error.PERMISSION_DENIED) {
                            setErrorMessage("アプリを使用するにはGPSを許可してください");
                        }
                        reject(error);
                    }
                );
            });
        };

        try {
            // 現在地の緯度・経度をstateに保存する
            const [currentLat, currentLon] = await getCurrentLocation();
            // console.log(`Your latitude is: ${currentLat}`);
            // console.log(`Your longitude is: ${currentLon}`);
            setCurrentLatitude(currentLat);
            setCurrentLongitude(currentLon);

            // ピンの位置情報を取得
            const geoJSONData: FeatureCollection<Point> = await getLocationConfig();

            // 各ピンの位置と現在地との距離をチェック
            for (const feature of geoJSONData.features) {
                // 現在地のlocation名をstateに保存する
                const currentLocation: string = feature.properties?.location ?? "";
                const currentLocationJp: string = feature.properties?.locationJp ?? "";
                // console.log(`Location is: ${currentLocation}`);
                // console.log(`LocationJP is: ${currentLocationJp}`);
                setLocation(currentLocation);
                setLocationJp(currentLocationJp);

                // 2点間の距離を求める
                const [longitude, latitude] = feature.geometry.coordinates;
                const distance: number = haversineDistance(currentLat, currentLon, latitude, longitude); // 2点間の距離
                
                // 2点間の距離に応じて、gpsFlagを適切な値に設定する
                if (distance <= RADIUS) {
                    result = 1; // 条件に合致した場合、resultを1に設定
                    // console.log(`Feature is within ${RADIUS} meters of your current location.`);
                    break; // 1つでも条件に合致するピンが見つかった場合、ループを抜ける
                } else {
                    // console.log(`Feature is ${distance} meters away from your current location.`);
                }
            };
        } catch (error) {
            console.error("Error fetching GeoJSON Point data or getting current location:", error);
        }

        // GPSがピンの範囲外の場合、「ARリングはピン設置箇所の近くでのみ表示されます。」というメッセージボックスを表示する
        if(!Boolean(result)){
            showInfoToast("I001");
        };

        return result;
    }


    return (
        <GpsContext.Provider
            value={{
                gpsFlag,
                location,
                locationJp,
                currentLatitude,
                currentLongitude,
                errorMessage
            }}
        >
            {children}
        </GpsContext.Provider>
    );
}