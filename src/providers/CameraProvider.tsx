import { ReactNode, createContext, useState, useEffect, useRef } from 'react';
import { showErrorToast } from '../components/ToastHelpers';


/* 型定義 */
// contextに渡すデータの型
type CameraContext = {
    videoRef: React.RefObject<HTMLVideoElement>;
    cameraFacing: "out" | "in" | "other" | null;
    switchCameraFacing(isNotCapturing: boolean): Promise<void>;
    enableBothCamera: boolean;
};


/* Provider */
const initialData: CameraContext = {
    videoRef: {} as React.RefObject<HTMLVideoElement>,
    cameraFacing: null,
    switchCameraFacing: () => Promise.resolve(),
    enableBothCamera: false
};

export const CameraContext = createContext<CameraContext>(initialData);

// 写真撮影(リング+カメラ)のためのプロバイダー
export function CameraProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    const [cameraFacing, setCameraFacing] = useState<"out" | "in" | "other" | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentStream, setCurrentStream] = useState<MediaStream | null>(null); // 現在のstreamを保存する
    const [enableBothCamera, setEnableBothCamera] = useState<boolean>(false); // インカメラ, アウトカメラが両方有効かどうか

    /* useEffect等 */
    // 初回レンダリング時、カメラに接続する
    useEffect(() => {
        initCamera().then((newStream) => {
            setCurrentStream(newStream);
        });
    }, []);


    /* 関数定義 */
    // カメラに初回接続する関数
    async function initCamera(): Promise<MediaStream | null>{
        // カメラ接続を試みる
        let stream: MediaStream | null = null;

        // デフォルトはアウトカメラ接続
        const outStream: MediaStream | null = await accessCamera("out");

        // アウトカメラ接続がダメなら、インカメラ接続も試す
        const inStream: MediaStream | null = await accessCamera("in");

        // アウトカメラ接続もインカメラ接続がダメなら、デフォルトカメラ接続を試す
        let otherStream: MediaStream | null = null;
        if((!outStream) && (!inStream)){
            otherStream = await accessCamera("other");
        };

        if(outStream || inStream || otherStream){
            // いずれかのカメラ接続に成功した場合
            console.log("カメラのアクセスに成功");
            // window.alert("カメラのアクセスに成功");

            // アウトカメラ > インカメラ > 他カメラの優先度でstreamを設定する
            if(outStream){
                stream = outStream;
                setCameraFacing("out");
            }else if(inStream){
                stream = inStream;
                setCameraFacing("in");
            }else if(otherStream){
                stream = otherStream;
                setCameraFacing("other");
            }

            // インカメラ, アウトカメラの両方が有効かどうかを保存しておく
            if(outStream && inStream){
                setEnableBothCamera(true);
            }

            // video要素のsrcObjectにカメラを設定する
            if(videoRef.current){
                videoRef.current.srcObject = stream;
            };
        }else{
            // アウトカメラとインカメラ両方に接続できなかった場合
            console.error("カメラのアクセスに失敗");
            showErrorToast("E001"); // 「カメラの許可が必要です」というメッセージボックスを表示する
        };
        return stream;
    }

    // インカメラ/アウトカメラを切り替える関数
    async function switchCameraFacing(isNotCapturing: boolean): Promise<void>{
        // 例外処理
        if(!isNotCapturing){
            // 撮影処理、撮影確認待機中の場合はカメラの切り替えを防止する
            console.error("撮影処理中のためカメラを切り替えられません");
            return;
        }
        if(!enableBothCamera){
            // カメラが許可されていない場合、処理しない
            console.error("両面のカメラが許可されていません");
            showErrorToast("E099"); // 「システムエラー」というメッセージボックスを表示する
            return;
        }
        if(!(cameraFacing === "out" || cameraFacing === "in")){
            // 現在インカメラ, アウトカメラのどちらでもない場合、処理しない
            console.error("現在使用しているカメラは、前面カメラでも背面カメラでもありません");
            showErrorToast("E099"); // 「システムエラー」というメッセージボックスを表示する
            return;
        }

        let stream: MediaStream | null = null;
        let nextFacing: "out" | "in" = (cameraFacing === "out") ? "in" : "out"; // 切り替え先のカメラの向き

        // 直前のストリームを停止する
        if(currentStream){
            currentStream.getVideoTracks().forEach((camera) => {
                camera.stop();
                // console.log("camera stop");
            });
        }

        // カメラを切り替える
        stream = await accessCamera(nextFacing); // もう一方のカメラに接続を試みる
        if(!videoRef.current) return;
        if(stream){
            // カメラ切り替えが成功した場合、video要素のsrcObjectにカメラを設定する
            videoRef.current.srcObject = stream;
            setCameraFacing(nextFacing);
        }else{
            console.error("カメラを切り替えられませんでした");
            showErrorToast("E099"); // 「システムエラー」というメッセージボックスを表示する

            // カメラ切り替えが失敗した場合、切り替え前のカメラに戻しておく
            stream = await accessCamera(cameraFacing);
            if(!stream) throw new Error("切り替え前のカメラの向きに戻せませんでした");
            videoRef.current.srcObject = stream;
        };
    }

    // カメラにアクセスする関数
    async function accessCamera(cameraFacing: "out" | "in" | "other"): Promise<MediaStream | null>{
        let stream: MediaStream | null = null;

        // カメラに接続を試みる
        try{
            if(cameraFacing === "out"){
                // カメラの向きをアウトカメラに設定
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { exact: "environment" } // カメラの向きを設定する
                    }
                });
            }else if (cameraFacing === "in"){
                // カメラの向きをインカメラに設定
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user" // カメラの向きを設定する
                    }
                });
            }else{
                // カメラの向きを設定しない
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
            };
        }catch(error){
            // アウトカメラの接続に失敗した際のエラーハンドリング
        };

        return stream;
    }



    return (
        <CameraContext.Provider
            value={{
                videoRef,
                cameraFacing,
                switchCameraFacing,
                enableBothCamera
            }}
        >
            {children}
        </CameraContext.Provider>
    );
}