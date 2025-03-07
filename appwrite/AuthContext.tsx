import { createContext,FC, PropsWithChildren, useState  } from 'react';
import Appwrite from './AuthService';

type AppContextType = {
    appwrite: Appwrite
    isLoggedIn: boolean;
    setisLoggedIn: (isLoggedIn : boolean) => void;
    
}

export const AppwriteContext = createContext<AppContextType>({
    appwrite: new Appwrite,
    isLoggedIn: false,
    setisLoggedIn:()=>{},

})

export const AppwriteProvider:FC<PropsWithChildren> = ({children}) =>{
    const [isLoggedIn, setisLoggedIn] = useState(false);
    const defaultvalue ={
        appwrite: new Appwrite,
        isLoggedIn,
        setisLoggedIn,
        }
    return(
        <AppwriteContext.Provider value={defaultvalue}>
            {children}
        </AppwriteContext.Provider>  
    )
}
export default AppwriteProvider;