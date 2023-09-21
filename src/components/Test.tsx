import { useState, useContext, ChangeEvent } from 'react';
import { DbContext } from './../providers/DbProvider';
import { TorusInfo } from '../redux/features/torusInfo-slice';
import { postRingData, RingData } from '../api/fetchDb';

const selectList: string[] = ["ehime_prefecture_office", "ehime_university"];
type KeyList = "id" | "color" | "rotateX" | "rotateY" | "positionX" | "positionY" | "scale";
const keyList: KeyList[] = ["id", "color", "rotateX", "rotateY", "positionX", "positionY", "scale"];

function generateRandomTorus(): TorusInfo {
    const randomColor = Math.floor(Math.random() * 16777215); // ランダムなカラーコード (0 から 16777215 まで)
    const randomRotateX = Math.floor(Math.random() * 360 * 100) / 100; // 0 から 360 の間のランダムな角度
    const randomRotateY = Math.floor(Math.random() * 360 * 100) / 100; // 0 から 360 の間のランダムな角度
    const randomPositionX = Math.floor(Math.random() * 100 * 100) / 100; // 0 から 100 の間のランダムな位置
    const randomPositionY = Math.floor(Math.random() * 100 * 100) / 100; // 0 から 100 の間のランダムな位置
    const randomScale = Math.floor(Math.random() * 2 * 100) / 100; // 0 から 2 の間のランダムなスケール

    const randomTorus: TorusInfo = {
        id: Math.floor(Math.random() * 1000), // 0 から 1000 の間のランダムな ID
        color: randomColor,
        rotateX: randomRotateX,
        rotateY: randomRotateY,
        positionX: randomPositionX,
        positionY: randomPositionY,
        scale: randomScale,
    };

    return randomTorus;
}

async function deleteRingData(): Promise<Response>{
    const apiDomain: string = "https://wawwdtestdb-default-rtdb.firebaseio.com/api/"; // アプリケーションサーバーのドメイン
    const apiEndpoint: string = "ring-data" + ".json";
    try {
        const response: Response = await fetch(apiDomain + apiEndpoint, {
            method: 'DELETE',
            mode: 'cors',
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

export default function Test(){
    const [selection, setSelection] = useState<string>(selectList[0]);
    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const newSelection: string = selectList[Number(e.target.value)];
        setSelection(newSelection);
        console.log("selection:", newSelection);
    }

    const {
        toriByLocation,
        initializeRingData,
        addTorus
    } = useContext(DbContext);

    function handleAddButton(){
        const newTorus: TorusInfo = generateRandomTorus();
        console.log("newTorus:", newTorus);
        addTorus(selection, newTorus);

        const newRingData: RingData = {
            "location": selection,
            "locationJp": selection + "(仮)",
            "latitude": 0,
            "longitude": 0,
            "userIp": "0.0.0.0",
            "ringCount": (toriByLocation[selectList[Number(selection)]]?.length || 0) + 1,
            "rotateX": newTorus.rotateX,
            "rotateY": newTorus.rotateY,
            "positionX": newTorus.positionX,
            "positionY": newTorus.positionY,
            "ringColor": newTorus.color,
            "scale": newTorus.scale,
            "creationDate":  new Date().getTime()
        }
        postRingData(newRingData);
    }

    return (
        <div>
            <select
            onChange={e => handleSelectChange(e)}>
            {
                selectList.map((address, key) => <option key={key} value={key}>{address}</option>)
            }
            </select>
            <button onClick={handleAddButton}>データを追加</button>
            <button onClick={() => initializeRingData()}>サーバーから取得して初期化</button>
            <button
                onClick={() => {
                    deleteRingData()
                }}
            >
                全消去(サーバーのみ)
            </button>
            <table border={1}>
                <tbody>
                    <tr>
                        <th/>
                        {Object.keys(toriByLocation).map((location, index) => (
                                <th
                                    key={index}
                                    colSpan={toriByLocation[location].length}
                                >
                                    {location}
                                </th>
                        ))}
                    </tr>
                    {
                        keyList.map((value, index) => (
                            <tr key={index}>
                                <th>{value}</th>
                                {Object.keys(toriByLocation).map(location => (
                                    (toriByLocation[location].map((torus: TorusInfo, torusIndex) =>
                                        <td key={torusIndex}>{torus[value]}</td>
                                    ))
                                ))}
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );
}