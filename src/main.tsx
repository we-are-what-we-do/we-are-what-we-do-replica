import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Providers } from './redux/provider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>,
)


//テスト用コード(コンソール上で実行)
declare global {
  interface Window {
      testDeleteData(): void;
  }
}
window.testDeleteData = async function (): Promise<void>{ // firebase(仮DB)のデータを削除する
  fetch("https://wawwdtestdb-default-rtdb.firebaseio.com/rings.json", {
    method: 'DELETE'
  });
}