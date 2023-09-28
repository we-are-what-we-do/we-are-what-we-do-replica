import { RingPosition } from "../../torusPosition";
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

// 全データの中から、リングの軌道内位置情報のみを取得する関数
export function getOrbitIndexes(data: RingsData): number[]{
    let result: number[] = new Array;
    Object.entries(data).forEach(([_key, value]) => {
        result.push(value.orbitIndex);
    });
    return result;
}

// 指定したインデックス以外の要素からランダムな要素を取得する関数
export function getRandomPositionExceptIndexes(positionArray: RingPosition[], excludedIndexes: number[]) {
    // ランダムに選択される要素のインデックスを決定する
    const eligibleIndexes = positionArray
        .map((_, index) => index)
        .filter(index => !excludedIndexes.includes(index));

    if (eligibleIndexes.length === 0) {
      // すべての要素が除外された場合、nullを返す
        return null;
    }

    const randomIndex = eligibleIndexes[Math.floor(Math.random() * eligibleIndexes.length)];
    const randomValue = positionArray[randomIndex];

    return { index: randomIndex, value: randomValue };
}
  
  const inputArray = ["a", "b", "c", "d", "e"];
  const excludedIndexes = [0, 2];
  const randomElement = getRandomPositionExceptIndexes(inputArray, excludedIndexes);
  
  console.log(randomElement);
  