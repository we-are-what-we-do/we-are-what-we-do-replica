import { Point } from 'geojson';
import { TorusInfo } from "./../redux/features/torusInfo-slice";


/* 型定義 */
// リングの型
export type RingData = {
    "location": string; // 撮影場所
    "locationJp": string; // 撮影場所日本語
    "latitude": number; // 撮影地点の緯度
    "longitude": number; // 撮影地点の経度
    "userIp": string; // IPアドレス
    "ringCount": number; // リング数
    "rotateX": number; // リング角度(右手親指)
    "rotateY": number; // リング角度(右手人差し指)
    "positionX": number; // リング位置(横方向)
    "positionY": number; // リング位置(縦方向)
    "ringColor": number; // リング色
    "scale": number; //リングの大きさ
    "creationDate":  number // 撮影日時
};
export type RingsData = {
    [id: string]: RingData;
};

// GeoJSONの型
export type Points = {
    [id: string]: Point;
};


/* 関数定義 */
const apiDomain: string = "https://api.wawwd.net/api/" // アプリケーションサーバーのドメイン

// GETリクエストを行う共通関数
async function makeGetRequest(apiEndpoint: string, queryParams?: string): Promise<Response>{
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
export async function getLocationConfig(): Promise<Points>{
    const apiEndpoint: string = "location-config";
    const response: Response = await makeGetRequest(apiEndpoint);
    const result: Points = await response.json();
    return result;
}

// ピン一か所から、リングのデータを取得する関数
export async function getRingData(location: string): Promise<RingsData>{
    const apiEndpoint: string = "ring-data";
    const queryParams: string = `?id=${location}`;
    const response: Response = await makeGetRequest(apiEndpoint, queryParams);
    const result: RingsData = await response.json();
    return result;
}

// JSONのPOSTリクエストを行う共通関数
async function makePostRequest(apiEndpoint: string, data: Object): Promise<Response>{
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
export async function postRingData(data: RingData): Promise<Response>{
    const apiEndpoint: string = "ring-data"; // リングのデータを送信するための、APIのエンドポイント
    const response: Response = await makePostRequest(apiEndpoint, data);
    return response;
}

// 撮影した写真を送信する関数
export async function postNftImage(base64Data: string): Promise<Response>{
    const apiEndpoint: string = "nft-image"; // 撮影した写真を送信するための、APIのエンドポイント
    const data: { image: string } = { image: base64Data };
    const response: Response = await makePostRequest(apiEndpoint, data);
    return response;
}

// RingsData型をTorusInfo型配列に変換する関数
export function convertToTorusMany(data: RingsData): TorusInfo[]{
    const result: TorusInfo[] = new Array;
    Object.entries(data).forEach(([_key, value], index) => {
        const newTorusInfo: TorusInfo = convertToTorus(value, index);
        result.push(newTorusInfo);
    });
    return result;
}

// RingData型をTorusInfo型に変換する関数
export function convertToTorus(data: RingData, index: number): TorusInfo{
    const newTorusInfo: TorusInfo = {
        id: index,
        color: data.ringColor,
        rotateX: data.rotateX,
        rotateY: data.rotateY,
        positionX: data.positionX,
        positionY: data.positionY,
        scale: data.scale
    };
    return newTorusInfo;
}