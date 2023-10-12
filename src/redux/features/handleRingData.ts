import { Ring, positionArray, torusScale } from "../../torusPosition";
import { TorusInfo } from "./torusInfo-slice";
import { v4 as uuidv4 } from 'uuid';


/* 型定義 */
// リングの型
export type RingData = {
    "instance"?:   string;   // 周回中のインスタンスを表すID
    "location":   string;   // ロケーションピンのUUID
    "latitude":   number; // 撮影地点の緯度
    "longitude":  number; // 撮影地点の経度
    "address":    string; // IPアドレス
    "indexed":    number; // リング軌道内の順番(DEI中の何個目か、0~69)
    "ring_hue":    number; // リングの色調(0～360)
    "created_at": string; // 撮影日時
};
export type RingsData = {
    [id: string]: RingData;
};


/* 関数定義 */
// RingsData型をTorusInfo[]型に変換する関数
export function convertToTori(data: RingsData): TorusInfo[]{
    const result: TorusInfo[] = new Array;
    Object.entries(data).forEach(([_key, value], _index) => {
        const newLocalTorus: TorusInfo = convertToTorus(value);
        result.push(newLocalTorus);
    });
    return result;
}

// RingData型をTorusInfo型に変換する関数
export function convertToTorus(data: RingData): TorusInfo{
    const newRingPosition: Ring = positionArray[data.indexed]; // リングの軌道設定
    const newTorusInfo: TorusInfo = {
        id: uuidv4(),
        color: getRingColor(data.ring_hue),
        rotateX: newRingPosition.rotateX,
        rotateY: newRingPosition.rotateY,
        positionX: newRingPosition.positionX,
        positionY: newRingPosition.positionY,
        scale: torusScale
    };
    return newTorusInfo;
}

// 色調からリングの色を取得する関数
export function getRingColor(ringHue: number): string{
    return `hsl(${ringHue}, 100%, 50%)`;
}

// 全データの中から、直前に追加されたリングのデータを取得する関数
export function getLatestRing(data: RingsData): RingData | null{
    let latestRing: RingData | null = null;
    Object.entries(data).forEach(([_key, value], _index) => {
        if((latestRing === null) || (value.created_at > latestRing.created_at)){
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