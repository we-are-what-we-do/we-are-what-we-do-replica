import { positionArray } from "../torusPosition";
import { RingData } from "../types";

// 最新周のリングデータを取得する関数
export async function getRingData(): Promise<RingData[]>{
    // リングデータを取得する
    const allRingData: RingData[] = await getAllRingData();
    const instanceLength: number = positionArray.length;
    const latestInstanceLength: number = allRingData.length % instanceLength;
    const latestRingData: RingData[] = allRingData.slice(-latestInstanceLength);
    return latestRingData;
}

// 全リングデータを取得する関数
export async function getAllRingData(): Promise<RingData[]>{
    // リングデータを取得する
    const localData: string | null = localStorage.getItem("rings");
    let ringData: RingData[] = [];
    if(localData){
        ringData = JSON.parse(localData);
    }
    return ringData;
}

// リングのデータを送信する関数
export async function postRingData(ringData: RingData): Promise<void>{
    const allRingData: RingData[] = await getAllRingData();
    allRingData.push(ringData);
    localStorage.setItem("rings", JSON.stringify(allRingData))
}
