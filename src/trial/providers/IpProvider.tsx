import { createContext, useState, ReactNode, useEffect } from 'react';

/* 型定義 */
// contextに渡すデータの型
type Context = {
    currentIp: string | null;
};

/* Provider */
const initialData: Context = {
    currentIp: null
};

export const IpContext = createContext<Context>(initialData);

// IPアドレスの状態を管理するプロバイダー
export function IpProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    const [currentIp, setCurrentIp] = useState<string | null>(null); // ユーザーのipアドレス

    /* useEffect等 */
    // アクティブなIPアドレスと前回登録したIPアドレスを比較した結果をipFlagにセット
    useEffect(() => {
        // 現在のIPアドレスを取得
        fetch('https://api.ipify.org?format=json').then(response => {
            const data: any = response.json();
            const newCurrentIp: string = data.ip;
            setCurrentIp(newCurrentIp); // useStateで現在のipを保管する
        });
    }, []);

    return (
        <IpContext.Provider
            value={{
                currentIp
            }}
        >
            {children}
        </IpContext.Provider>
    );
}