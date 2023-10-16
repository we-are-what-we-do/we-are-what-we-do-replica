import { useContext } from "react";
import { postNftImage, postRingData } from './../api/fetchDb';
import { RingData } from "../redux/features/handleRingData";
import { CaptureContext } from "./../providers/CaptureProvider";
import { CameraContext } from "./../providers/CameraProvider";
import { RingContext } from "./../providers/RingProvider";
import { IpContext } from "../providers/IpProvider";
import { GpsContext } from "../providers/GpsProvider";
import { DbContext } from "../providers/DbProvider";
import { showErrorToast, showInfoToast, showConfirmToast } from "./ToastHelpers"
import DoubleCircleIcon from "./DoubleCircleIcon";
import { Theme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Refresh from '@mui/icons-material/Refresh';
import CameraRear from '@mui/icons-material/CameraRear';
import CameraFront from '@mui/icons-material/CameraFront';
import Cameraswitch from '@mui/icons-material/Cameraswitch';
import { ICON_SIZE, ICON_COLOR, DISABLED_COLOR, BUTTON_MARGIN } from "./../App";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../redux/store";
import { changeVisibility } from "../redux/features/animeVisible-slicec";


// ボタン類のコンポーネント
export default function ButtonArea(props: {
    theme: Theme;
    enableOrbitControl: boolean;
    setEnableOrbitControl: React.Dispatch<React.SetStateAction<boolean>>;
    hasPostRing: React.MutableRefObject<boolean>;
    initializePositionZ(): void;
    orbitControlsReset(): void;
}) {
    /* useState等 */
    const {
        theme,
        enableOrbitControl,
        setEnableOrbitControl,
        hasPostRing,
        initializePositionZ,
        orbitControlsReset
    } = props;

    // サーバーからリングデータを取得するためのcontext
    const {
        initializeRingData
    } = useContext(DbContext);

    // IPの状態を管理するcontext
    const {
        // ipFlag
    } = useContext(IpContext);
    const ipFlag: boolean = true;// TODO 連続撮影機能(テスト)を削除する

    // GPSの状態を管理するcontext
    const {
        // gpsFlag
    } = useContext(GpsContext);
    const gpsFlag: boolean = true;// TODO どこでもリング表示機能(テスト)を削除する

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

    //リング追加できなかったので作りました（trueにしたらリング追加できます）
    const isDev = false;
    const { addTorus, usedOrbitIndexes } = useContext(RingContext);
    const buttonHandle = async () => {
        if (isDev) {
            addTorus(usedOrbitIndexes);
        } else {
            await handleTakePhotoButton();
        }
    }

    /* 関数定義 */
    // 撮影ボタンを押したときの処理
    async function handleTakePhotoButton(): Promise<void>{
        // 撮影する写真に確認を取る
        if(hasPostRing.current) console.log("2回目以降の撮影を行います\n(リングデータの送信は行いません)");
        videoRef.current?.pause();    // カメラを一時停止する
        setEnableOrbitControl(false); // 3Dの視点を固定する
        dispatch(changeVisibility()); //アニメ非表示

        // 写真(リング+カメラ)を撮影をして、base64形式で取得する
        const newImage: string | null = captureImage();

        // 撮影した写真に確認を取る
        const isPhotoOk: boolean = await showConfirmToast(); // 「撮影画像はこちらでよいですか」というメッセージボックスを表示する
        console.log("isPhotoOk: ", isPhotoOk);

        // 撮影した写真に承諾が取れたら、サーバーにリングを送信する
        if(isPhotoOk){
            // 描画に追加したリングのデータを取得する
            const addedRingData: RingData | null = getRingDataToAdd();

            // エラーハンドリング
            if(!addedRingData){
                console.error("追加したリングデータを取得できませんでした");
                return;
            }; 
            if(!newImage){
                console.error("写真を撮影できませんでした");
                return;
            }

            // リングデータを送信する
            if((!Boolean(ipFlag)) || (hasPostRing.current)){
                // 連続撮影になる場合
                // あるいは既にリングデータを送信済みの場合
                // 写真ダウンロードのみ行う
                if(!Boolean(ipFlag)){
                    console.error("連続撮影はできません");
                }else{
                    console.error("既にリングデータをサーバーに送信済みです");
                }
                showInfoToast("I002"); // 「連続撮影はできません。」というメッセージボックスを表示する
            }else{
                try{
                    // リングデータをまだ送信していない場合、リングデータを送信する
                    await postRingData(addedRingData); // サーバーにリングデータを送信する
                    await postNftImage(newImage); // base64形式の画像をサーバーに送信する
                    console.log("サーバーにデータを送信しました:\n", addedRingData);

                    // リングデータを送信済みとしてrefを更新する
                    hasPostRing.current = true;

                    // 「ARリングの生成に成功しました。」というメッセージボックスを表示する
                    showInfoToast("I005");

                    }catch(error){
                        // サーバーにリングデータを送信できなかった際のエラーハンドリング
                        console.error(
                            "サーバーにデータを送信できませんでした", "\n",
                            "以下の可能性があります", "\n",
                            "- 送信しようとしたリングデータがコンフリクトを起こした", "\n",
                            "- サーバーにアクセスできない", "\n",
                            error
                        );
                        await initializeRingData();
                        showErrorToast("E005"); // 「再度、お試しください。」というメッセージボックスを表示する
                    }
                };

                // 撮影した写真をダウンロードする
                saveImage(newImage);
        }else{
            // 再撮影を望む場合、処理を止める
            // console.log("撮影やり直しのために処理を中断しました");
        }

        videoRef.current?.play();      // カメラを再生する
        setEnableOrbitControl(true);   // 3Dの視点固定を解除する
        dispatch(changeVisibility());  //アニメ非表示
    }

    const dispatch = useDispatch<AppDispatch>();

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
                    orbitControlsReset();
                    initializePositionZ();
                }}
            >
                <Refresh
                    style={{
                        width: ICON_SIZE,
                        height: ICON_SIZE
                    }}
                    color="primary"
                />
            </IconButton>
            <IconButton
                style={{
                    margin: isMdScreen ?`0 ${BUTTON_MARGIN}` : "0"
                }}
                aria-label="capture-display"
                color="primary"
                onClick={buttonHandle}
                disabled={!Boolean(gpsFlag)}
            >
                <DoubleCircleIcon
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    color={Boolean(gpsFlag) ? ICON_COLOR : DISABLED_COLOR}
                />
            </IconButton>
            <IconButton
                style={{
                    margin: isMdScreen ?`0 ${BUTTON_MARGIN}` : "0"
                }}
                aria-label="switch-camera"
                color="primary"
                disabled={!enableBothCamera}
                onClick={() => switchCameraFacing(enableOrbitControl)}
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