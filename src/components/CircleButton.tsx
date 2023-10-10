// 二重丸のsvgコンポーネント
export default function CircleButton(props: {
    color: string;
    width: string;
    height: string;
}) {
    const {
        color,
        width,
        height,
    } = props;

    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke={color} stroke-width="3" />
            <circle cx="50" cy="50" r="30" fill={color} stroke={color} stroke-width="3" />
        </svg>
    );
};