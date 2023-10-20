import "../App.css";
import { useAppSelector } from "../redux/store";

type Props = {
    ringCount: number;
    latestLocationJp: string | null;
};

function DisplayInfo({ ringCount, latestLocationJp }: Props) {

    const updateTime  = useAppSelector((state) => state.updateTime.value);

    return (
        <>
            <div className="time-info">
                <div>リング数:     { ringCount ?? "不明" }</div>
                <div>最終更新日時: { updateTime || "不明" }</div>
                <div>最終更新場所: { latestLocationJp ?? "不明" }</div>
            </div>
        </>
    )
}
export default DisplayInfo;