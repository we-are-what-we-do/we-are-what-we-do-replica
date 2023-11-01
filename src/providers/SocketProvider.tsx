import { createContext, ReactNode, useEffect, useRef } from 'react';
import { API_DOMAIN } from '../api/fetchDb';


/* 定数定義 */
const WS_URL: string = `wss://${API_DOMAIN}/ws-rings?location=36e94259-ceda-49fd-b6f7-29df955adfff`;


/* 型定義 */
// contextに渡すデータの型
type Context = {
    hasPostRing: React.MutableRefObject<boolean>;
    socketRef: React.MutableRefObject<WebSocket | null>;
};


/* Provider */
const initialData: Context = {
    hasPostRing: {} as React.MutableRefObject<boolean>,
    socketRef: {} as React.MutableRefObject<WebSocket | null>
};

export const SocketContext = createContext<Context>(initialData);

// websocketを管理するプロバイダー
export function SocketProvider({children}: {children: ReactNode}){
    // 既にリングを追加したかどうかを管理するref
    const hasPostRing = useRef<boolean>(false);

    const socketRef = useRef<WebSocket | null>(null);

    // #0.WebSocket関連の処理は副作用なので、useEffect内で実装
    useEffect(() => {
        // #1.WebSocketオブジェクトを生成しサーバとの接続を開始
        const websocket = new WebSocket(WS_URL);
        console.log("websocket:", websocket);
        socketRef.current = websocket;

        // #2.メッセージ受信時のイベントハンドラを設定
        // const onMessage = (event: MessageEvent<string>) => {
        //     setMessage(event.data)
        // }
        // websocket.addEventListener('message', onMessage)

        // #3.useEffectのクリーンアップの中で、WebSocketのクローズ処理を実行
        return () => {
            websocket.close();
            // websocket.removeEventListener('message', onMessage)
        }
    }, [])

    return (
        <SocketContext.Provider
            value={{
                hasPostRing,
                socketRef
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}