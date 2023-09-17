import { createContext, useState, useEffect, ReactNode } from 'react';

type DbContent = {

};

const initialData: DbContent = {

};

export const DbContext = createContext<DbContent>(initialData);

export function DbProvider({children}: {children: ReactNode}){

    useEffect(() => {

    }, [])

    return (
        <DbContext.Provider
            value={{

            }}
        >
            {children}
        </DbContext.Provider>
    );
}