import { ReactNode, createContext, useState, useEffect, useRef } from 'react';


/* 型定義 */
// contextに渡すデータの型
type CameraContext = {
    videoRef: React.RefObject<HTMLVideoElement>;
    cameraFacing: "out" | "in" | null;
    switchCameraFacing(): Promise<void>;
};


/* Provider */
const initialData: CameraContext = {
    videoRef: {} as React.RefObject<HTMLVideoElement>,
    cameraFacing: null,
    switchCameraFacing: () => Promise.resolve()
};

export const CameraContext = createContext<CameraContext>(initialData);

// 写真撮影(リング+カメラ)のためのプロバイダー
export function CameraProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    const [cameraFacing, setCameraFacing] = useState<"out" | "in" | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [latestStream, setLatestStream] = useState<MediaStream | null>(null); // 現在のstreamを保存する

    /* useEffect等 */
    // 初回レンダリング時、カメラに接続する
    useEffect(() => {
        initCamera().then((newStream) => {
            setLatestStream(newStream);
        });
    }, []);


    /* 関数定義 */
    // カメラに初回接続する関数
    async function initCamera(): Promise<MediaStream | null>{
        // カメラ接続を試みる
        let stream: MediaStream | null = null;

        // デフォルトはアウトカメラ接続
        stream = await accessCamera("out");

        // アウトカメラ接続がダメなら、インカメラ接続も試す
        if(stream === null){
            stream = await accessCamera("in");
        };

        if(stream){
            // アウトカメラorインカメラのアクセスに成功した場合
            console.log("カメラのアクセスに成功");
            // window.alert("カメラのアクセスに成功");

            // video要素のsrcObjectにカメラを設定する
            if(videoRef.current){
                videoRef.current.srcObject = stream;
            };
        }else{
            // アウトカメラとインカメラ両方に接続できなかった場合
            console.error("カメラのアクセスに失敗");
            window.alert("アプリを使用するにはカメラの許可が必要です");
        };
        return stream;
    }

    // インカメラ/アウトカメラを切り替える関数
    async function switchCameraFacing(): Promise<void>{
        if(cameraFacing === null) return; // カメラが許可されていない場合、処理しない
        let stream: MediaStream | null = null;
        let nextFacing: "out" | "in" = (cameraFacing === "out") ? "in" : "out"; // 切り替え先のカメラの向き

        // カメラを切り替える
        // stream = await accessCamera(nextFacing); // もう一方のカメラに接続を試みる
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "user" // カメラの向きを設定する
            }
        });

        if(stream && videoRef.current){
            // カメラ切り替えが成功した場合、video要素のsrcObjectにカメラを設定する
            videoRef.current.srcObject = stream;
            setCameraFacing(nextFacing);
        }else{
            console.error("カメラを切り替えられませんでした");
            window.alert("申し訳ございません、カメラを切り替えられませんでした。");
            alert(`stream:${stream}, \nvideoRef.current${videoRef.current}`)
        };
    }

    // カメラにアクセスする関数
    async function accessCamera(cameraFacing: "out" | "in"): Promise<MediaStream | null>{
        let stream: MediaStream | null = null;

        // カメラの向きを決定する
        let facingMode: object | string = {};
        if(cameraFacing === "out"){
            facingMode = { exact: "environment" }; // カメラの向きをアウトカメラに設定
        }else{
            facingMode = "user"; // カメラの向きをインカメラに設定
        };

        // カメラに接続を試みる
        try{
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode // カメラの向きを設定する
                }
            });
        }catch(error){
            // アウトカメラの接続に失敗した際のエラーハンドリング
        };

        setCameraFacing(cameraFacing); // 接続に成功したカメラの向きをuseStateで保持する

        return stream;
    }



    return (
        <CameraContext.Provider
            value={{
                videoRef,
                cameraFacing,
                switchCameraFacing
            }}
        >
            {children}
        </CameraContext.Provider>
    );
}