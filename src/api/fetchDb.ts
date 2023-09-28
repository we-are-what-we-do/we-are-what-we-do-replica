import { Point, FeatureCollection } from 'geojson';
import { RingData, RingsData } from "./../redux/features/handleRingData";


/* 関数定義 */
// const apiDomain: string = "https://api.wawwd.net/api/"; // アプリケーションサーバーのドメイン
const apiDomain: string = "https://wawwdtestdb-default-rtdb.firebaseio.com/api/"; // 仮DBサーバーのドメイン

// GETリクエストを行う共通関数
async function makeGetRequest(apiEndpoint: string, queryParams?: string): Promise<Response>{
    try {
        const response = await fetch(apiDomain + apiEndpoint + (queryParams ?? ''));
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
export async function getLocationConfig(): Promise<FeatureCollection<Point>>{
    const apiEndpoint: string = "location-config";
    const response: Response = await makeGetRequest(apiEndpoint);
    const result: FeatureCollection<Point> = await response.json();
    return result;
}

// ピン一か所から、リングのデータを取得する関数
export async function getRingData(location?: string): Promise<RingsData> {
    // const apiEndpoint: string = "ring-data";
    const apiEndpoint: string = "ring-data.json"; // 仮エンドポイント
    let queryParams: string = "";
    if(location){
        // ピンが指定されている場合、その一か所からのみリングのデータを取得する
        queryParams = `?id=${location}`;
    }
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