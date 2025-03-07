import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppwriteProvider, { AppwriteContext } from '../appwrite/AuthContext';
import Loading from '../Driver Screen/Loading.tsx';
import { useState } from 'react';
//Routes



import {AppStack} from "../routes/AppStack.tsx";
import { AuthStack } from '../routes/AuthStack.tsx';
import { View } from 'react-native';

const Routes =  () =>{
    const [isLoading,setisLoading] = useState<boolean>(true);
    const {appwrite,isLoggedIn,setisLoggedIn} = useContext(AppwriteContext);
    useEffect( ()=>{
        appwrite
        .getCurrentUser()
        .then(response=>{
            setisLoading(false);
            if(response?.status==true){
                console.log(response.status);
                setisLoggedIn(true);
                console.log(isLoggedIn);
            }
        })
        .catch(_ =>{
            // console.log("Hi");
            setisLoading(false);
            setisLoggedIn(false);
        })
    },[appwrite,isLoggedIn])
     if(isLoading){
        return <Loading />
     }

     return(

        isLoggedIn ? <AppStack/> : <AuthStack/>
           
     )

}
export default Routes;