import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { DbContext } from './DbProvider';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { TorusInfo, pushTorusInfo, resetHandle } from '../redux/features/torusInfo-slice';
import { RingData, convertToTorus, getAvailableIndex } from '../redux/features/handleRingData';
import { positionArray } from '../torusPosition';


/* 型定義 */
// contextに渡すデータの型
type RingContent = {
    addTorus: () => Promise<RingData>;
    setCurrentIp: React.Dispatch<React.SetStateAction<string>>;
    setCurrentLatitude: React.Dispatch<React.SetStateAction<number | null>>;
    setCurrentLongitude: React.Dispatch<React.SetStateAction<number | null>>;
    setLocation: React.Dispatch<React.SetStateAction<string | null>>;
    setLocationJp: React.Dispatch<React.SetStateAction<string | null>>;
    setUsedOrbitIndexes: React.Dispatch<React.SetStateAction<number[]>>;
    usedOrbitIndexes: number[];
    initializeRingDraw: () => void;
};

type CreateTorusArgument = {
    usedOrbitIndexes: number[];
    location: string;
    locationJp: string;
    latitude: number;
    longitude: number;
    userIp: string;
};


/* Provider */
const initialData: RingContent = {
    addTorus: () => Promise.resolve({} as RingData),
    setCurrentIp: () => {},
    setCurrentLatitude: () => {},
    setCurrentLongitude: () => {},
    setLocation: () => {},
    setLocationJp: () => {},
    setUsedOrbitIndexes: () => {},
    usedOrbitIndexes: [],
    initializeRingDraw: () => {}
};

export const RingContext = createContext<RingContent>(initialData);

export function RingProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    // サーバーから取得したリングデータを管理するcontext
    const {
        ringsData,
        latestRing
    } = useContext(DbContext);

    const [usedOrbitIndexes, setUsedOrbitIndexes] = useState<number[]>([]); // リングが既に埋まっている軌道内位置のデータ

    // リングデータをサーバーに送信する際に必要な情報を管理するstate
    const [currentIp, setCurrentIp] = useState<string>(""); // ユーザーのipアドレス
    const [currentLatitude, setCurrentLatitude] = useState<number | null>(null); // 現在地の緯度
    const [currentLongitude, setCurrentLongitude] = useState<number | null>(null); // 現在地の経度
    const [location, setLocation] = useState<string | null>(null); // 現在値
    const [locationJp, setLocationJp] = useState<string | null>(null); // 現在地(和名)


    // dispatch
    const dispatch = useDispatch<AppDispatch>();


    /* useEffect等 */
    // ringsDataに変更があれば、リングの初期表示を行う
    useEffect(() => {
        initializeRingDraw();
    }, [ringsData])


    /* 関数定義 */
    // 現在のリングのデータ(ringsData)で、3Dオブジェクトを初期表示する関数
    function initializeRingDraw(): void{
        // 初期化処理
        dispatch(resetHandle()); // 全3Dを消去する
        const newUsedOrbitIndexes: number[] = [];

        // 3Dオブジェクトの初期表示を行う
        Object.entries(ringsData).forEach(([_key, value]) => {
            // リングデータを使用して、3Dオブジェクトを1つ作成する
            const newTorus: TorusInfo = convertToTorus(value);
            dispatch(pushTorusInfo(newTorus)); //リング情報をオブジェクトに詰め込みstoreへ送る

            newUsedOrbitIndexes.push(value.orbitIndex); // 使用済みの軌道番号として保管する
        });

        setUsedOrbitIndexes([]);
    }

    // リングのデータを生成する関数
    // DEI一周分が完成していて、新しいリングを生成できないときはnullを返す
    function createTorus({
        usedOrbitIndexes,
        location,
        locationJp,
        latitude,
        longitude,
        userIp
    }: CreateTorusArgument): RingData | null{
        const orbitLength: number = positionArray.length; // DEI一周に必要なリングの数
        const ringHue: number = Math.floor(Math.random() * 361); // リングの色調
        let newOrbitIndex: number | null = null; // DEI内の軌道番号

        // 既に全てのリングが埋まっている場合
        if (usedOrbitIndexes.length >= orbitLength) {
            return null;
        }

        // DEI軌道の中から、空いているリングの位置をランダムに取得する
        // console.log("現在埋まっているリング位置:\n", usedOrbitIndexes);
        newOrbitIndex = getAvailableIndex(usedOrbitIndexes); 
        if(newOrbitIndex === null){
            throw new Error("DEI軌道のリングが全て埋まっているのに、リングを作成しようとしました");
        }

        // 最終的なRingDataを生成する
        const newRingData: RingData = {
            location, // 撮影場所
            locationJp, // 撮影場所日本語
            latitude, // 撮影地点の緯度
            longitude, // 撮影地点の経度
            userIp, // IPアドレス
            ringCount: (latestRing?.ringCount ?? 0) + 1, // リング数
            orbitIndex: newOrbitIndex, // リング軌道内の順番(DEI中の何個目か、0~70)
            ringHue, // リングの色調
            creationDate:  new Date().getTime() // 撮影日時
        };

            return newRingData;
    }

    // リングの3Dオブジェクトを追加する関数
    async function addTorus(): Promise<RingData>{
        let needDrawClear: boolean = false; // リング追加の描画時に、canvasの初期化が必要かどうか

        // 追加するためのリングを生成する
        let newRingData: RingData | null = createTorus({
            usedOrbitIndexes,
            location: location ?? "unknown",
            locationJp: locationJp ?? "不明",
            latitude: currentLatitude ?? 0,
            longitude: currentLongitude ?? 0,
            userIp: currentIp,
        });

        // DEIが完成している場合、描画を初期化してから、リング生成をもう一度試みる
        if(!newRingData){
            // 描画とリング軌道内位置の空き情報を初期化する
            needDrawClear = true;
            const initialOrbitIndexes: number[] = []; // リングがないときの軌道番号配列
            setUsedOrbitIndexes(initialOrbitIndexes);

            // リング生成をもう一度試みる
            newRingData = createTorus({
                usedOrbitIndexes: initialOrbitIndexes,
                location: location ?? "unknown",
                locationJp: locationJp ?? "不明",
                latitude: currentLatitude ?? 0,
                longitude: currentLongitude ?? 0,
                userIp: currentIp,
            });

            // それでもダメだった場合、エラーを返す
            if(!newRingData){
                throw new Error("新たなDEI周にリングを生成できませんでした。");
            }
        }

        //リング情報をオブジェクトに詰め込みstoreへ送る
        const newTorus: TorusInfo = convertToTorus(newRingData);
        if(needDrawClear) await dispatch(resetHandle()); // DEIの新たな周を描画する場合、canvasを初期化する
        await dispatch(pushTorusInfo(newTorus));

        // 描画として追加したリングのデータを返す
        return newRingData;
    };

    return (
        <RingContext.Provider
            value={{
                addTorus,
                setCurrentIp,
                setCurrentLatitude,
                setCurrentLongitude,
                setLocation,
                setLocationJp,
                setUsedOrbitIndexes,
                usedOrbitIndexes,
                initializeRingDraw
            }}
        >
            {children}
        </RingContext.Provider>
    );
}