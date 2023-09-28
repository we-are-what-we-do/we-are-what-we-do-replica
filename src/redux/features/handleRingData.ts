import { TorusInfo } from "./torusInfo-slice";

/* 型定義 */
// リングの型
export type RingData = {
    "location": string; // 撮影場所
    "locationJp": string; // 撮影場所日本語
    "latitude": number; // 撮影地点の緯度
    "longitude": number; // 撮影地点の経度
    "userIp": string; // IPアドレス
    "ringCount": number; // リング数
    "orbitIndex": number; // リング軌道内の順番(DEI中の何個目か、0~70)
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


/* 関数定義 */
// RingsData型をTorusInfo[]型に変換する関数
export function convertToTori(data: RingsData): TorusInfo[]{
    const result: TorusInfo[] = new Array;
    Object.entries(data).forEach(([_key, value], _index) => { // TODO 全データを舐めるのは止めた方がいいかも
        const newLocalTorus: TorusInfo = convertToTorus(value, value.ringCount);
        result.push(newLocalTorus);
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

// 全データの中から、直前に追加されたリングのデータを取得する関数
export function getLatestRing(data: RingsData): RingData | null{
    let latestRing: RingData | null = null;
    Object.entries(data).forEach(([_key, value], _index) => {
        if((latestRing === null) || (value.ringCount > latestRing.ringCount)){
            latestRing = value;
        }
    });
    return latestRing;
}