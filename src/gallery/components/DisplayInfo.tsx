import "../App.css";
import { useAppSelector } from "../redux/store";

function DisplayInfo(props: { ringCount: number, latestLocationJp: string | null}) {
    const {
        ringCount,
        latestLocationJp
    } = props;

    const updateTime  = useAppSelector((state) => state.updateTime.value);
    
    //todo:k.ito 動的に撮影枚数を表示する処理を組み込む
    return (
        <>
            <div className="time-info">
                <div>撮影枚数: 40枚</div>
                <div className="last-update">最終更新日時: {updateTime || "不明" }</div>
                <div>最終更新場所: {latestLocationJp ?? "不明"}</div>
            </div>
        </>
    )
}
export default DisplayInfo;
