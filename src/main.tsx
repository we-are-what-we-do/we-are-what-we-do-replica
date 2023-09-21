import React from 'react'
import ReactDOM from 'react-dom/client'
import Test from './components/Test.tsx'
import './index.css'
import { Providers } from './redux/provider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Providers>
      <Test />
    </Providers>
  </React.StrictMode>,
)