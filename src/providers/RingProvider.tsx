import { createContext, useState, ReactNode, useEffect } from 'react';

/* 型定義 */
// contextに渡すデータの型
type RingContent = {

};


/* Provider */
const initialData: RingContent = {

};

export const RingContext = createContext<RingContent>(initialData);

export function RingProvider({children}: {children: ReactNode}){

    return (
        <RingContext.Provider
            value={{

            }}
        >
            {children}
        </RingContext.Provider>
    );
}