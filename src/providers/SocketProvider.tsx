import { createContext, ReactNode, useRef } from 'react';


/* 型定義 */
// contextに渡すデータの型
type Context = {
    hasPostRing: React.MutableRefObject<boolean>
};


/* Provider */
const initialData: Context = {
    hasPostRing: {} as React.MutableRefObject<boolean>
};

export const SocketContext = createContext<Context>(initialData);

// websocketを管理するプロバイダー
export function SocketProvider({children}: {children: ReactNode}){
    // 既にリングを追加したかどうかを管理するref
    const hasPostRing = useRef<boolean>(false);

    return (
        <SocketContext.Provider
            value={{
                hasPostRing
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}