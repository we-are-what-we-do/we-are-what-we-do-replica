import { createContext, useState, ReactNode, useEffect, useContext } from 'react';
import { DbContext } from './DbProvider';


/* 型定義 */
// contextに渡すデータの型
type Context = {
    ipFlag: number;
    currentIp: string | null;
};


/* Provider */
const initialData: Context = {
    ipFlag: 0,
    currentIp: null
};

export const IpContext = createContext<Context>(initialData);

// IPアドレスの状態を管理するプロバイダー
export function IpProvider({children}: {children: ReactNode}){
    /* useState, useContext等 */
    const [ipFlag, setIpFlag] = useState<number>(0); // ipアドレスが取得できているかどうかのフラグ
    const [currentIp, setCurrentIp] = useState<string | null>(null); // ユーザーのipアドレス

    // サーバーから取得したリングデータを管理するcontext
    const {
        latestRing
    } = useContext(DbContext);


    /* useEffect等 */
    // アクティブなIPアドレスと前回登録したIPアドレスを比較した結果をipFlagにセット
    useEffect(() => {
        compareCurrentIPWithLastIP().then(result => {
            setIpFlag(result);
            // console.log(`ipFlag : ${result}`);
        });
    }, [latestRing]);


    /* 関数定義 */
    // アクティブなIPアドレスと前回登録したIPアドレスを比較する関数
    async function compareCurrentIPWithLastIP() : Promise<number> {
        // ipFlagの戻り値 デフォルト0
        let result = 0;
        
        try {
            // 現在のIPアドレスを取得
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const newCurrentIp: string = data.ip;
            setCurrentIp(newCurrentIp); // useStateで現在のipを保管する
            // console.log(`Your current IP is: ${newCurrentIp}`);

            // 前回登録時のIPアドレスを取得
            const lastIP: string | null = latestRing?.address ?? null;
            // console.log(`LatestRing user IP is: ${lastIP}`);
            
            if (newCurrentIp !== lastIP) {
                result = 1; // IPアドレスが異なる場合、resultを1に設定
            }
        } catch (error) {
            console.error("Error fetching GeoJSON Point data or getting current location:", error);
        }
        return result; 
    }


    return (
        <IpContext.Provider
            value={{
                ipFlag,
                currentIp
            }}
        >
            {children}
        </IpContext.Provider>
    );
}