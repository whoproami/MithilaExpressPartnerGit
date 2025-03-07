import { createContext,FC, PropsWithChildren, useState  } from 'react';
import DatabaseService from './DatabaseService';

type DatabaseContextType = {
    appwritedb: DatabaseService      
}

export const DatabaseContext = createContext<DatabaseContextType>({
    appwritedb: new DatabaseService,
})

export const DatabaseProvider:FC<PropsWithChildren> = ({children}) =>{
    const defaultvalue ={
        appwritedb: new DatabaseService,
        }
    return(
        <DatabaseContext.Provider value={defaultvalue}>
            {children}
        </DatabaseContext.Provider>  
    )
}
export default DatabaseProvider;