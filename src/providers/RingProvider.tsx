import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { DbContext } from './DbProvider';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';
import { TorusInfo, pushTorusInfo, resetHandle } from '../redux/features/torusInfo-slice';
import { RingData, convertToTorus, getAvailableIndex, getRingColor } from '../redux/features/handleRingData';
import { Ring, positionArray, torusScale } from '../torusPosition';
import { v4 as uuidv4 } from 'uuid';


/* 型定義 */
// contextに渡すデータの型
type RingContent = {
    getRingDataToAdd: (newTorus?: AddedTorusInfo | null) => RingData | null;
    setCurrentIp: React.Dispatch<React.SetStateAction<string | null>>;
    setCurrentLatitude: React.Dispatch<React.SetStateAction<number | null>>;
    setCurrentLongitude: React.Dispatch<React.SetStateAction<number | null>>;
    setLocation: React.Dispatch<React.SetStateAction<string | null>>;
    setLocationJp: React.Dispatch<React.SetStateAction<string | null>>;
    addTorus: () => AddedTorusInfo;
};

// 追加したリング(TorusInfo)のデータ
type AddedTorusInfo = {
    orbitIndex: number;
    ringHue: number;
};

// TorusInfoを軌道index等と合わせたデータ
type TorusWithData = {
    torusData: AddedTorusInfo;
    torus: TorusInfo;
}


/* Provider */
const initialData: RingContent = {
    getRingDataToAdd: () => null,
    setCurrentIp: () => {},
    setCurrentLatitude: () => {},
    setCurrentLongitude: () => {},
    setLocation: () => {},
    setLocationJp: () => {},
    addTorus: () => ({} as AddedTorusInfo),
};

export const RingContext = createContext<RingContent>(initialData);

export function RingProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    // サーバーから取得したリングデータを管理するcontext
    const {
        ringsData,
        latestRing
    } = useContext(DbContext);

    // リングデータを管理するstate
    const [addedTorus, setAddedTorus] = useState<AddedTorusInfo |null>(null); // 追加したリング(AddedTorusInfo)のデータ
    const [usedOrbitIndexes, setUsedOrbitIndexes] = useState<number[]>([]); // リングが既に埋まっている軌道内位置のデータ

    // リングデータをサーバーに送信する際に必要な情報を管理するstate.
    const [location, setLocation] = useState<string | null>(null); // 現在値
    const [locationJp, setLocationJp] = useState<string | null>(null); // 現在地(和名)
    const [currentLatitude, setCurrentLatitude] = useState<number | null>(null); // 現在地の緯度
    const [currentLongitude, setCurrentLongitude] = useState<number | null>(null); // 現在地の経度
    const [currentIp, setCurrentIp] = useState<string | null>(null); // ユーザーのipアドレス

    // dispatch
    const dispatch = useDispatch<AppDispatch>();


    /* useEffect等 */
    // ringsDataに変更があれば、リングの初期表示+追加を行う
    useEffect(() => {
        initializeRingDraw();
    }, [ringsData]);

    /* 関数定義 */
    // 現在のリングのデータ(ringsData)で、3Dオブジェクトを初期表示して、リングを追加する関数
    function initializeRingDraw(): void{
        // 描画の初期化処理
        dispatch(resetHandle()); // 全3Dを消去する
        const newUsedOrbitIndexes: number[] = [];

        // 3Dオブジェクトの初期表示を行う
        Object.entries(ringsData).forEach(([_key, value]) => {
            // リングデータを使用して、3Dオブジェクトを1つ作成する
            const newTorus: TorusInfo = convertToTorus(value);
            dispatch(pushTorusInfo(newTorus)); //リング情報をオブジェクトに詰め込みstoreへ送る

            newUsedOrbitIndexes.push(value.orbitIndex); // 使用済みの軌道indexとして保管する
        });

        // リングを追加する
        const newTorus: AddedTorusInfo = addTorus();
        const newOrbitIndex: number = newTorus.orbitIndex;
        newUsedOrbitIndexes.push(newOrbitIndex);

        setUsedOrbitIndexes(newUsedOrbitIndexes); // 使用済みの軌道indexをstateで保管する
        setAddedTorus(newTorus); // 追加したリングデータ
    }

    // リングのデータ(TorusInfo)を生成する関数
    // DEI一周分が完成していて、新しいリングを生成できないときはnullを返す
    function createTorus(usedOrbitIndexes: number[]): TorusWithData | null{
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

        // 最終的なTorusInfoを生成する
        const newRingPosition: Ring = positionArray[newOrbitIndex];
        const newTorus: TorusInfo = {
            id: uuidv4(),
            color: getRingColor(ringHue),
            rotateX: newRingPosition.rotateX,
            rotateY: newRingPosition.rotateY,
            positionX: newRingPosition.positionX,
            positionY: newRingPosition.positionY,
            scale: torusScale
        };

        const torusData: AddedTorusInfo = {
            orbitIndex: newOrbitIndex,
            ringHue
        };
        const result: TorusWithData = {
            torusData,
            torus: newTorus
        };
        return result;
    }

    // リングの3Dオブジェクトを追加して描画する関数
    // 追加したリングの軌道indexを返す
    function addTorus(): AddedTorusInfo{
        let needDrawClear: boolean = false; // リング追加の描画時に、canvasの初期化が必要かどうか

        // 追加するためのリングを生成する
        let newTorusData: TorusWithData | null = createTorus(usedOrbitIndexes);

        // DEIが完成している場合、描画を初期化してから、リング生成をもう一度試みる
        if(!newTorusData){
            // 描画とリング軌道内位置の空き情報を初期化する
            needDrawClear = true;
            const initialOrbitIndexes: number[] = []; // リングがないときの軌道番号配列
            setUsedOrbitIndexes(initialOrbitIndexes);

            // リング生成をもう一度試みる
            newTorusData = createTorus(usedOrbitIndexes);

            // それでもダメだった場合、エラーを返す
            if(!newTorusData){
                throw new Error("新たなDEI周にリングを生成できませんでした。");
            }
        }

        //リング情報をオブジェクトに詰め込みstoreへ送る
        const newTorus: TorusInfo = newTorusData.torus;
        if(needDrawClear) dispatch(resetHandle()); // DEIの新たな周を描画する場合、canvasを初期化する
        dispatch(pushTorusInfo(newTorus));

        // 描画として追加したリングの軌道indexを返す
        const result: AddedTorusInfo = {
            orbitIndex: newTorusData.torusData.orbitIndex,
            ringHue: newTorusData.torusData.orbitIndex
        };
        return result;
    };

    // サーバーに送信するためのリングデータを取得する関数
    function getRingDataToAdd(newTorus: AddedTorusInfo | null = addedTorus): RingData | null{
        let result: RingData | null = null;

        if(location === null) return result;
        if(locationJp === null) return result;
        if(currentLatitude === null) return result;
        if(currentLongitude === null) return result;
        if(currentIp === null) return result;
        if(newTorus === null) return result;

        const newRingData: RingData = {
            location, // 撮影場所
            locationJp, // 撮影場所日本語
            latitude: currentLatitude, // 撮影地点の緯度
            longitude: currentLongitude, // 撮影地点の経度
            userIp: currentIp, // IPアドレス
            ringCount: (latestRing?.ringCount ?? 0) + 1, // リング数
            orbitIndex: newTorus.orbitIndex, // リング軌道内の順番(DEI中の何個目か、0~70)
            ringHue: newTorus.ringHue, // リングの色調
            creationDate:  new Date().getTime() // 撮影日時
        };
        result = newRingData;

        return result;
    }

    return (
        <RingContext.Provider
            value={{
                getRingDataToAdd,
                setCurrentIp,
                setCurrentLatitude,
                setCurrentLongitude,
                setLocation,
                setLocationJp,
                addTorus
            }}
        >
            {children}
        </RingContext.Provider>
    );
}