import { positionArray } from "./../torusPosition";
import { useAppSelector } from "../redux/store";

export default function TestButtons({testAddRing}: {testAddRing(): void}) {
    /* useState等 */
    // redux
    const torusList = useAppSelector((state) => state.torusInfo.value);

    return (
        <div
            style={{
                width: "100%",
                position: "absolute",
                top: "10%"
            }}
        >
            <button
                onClick={testAddRing}
                style={{
                    position: "relative"
                }}
            >
                リング追加(テスト用)
            </button>
            <button
                onClick={() => {
                    localStorage.clear();
                    location.reload();
                }}
                style={{
                    position: "relative"
                }}
            >
                全データ削除(テスト用)
            </button>
            <br/>
            <span
                style={{
                    position: "relative",
                    color: "white"
                }}
            >
                リング数: {torusList.length}/{positionArray.length}
            </span>
        </div>
    );
};
