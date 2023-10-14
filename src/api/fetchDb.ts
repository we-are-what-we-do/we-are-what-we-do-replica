import { Point, FeatureCollection } from 'geojson';
import { RingData, RingsData } from "./../redux/features/handleRingData";


/* 関数定義 */
// const apiDomain: string = "https://api.wawwd.net/"; // アプリケーションサーバーのドメイン
const apiDomain: string = "https://wawwdtestdb-default-rtdb.firebaseio.com/"; // 仮DBサーバーのドメイン
const awsApiDomain: string = "https://ajl8yofz6j.execute-api.ap-northeast-1.amazonaws.com/";

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

async function makeGetRequestForAws(apiEndpoint: string, queryParams?: string): Promise<Response>{
    try {
        const response = await fetch(awsApiDomain + apiEndpoint + (queryParams ?? ''));
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
    let result: FeatureCollection<Point> | null = null;
    // キャッシュデータからのピン設定データ取得を試みる
    const cashData: string | null = localStorage.getItem("locations");
    // localStorage.removeItem("locations"); // localStorageを削除したい際はこのコードで削除する

    if(cashData){
        const locationData = JSON.parse(cashData) as FeatureCollection<Point>;
        result = locationData;
        // console.log("キャッシュからgeolocationデータを読み込みました", locationData);
    }else{
        // キャッシュデータがない場合、サーバーからデータを取得する
        // const apiEndpoint: string = "locations";
        const apiEndpoint: string = "locations.json"; // 仮エンドポイント
        const response: Response = await makeGetRequest(apiEndpoint);
        result = await response.json() as FeatureCollection<Point>;

        // サーバーから取得したデータをキャッシュに保存する
        localStorage.setItem("locations", JSON.stringify(result));
        // console.log("キャッシュにgeolocationデータを保存しました", result);
    }
    return result;
}

// ピン一か所から、リングのデータを取得する関数
export async function getRingData(location?: string): Promise<RingsData> {
    // const apiEndpoint: string = "rings";
    const apiEndpoint: string = "rings.json"; // 仮エンドポイント
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
    // const apiEndpoint: string = "rings"; // リングのデータを送信するための、APIのエンドポイント
    const apiEndpoint: string = "rings.json"; // 仮エンドポイント
    const response: Response = await makePostRequest(apiEndpoint, data);
    return response;
}

// 撮影した写真を送信する関数
export async function postNftImage(base64Data: string): Promise<Response>{
    // const apiEndpoint: string = "nft"; // 撮影した写真を送信するための、APIのエンドポイント
    const apiEndpoint: string = "nft.json"; // 仮エンドポイント
    const data: { image: string } = { image: base64Data };
    const response: Response = await makePostRequest(apiEndpoint, data);
    return response;
}


// locationIdからlocationJpを取得する関数
export function getLocationJp(data: FeatureCollection<Point>, locationId: string): string | null{
    // locationIdが一致するfeatureのproperties.locationJpを取得する
    const currentFeature = data.features.find((value) => value.id === locationId);
    if(!currentFeature) return null;
    const currentLocationJp: string | null = currentFeature.properties?.locationJp || null; 

    return currentLocationJp;
}

// ギャラリー向け画像パス群を取得する関数(最新画像を先頭にする)
export async function getPicPaths(): Promise<string[]>{
    
    // サーバーからデータを取得する
    const apiEndpoint: string = "test/gallery"; // 仮エンドポイント
    const response: Response = await makeGetRequestForAws(apiEndpoint);

    if(!response.ok){
        throw new Error("Server response was not ok");
    }

    const result:any = await response.json();
    const parsedBody:any = typeof result.body === "string" ? JSON.parse(result.body) : result.body;
    if (parsedBody && Array.isArray(parsedBody.file_paths) && parsedBody.file_paths.every(item => typeof item === 'string')) {
        
        // 古い写真から順番に格納されているのが前提。逆順にすることで、最新画像を先頭にする
        const reversedPaths = [...parsedBody.file_paths].reverse();
        
        return reversedPaths;
    } else {
        throw new Error("Unexpected data structure");
    }    
}
