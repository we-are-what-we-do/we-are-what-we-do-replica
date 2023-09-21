import { useState, useContext, ChangeEvent } from 'react';
import { DbContext } from './../providers/DbProvider';
import { TorusInfo } from '../redux/features/torusInfo-slice';

const selectList: string[] = ["ehime_prefecture_office", "ehime_university"];

function generateRandomTorus(): TorusInfo {
    const randomColor = Math.floor(Math.random() * 16777215); // ランダムなカラーコード (0 から 16777215 まで)
    const randomRotateX = Math.random() * 360; // 0 から 360 の間のランダムな角度
    const randomRotateY = Math.random() * 360; // 0 から 360 の間のランダムな角度
    const randomPositionX = Math.random() * 100; // 0 から 100 の間のランダムな位置
    const randomPositionY = Math.random() * 100; // 0 から 100 の間のランダムな位置
    const randomScale = Math.random() * 2; // 0 から 2 の間のランダムなスケール

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

export default function Test(){
    const [selection, setSelection] = useState(selectList[0]);
    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => setSelection(e.target.value)

    const {
        toriByLocation,
        initializeRingData,
        addTorus
    } = useContext(DbContext);

    function handleAddButton(){
        const newTorus: TorusInfo = generateRandomTorus();
        addTorus(selection, newTorus);
    }

    return (
        <div>
            <select
            onChange={e => handleSelectChange(e)}>
            {
                selectList.map((address, key) => <option value={key}>{address}</option>)
            }
            </select>
            <button onClick={handleAddButton}>追加</button>
            <button onClick={() => initializeRingData()}>初期化</button>
            <table>
                {Object.keys(toriByLocation).map(location => (
                    <tr>
                        <th>{location}</th>
                        {toriByLocation[location].map((torus: TorusInfo) =>
                            (Object.keys(torus).map(key => (
                                <td>{key}</td>
                            )))
                        )}
                    </tr>
                ))}
            </table>
        </div>
    );
}