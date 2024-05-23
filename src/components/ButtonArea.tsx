import { useContext } from "react";
import { RingData } from "../types";
import { CaptureContext } from "./../providers/CaptureProvider";
import { CameraContext } from "./../providers/CameraProvider";
import { RingContext } from "./../providers/RingProvider";
import { showErrorToast, showConfirmToast, showSuccessToast } from "./ToastHelpers"
import DoubleCircleIcon from "./DoubleCircleIcon";
import { Theme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CenterFocusWeak from '@mui/icons-material/CenterFocusWeak';
import CameraRear from '@mui/icons-material/CameraRear';
import CameraFront from '@mui/icons-material/CameraFront';
import Cameraswitch from '@mui/icons-material/Cameraswitch';
import { ICON_SIZE, ICON_COLOR, BUTTON_MARGIN } from "./../App";
import { useDispatch } from "react-redux";
import { AppDispatch, useAppSelector } from "../redux/store";
import { changeButtonState } from "../redux/features/buttonState-slice";
import { postRingData } from "../api/fetchDb";
import { pushTorusInfo } from '../redux/features/torusInfo-slice';
import { convertToTorus } from "../handleRingData";

// ボタン類のコンポーネント
export default function ButtonArea(props: {
    theme: Theme;
    isTakingPhoto: React.MutableRefObject<boolean>;
    initializePositionZ(): void;
    orbitControlsReset(): void;
    testAddRing(): void;
}) {
    /* useState等 */
    const {
        theme,
        isTakingPhoto,
        initializePositionZ,
        orbitControlsReset,
        testAddRing
    } = props;

    // リングのデータを追加するためのcontext
    const {
        getRingDataToAdd
    } = useContext(RingContext);

    // アウトカメラ/インカメラを切り替えるためのcontext
    const {
        videoRef,
        switchCameraFacing,
        cameraFacing,
        enableBothCamera
    } = useContext(CameraContext);

    // 写真撮影(リング+カメラ)のためのcontext
    const {
        captureImage,
        saveImage
    } = useContext(CaptureContext);

    // 画面幅がmd以上かどうか
    const isMdScreen = useMediaQuery(() => theme.breakpoints.up("md")); // md以上

    // redux
    const dispatch = useDispatch<AppDispatch>();
    const buttonState = useAppSelector((state) => state.buttonState.value);


    /* 関数定義 */
    // 撮影ボタンを押したときの処理
    async function handleTakePhotoButton(): Promise<void>{
        // 既に撮影ボタンの処理が走っているなら、処理を中止する
        if(isTakingPhoto.current){
            console.error("既に撮影ボタンが押されています");
            return;
        };

        isTakingPhoto.current = true; // 撮影ボタンの処理中であることを記録する

        // 写真撮影の処理を開始する
        videoRef.current?.pause(); // カメラを一時停止する
        dispatch(changeButtonState()); // 3Dの視点を固定する

        // 撮影した写真に確認を取る
        const isPhotoOk: boolean = await showConfirmToast(); // 「撮影画像はこちらでよいですか」というメッセージボックスを表示する
        // console.log("isPhotoOk: ", isPhotoOk);

        // 撮影した写真に承諾が取れたら、サーバーにリングを送信する
        if(isPhotoOk){
            // リングデータを送信する
            sendRingData();
        }else{
            // 再撮影を望む場合、処理を止める
            console.log("撮影やり直しのために処理を中断しました");
        }

        videoRef.current?.play(); // カメラを再生する
        dispatch(changeButtonState()); // 3Dの視点固定を解除する

        isTakingPhoto.current = false; // 撮影ボタンの処理が終わったことを記録する
    }

    // websocketでリングデータを送信し、画像データ送信を待機する関数
    function sendRingData(): void{
        // 描画に追加したリングのデータを取得する
        const addedRingData: RingData | null = getRingDataToAdd();

        // 写真(リング+カメラ)を撮影をして、base64形式で取得する
        const newImage: string | null = captureImage();

        // エラーハンドリング
        try{
            if(!addedRingData){
                throw new Error("追加したリングデータを取得できませんでした");
            };
            if(!newImage){
                throw new Error("写真を撮影できませんでした");
            }
        }catch(error){
            console.error(error);
            videoRef.current?.play(); // カメラを再生する
            dispatch(changeButtonState()); // 3Dの視点固定を解除する
            isTakingPhoto.current = false; // 撮影ボタンの処理が終わったことを記録する
            showErrorToast("E004"); // 「"撮影画像のアップロードに失敗しました。」というメッセージを表示する
            return;
        }

        // リングデータを送信する
        postRingData(addedRingData);
        console.log("サーバーにデータを送信しました:\n", addedRingData);
        dispatch(pushTorusInfo(convertToTorus(addedRingData)));

        // 「ARリングの生成に成功しました。」というメッセージボックスを表示する
        showSuccessToast("I005");

        // 撮影した写真をダウンロードする
        if(!newImage) throw new Error("写真を撮影できませんでした");
        saveImage(newImage); // 取得した写真をダウンロードする
    }


    return (
        <div
            style={{
                width: "100%",
                display: "flex",
                justifyContent: isMdScreen ? "center" : "space-evenly",
                position: "absolute",
                bottom: "1rem",
            }}
        >
            <IconButton
                style={{
                    margin: isMdScreen ?`0 ${BUTTON_MARGIN}` : "0"
                }}
                aria-label="reset-view"
                color="primary"
                onClick={() =>{
                    if(isTakingPhoto.current) return; // 撮影ボタンの処理中なら、処理をやめる
                    orbitControlsReset();
                    initializePositionZ();
                }}
            >
                <CenterFocusWeak
                    style={{
                        width: ICON_SIZE,
                        height: ICON_SIZE
                    }}
                />
            </IconButton>
            <IconButton
                style={{
                    margin: isMdScreen ?`0 ${BUTTON_MARGIN}` : "0"
                }}
                aria-label="capture-display"
                color="primary"
                onClick={handleTakePhotoButton}
            >
                <DoubleCircleIcon
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    color={ICON_COLOR}
                />
            </IconButton>
            <IconButton
                style={{
                    margin: isMdScreen ?`0 ${BUTTON_MARGIN}` : "0"
                }}
                aria-label="switch-camera"
                color="primary"
                disabled={!enableBothCamera}
                onClick={() => {
                    if(isTakingPhoto.current) return; // 撮影ボタンの処理中なら、処理をやめる
                    switchCameraFacing(!buttonState)
                }}
            >
                {(cameraFacing === "out") ? (
                    <CameraFront
                        style={{
                            width: ICON_SIZE,
                            height: ICON_SIZE
                        }}
                    />
                ): ((cameraFacing === "in") ? (
                    <CameraRear
                        style={{
                            width: ICON_SIZE,
                            height: ICON_SIZE
                        }}
                    />
                ): (
                    <Cameraswitch
                        style={{
                            width: ICON_SIZE,
                            height: ICON_SIZE
                        }}
                    />
                ))}
            </IconButton>
        </div>
    );
};
