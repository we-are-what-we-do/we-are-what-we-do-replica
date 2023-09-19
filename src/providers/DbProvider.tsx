import { createContext, useState, useEffect, ReactNode } from 'react';
import { Point } from 'geojson';


/* 型定義 */
// contextに渡すデータの型
type DbContent = {
    getLocationConfig: () => Promise<Points>
    getRingData: (location: string) => Promise<RingsData>;
    postRingData:(data: RingData) => Promise<Response>;
    postNftImage: (base64Data: string) => Promise<Response>;
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
type RingsData = {
    [id: string]: RingData;
};

// GeoJSONの型
type Points = {
    [id: string]: Point;
};


/* 関数定義 */
const apiDomain: string = "https://api.wawwd.net/api/" // アプリケーションサーバーのドメイン

// GETリクエストを行う共通関数
async function makeGetRequest(apiEndpoint: string, queryParams?: string): Promise<Response> {
    try {
        const response = await fetch(apiDomain + apiEndpoint + (queryParams || ''));
        if(response.ok){
            return response;
        }else{
            // エラーレスポンスの場合はエラーハンドリングを行う
            throw new Error(`HTTPエラー: ${response.status}`);
        }
    }catch(error){
        // エラーハンドリング
        console.error('リクエストエラー:', error);
        throw error;
    }
}

// ピンの全設定データを取得する関数
async function getLocationConfig(): Promise<Points> {
    const apiEndpoint: string = "location-config";
    const response: Response = await makeGetRequest(apiEndpoint);
    const result: Points = await response.json();
    return result;
}

// ピン一か所から、リングのデータを取得する関数
async function getRingData(location: string): Promise<RingsData> {
    const apiEndpoint: string = "ring-data";
    const queryParams: string = `?id=${location}`;
    const response: Response = await makeGetRequest(apiEndpoint, queryParams);
    const result: RingsData = await response.json();
    return result;
}

// JSONのPOSTリクエストを行う共通関数
async function makePostRequest(apiEndpoint: string, data: Object): Promise<Response> {
    try {
        const response: Response = await fetch(apiDomain + apiEndpoint, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if(response.ok){
            // HTTPステータスコードが2xx（成功）の場合にレスポンスを返す
            return response;
        }else{
            // エラーレスポンスの場合はエラーハンドリングを行う
            throw new Error(`HTTPエラー: ${response.status}`);
        }
    } catch (error) {
        // エラーハンドリング
        console.error('POSTリクエストエラー:', error);
        throw error;
    }
}

// リングのデータを送信する関数
async function postRingData(data: RingData): Promise<Response>{
    const apiEndpoint: string = "ring-data"; // リングのデータを送信するための、APIのエンドポイント
    const response: Response = await makePostRequest(apiEndpoint, data);
    return response;
}

// 撮影した写真を送信する関数
async function postNftImage(base64Data: string): Promise<Response>{
    const apiEndpoint: string = "nft-image"; // 撮影した写真を送信するための、APIのエンドポイント
    const data: { image: string } = { image: base64Data };
    const response: Response = await makePostRequest(apiEndpoint, data);
    return response;
}


/* Provider */
const initialData: DbContent = {
    getLocationConfig,
    getRingData,
    postRingData,
    postNftImage,
};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){

    useEffect(() => {

    }, [])

    return (
        <DbContext.Provider
            value={{
                getLocationConfig,
                getRingData,
                postRingData,
                postNftImage
            }}
        >
            {children}
        </DbContext.Provider>
    );
}