import { Point, FeatureCollection } from 'geojson';
import { RingData } from "../handleRingData";

/* 型定義 */
type RingInstance = {
    id: string; // インスタンスのid (UUID)
    location: string; // その場所であるというLocation (UUID)
    started_at: string; // インスタンスが作成された時間 (ISO8601)
    rings?: RingData[]; // リングデータ
}

/* 関数定義 */
const apiDomain: string = "https://api.wawwd.net/"; // アプリケーションサーバーのドメイン

// GETリクエストを行う共通関数
async function makeGetRequest(apiEndpoint: string, queryParams?: string): Promise<Response>{
    try {
        const url: string = apiDomain + apiEndpoint + "/" + (queryParams ?? '');
        const response = await fetch(url);
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
    // TODO geojsonデータの取得方法(仮)の修正
    // const cashData: string | null = localStorage.getItem("locations");
    const cashData: string | null = null;
    localStorage.removeItem("locations"); // localStorageを削除したい際はこのコードで削除する

    if(cashData){
        const locationData = JSON.parse(cashData) as FeatureCollection<Point>;
        result = locationData;
        // console.log("キャッシュからgeolocationデータを読み込みました", locationData);
    }else{
        // キャッシュデータがない場合、サーバーからデータを取得する
        const apiEndpoint: string = "locations";
        const response: Response = await makeGetRequest(apiEndpoint);
        result = await response.json() as FeatureCollection<Point>;
        console.log("location: ", result);

        // サーバーから取得したデータをキャッシュに保存する
        localStorage.setItem("locations", JSON.stringify(result));
        // console.log("キャッシュにgeolocationデータを保存しました", result);
    }
    return result;
}

// ピン一か所から、リングのデータを取得する関数
export async function getRingData(): Promise<RingData[]>{
    const apiEndpoint: string = "rings";

    // 最新のインスタンスを取得する
    const latestInstanceId: string = await getLatestInstanceId(apiEndpoint);
    const queryParams: string = `?id=${latestInstanceId}`
    const response: Response = await makeGetRequest(apiEndpoint, queryParams);
    const data: RingInstance = await response.json();

    // リングデータを取得する
    const ringData: RingData[] | undefined = data.rings;
    if(ringData === undefined) throw new Error("取得したデータにringsプロパティがありません")

    return ringData;
}

// 最新のインスタンスのIDを取得する関数
async function getLatestInstanceId(apiEndpoint: string): Promise<string>{
    const response: Response = await makeGetRequest(apiEndpoint);
    const data: RingInstance[] = await response.json();
    const latestInstanceId: string = data[0].id;
    return latestInstanceId;
}

// JSONのPOSTリクエストを行う共通関数
async function makePostRequest(apiEndpoint: string, data: Object): Promise<Response>{
    try {
        const url: string = apiDomain + apiEndpoint + "/";
        const response: Response = await fetch(url, {
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
    const apiEndpoint: string = "rings"; // リングのデータを送信するための、APIのエンドポイント
    const response: Response = await makePostRequest(apiEndpoint, data);
    return response;
}

// 撮影した写真を送信する関数
export async function postImageData(base64Data: string): Promise<Response>{
    const apiEndpoint: string = "image"; // 撮影した写真を送信するための、APIのエンドポイント
    const data: { image: string } = { image: base64Data };
    const response: Response = await makePostRequest(apiEndpoint, data);
    return response;
}


// locationIdからlocalize.jpを取得する関数
export function getLocationJp(data: FeatureCollection<Point>, locationId: string): string | null{
    // locationIdが一致するfeatureのproperties.localize.jpを取得する
    const currentFeature = data.features.find((value) => value.id === locationId);
    if(!currentFeature) return null;
    const currentLocationJp: string | null = currentFeature.properties?.localize.jp || null; 

    return currentLocationJp;
}