import "../App.css";

interface DisplayInfoProps {
    photoCount: number;
}

export default function DisplayInfo(props: DisplayInfoProps) {
    const {
        photoCount
    } = props;
    
    return (
        <div className="time-info">
            <div>撮影枚数: {photoCount}枚</div>
        </div>
    )
}