import { Ring, positionArray, torusScale } from "../../torusPosition";
import { TorusInfo } from "./torusInfo-slice";
import { v4 as uuidv4 } from 'uuid';


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
    "ringHue": number; // リングの色調(0～360)
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
        const newLocalTorus: TorusInfo = convertToTorus(value);
        result.push(newLocalTorus);
    });
    return result;
}

// RingData型をTorusInfo型に変換する関数
export function convertToTorus(data: RingData): TorusInfo{
    const newRingPosition: Ring = positionArray[data.orbitIndex]; // リングの軌道設定
    const newTorusInfo: TorusInfo = {
        id: uuidv4(),
        color: `hsl(${data.ringHue}, 100%, 50%)`,
        rotateX: newRingPosition.rotateX,
        rotateY: newRingPosition.rotateY,
        positionX: newRingPosition.positionX,
        positionY: newRingPosition.positionY,
        scale: torusScale
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

// 指定した配列内に存在するindex以外の要素から、ランダムなindexを取得する関数
export function getAvailableIndex(excludedIndexes: number[]): number | null{
    // indexをランダムに取得するための配列を生成する
    const eligibleIndexes = positionArray
        .map((_, index) => index)
        .filter(index => !excludedIndexes.includes(index)); // indexが既に存在する場合は配列に追加しない

    if (eligibleIndexes.length === 0) {
      // すべての要素が除外された場合、nullを返す
        return null;
    }

    const randomIndex = eligibleIndexes[Math.floor(Math.random() * eligibleIndexes.length)];

    return randomIndex;
}