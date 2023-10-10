import { useContext } from "react";
import { postNftImage, postRingData } from './../api/fetchDb';
import { RingData } from "../redux/features/handleRingData";
import { CaptureContext } from "./../providers/CaptureProvider";
import { CameraContext } from "./../providers/CameraProvider";
import { RingContext } from "./../providers/RingProvider";
import { IpContext } from "../providers/IpProvider";
import { showErrorToast, showInfoToast, showConfirmToast } from "./ToastHelpers"
import DoubleCircleIcon from "./DoubleCircleIcon";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Refresh from '@mui/icons-material/Refresh';
import CameraRear from '@mui/icons-material/CameraRear';
import CameraFront from '@mui/icons-material/CameraFront';
import Cameraswitch from '@mui/icons-material/Cameraswitch';


/* 定数定義 */
const ICON_SIZE: string = "5rem"; // ボタンの大きさ
const ICON_COLOR: string = "#FFFFFF"; // ボタンの色
const DISABLED_COLOR: string = "rgba(0, 0, 0, 0.26)"; // 無効なボタンの色


// MUIのスタイルテーマ
const theme = createTheme({
    palette: {
        primary: {
            main: ICON_COLOR // プライマリーカラー(ボタンの色)を設定
        }
    },
    components: {
        MuiIconButton: {
            styleOverrides: {
                root: {
                    "&:disabled": {
                        color: DISABLED_COLOR
                    }
                }
            }
        }
    }
});


// ボタン類のコンポーネント
export default function ButtonArea(props: {
    enableOrbitControl: boolean;
    setEnableOrbitControl: React.Dispatch<React.SetStateAction<boolean>>;
    hasPostRing: React.MutableRefObject<boolean>;
    initializePositionZ(width: number): void;
}) {
    /* useState等 */
    const {
        enableOrbitControl,
        setEnableOrbitControl,
        hasPostRing,
        initializePositionZ
    } = props;

    // GPSの状態を管理するcontext
    const {
        ipFlag
    } = useContext(IpContext);

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


    /* 関数定義 */
    // 撮影ボタンを押したときの処理
    async function handleTakePhotoButton(): Promise<void>{
        // 撮影する写真に確認を取る
        if(hasPostRing.current) console.log("2回目以降の撮影を行います\n(リングデータの送信は行いません)");
        videoRef.current?.pause(); // カメラを一時停止する
        setEnableOrbitControl(false); // 3Dの視点を固定する

        // 写真(リング+カメラ)を撮影をして、base64形式で取得する
        const newImage: string | null = captureImage();

        // 撮影した写真に確認を取る
        const isPhotoOk: boolean = await showConfirmToast(); // 「撮影画像はこちらでよいですか」というメッセージボックスを表示する

        if(isPhotoOk){
        // 撮影した写真に承諾が取れたら、サーバーにリングを送信する
            try{
                // 描画に追加したリングのデータを取得する
                const addedRingData: RingData | null = getRingDataToAdd();

                // エラーハンドリング
                if(!addedRingData) throw new Error("追加したリングデータを取得できませんでした");
                if(!newImage) throw new Error("写真を撮影できませんでした");

                // リングデータを送信する
                // if((hasPostRing.current) || (!Boolean(ipFlag))){
                if(hasPostRing.current){ // TODO 条件を修正し、連続撮影を防ぐ
                    // 連続撮影になる場合
                    // あるいは既にリングデータを送信済みの場合
                    // 写真ダウンロードのみ行う
                    if(hasPostRing.current) console.error("既にリングデータをサーバーに送信済みです");
                    if(!Boolean(ipFlag)) console.error("連続撮影はできません");
                    showInfoToast("I002"); // 「連続撮影はできません。」というメッセージボックスを表示する
                }else{
                    // リングデータをまだ送信していない場合、リングデータを送信する
                    await postRingData(addedRingData); //サーバーにリングデータを送信する
                    await postNftImage(newImage); // base64形式の画像をサーバーに送信する
                    console.log("サーバーにデータを送信しました:\n", addedRingData);

                    hasPostRing.current = true; // リングデータを送信済みとしてstateを更新する

                    // 「ARリングの生成に成功しました。」というメッセージボックスを表示する
                    showInfoToast("I005");
                };

                // 撮影した写真をダウンロードする
                saveImage(newImage);
            }catch(error){
                // サーバーにリングデータを送信できなかった際のエラーハンドリング
                console.error("サーバーにデータを送信できませんでした\n以下の可能性があります\n- 送信しようとしたリングデータがコンフリクトを起こした\n- サーバーにアクセスできない\n", error);
                showErrorToast("E099"); // 「しばらく待ってから再度お試しください。」というメッセージボックスを表示する
            }
        }else{
            // 再撮影を望む場合、処理を止める
            // console.log("撮影やり直しのために処理を中断しました");
        }

        videoRef.current?.play(); // カメラを再生する
        setEnableOrbitControl(true); // 3Dの視点固定を解除する
    }


    return (
        <ThemeProvider theme={theme}>
            <Stack
                direction="row"
                spacing={1}
                style={{
                    position: "absolute",
                    top: "80%",
                    width: "100%"
                }}
            >
                <IconButton
                    aria-label="reset-view"
                    color="secondary"
                    onClick={() =>{
                        const width: number = window.innerWidth;
                        initializePositionZ(width);
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
                    aria-label="switch-camera"
                    color="primary"
                    // disabled={!enableBothCamera}
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
            </Stack>
        </ThemeProvider>
    );
};