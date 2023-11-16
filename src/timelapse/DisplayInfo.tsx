import { useEffect, useState } from "react";
import "../App.css";
import { RingData } from "../types";
import { positionArray } from "../torusPosition";
import { FeatureCollection, Point } from "geojson";
import { getLocationJp } from "../api/fetchDb";
import { convertTimeToString } from "./App";

export default function DisplayInfo({
    allRings,
    targetIndexes,
    locationsData,
    isPlayingTimeLapse
}: {
    allRings: RingData[][];
    targetIndexes: [number, number];
    locationsData: React.MutableRefObject<FeatureCollection<Point> | null>;
    isPlayingTimeLapse: boolean;
}){
    // 最新リング情報を管理するstate
    const [ringCount, setRingCount] = useState<number>(0);
    const [updatedTime, setUpdatedTime] = useState<string | null>(null);
    const [updatedLocation, setUpdatedLocation] = useState<string | null>(null);

    // targetIndexが変わったら、リング数ringCountを更新する
    useEffect(() => {
        if(allRings === null || allRings.length === 0) return;
        const instanceLength: number = positionArray.length; // DEI一周分に必要なリング数
        const finishedCount: number = targetIndexes[0] * instanceLength; // 終了済みインスタンス内のリング数
        const currentCount: number = targetIndexes[1] + 1; // 現在描画中のリング数
        const newRingCount: number = finishedCount + currentCount;
        setRingCount(newRingCount);
    }, [targetIndexes]);

    // targetIndexが変わったら、最終更新日時updatedTimeを更新する
    useEffect(() => {
        if(allRings === null || allRings.length === 0 || !isPlayingTimeLapse) return;
        const latestRing: RingData | null = allRings[targetIndexes[0]][targetIndexes[1]];
        const date = new Date(latestRing?.created_at ?? 0);
        const newUpdatedTime: string = convertTimeToString(date);
        setUpdatedTime(newUpdatedTime);
    }, [targetIndexes]);

    // targetIndexが変わったら、最終更新場所updatedLocationを更新する
    useEffect(() => {
        if(allRings === null || allRings.length === 0 || !isPlayingTimeLapse) return;
        const latestRing: RingData | null = allRings[targetIndexes[0]][targetIndexes[1]] ?? null;
        if(!latestRing) return;
        let newUpdatedLocation: string | null = null;
        if(locationsData.current) newUpdatedLocation = getLocationJp(locationsData.current, latestRing.location);
        setUpdatedLocation(newUpdatedLocation);
    }, [targetIndexes]);

    return (
        <div className="time-info">
            <div>リング数:     {ringCount}</div>
            <div>最終更新日時: {updatedTime ?? "不明"}</div>
            <div>最終更新場所: {updatedLocation ?? "不明"}</div>
        </div>
    )
}