import { ReactNode, createContext, useEffect, useRef, useContext } from 'react';
import { WebGLRenderer } from "three";
import { saveAs } from "file-saver";
import { CameraContext } from './CameraProvider';


/* 型定義 */
// contextに渡すデータの型
type CaptureContext = {
    captureImage: () => string | null;
    saveImage: (dataURL: string) => void;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    getVideoCanvas: () => HTMLCanvasElement | null;
};


/* Provider */
const initialData: CaptureContext = {
    captureImage: () => null,
    saveImage: () => {},
    canvasRef: {} as React.RefObject<HTMLCanvasElement>,
    getVideoCanvas: () => null
};

export const CaptureContext = createContext<CaptureContext>(initialData);

// 写真撮影(リング+カメラ)のためのプロバイダー
export function CaptureProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const { videoRef } = useContext(CameraContext);


    /* useEffect等 */
    useEffect(() => {
        if (canvasRef.current) {
        const renderer: WebGLRenderer = new WebGLRenderer({ canvas: canvasRef.current, preserveDrawingBuffer: true });
        rendererRef.current = renderer;
        }
    }, []);


    /* 関数定義 */
    // カメラとリングのcanvas要素を合成して、base64形式の画像を返す関数
    function captureImage(): string | null{
        // カメラとリングのcanvas要素を、それぞれ取得する
        const ringCanvas: HTMLCanvasElement | null = captureRingImage();
        const cameraCanvas: HTMLCanvasElement | null = getVideoCanvas();
        if(!ringCanvas) return null;
        if(!cameraCanvas) return null;

        // 2つのcanvas要素を合成したものを貼り付けるためのcanvas要素を作成する
        const canvasElement: HTMLCanvasElement = document.createElement("canvas");
        const width: number = cameraCanvas.width;
        const height: number = cameraCanvas.height;
        canvasElement.width = width;
        canvasElement.height = height;

        // 作成したcanvasに、2つのcanvas要素を貼り付ける
        const canvasCtx: CanvasRenderingContext2D | null = canvasElement.getContext("2d");
        if(!canvasCtx) return null;
        canvasCtx.drawImage(cameraCanvas, 0, 0, width, height); // カメラを貼り付ける
        canvasCtx.drawImage(ringCanvas, 0, 0, width, height); // リングを貼り付ける

        // base64として出力する
        const dataURL: string = canvasElement.toDataURL('image/png');
        // console.log(dataURL);
        return dataURL;
    }

    // カメラのvideo要素からcanvas要素を取得する関数
    function getVideoCanvas(): HTMLCanvasElement | null{
        // video要素を取得する
        const videoElement: HTMLVideoElement | null = videoRef.current;
        if(!videoElement) return null;

        // video要素とwindowの横幅, 縦幅を取得する
        const videoRect: DOMRect = videoElement.getBoundingClientRect();
        const videoWidth: number = videoRect.width; // videoの横幅を取得
        const videoHeight: number = videoRect.height; // videoの縦幅を取得
        const windowWidth: number = window.innerWidth; // windowの横幅を取得
        const windowHeight: number = window.innerHeight; // windowの縦幅を取得
        /* console.log(
            "videoWidth: ", videoWidth,
            "\nvideoHeight: ", videoHeight,
            "\nwindowWidth: ", windowWidth,
            "\nwindowHeight: ", windowHeight
        ) */
        const videoAspectRatio: number = videoWidth / videoHeight; // videoのアスペクト比を取得
        const windowAspectRatio: number = windowWidth / windowHeight; // windowのアスペクト比を取得
        /* console.log(
            "videoAspectRatio: ", videoAspectRatio,
            "\nwindowAspectRatio: ", windowAspectRatio
        ) */

        // video要素の描画を貼り付けるためのcanvas要素を作成する
        const canvasElement: HTMLCanvasElement = document.createElement("canvas");
        // ウィンドウのサイズにcanvasを合わせる
        const canvasWidth: number = windowWidth;
        const canvasHeight: number = windowHeight;
        canvasElement.width = canvasWidth;
        canvasElement.height = canvasHeight;

        // 作成したcanvas要素にvideo要素の描画を貼り付けるためのctxを取得する
        const canvasCtx: CanvasRenderingContext2D | null = canvasElement.getContext('2d');
        if(!canvasCtx) return null;

        // アスペクト比や、カメラの位置を調整する
        let width: number = 10;
        let height: number = 10;
        let top: number = 0;
        let left: number = 0;
        if(windowAspectRatio > videoAspectRatio) {
            // windowのアスペクト比がvideoよりも横長の場合
            // console.log("画面が、カメラに比べて横長です");
            width = windowWidth;
            height = videoHeight;
        }else{
            // windowのアスペクト比がvideoよりも縦長の場合
            // console.log("画面が、カメラに比べて縦長です");
            width = videoWidth;
            height = windowHeight;
            left = - Math.abs(windowWidth - videoWidth) / 2;
        }

        // 作成したcanvas要素にvideo要素の描画を貼り付ける
        canvasCtx.drawImage(videoElement, left, top, width, height);
        return canvasElement;
    }

    // リングのcanvas要素を取得する関数
    function captureRingImage(): HTMLCanvasElement | null{
        if (rendererRef.current) {
            const renderer: WebGLRenderer = rendererRef.current;
            const canvasElement: HTMLCanvasElement = renderer.domElement;
            return canvasElement;
        }else{
            return null;
        }
    };

    // base64形式の画像を画像ファイルとしてダウンロードする関数
    function saveImage(dataURL: string): void{
        // DataURLからBlobを作成
        const blob: Blob = dataURLToBlob(dataURL);

        // 'file-saver'ライブラリを使ってダウンロード
        saveAs(blob, "screenshot.png");
    };

    // base64形式の画像からBlobオブジェクトを作成する関数
    function dataURLToBlob(dataURL: string): Blob{
        const byteString = window.atob(dataURL.split(",")[1]);
        const mimeString = dataURL.split(",")[0].split(":")[1].split(";")[0];
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
        }
        return new Blob([uint8Array], { type: mimeString });
    };


    return (
        <CaptureContext.Provider
            value={{
                captureImage,
                saveImage,
                canvasRef,
                getVideoCanvas
            }}
        >
            {children}
        </CaptureContext.Provider>
    );
}