import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterPage from "../Driver Screen/RegisterPage";
import Starter from "../Driver Screen/Starter";
import Welcome from "../Driver Screen/Welcome";
import Otpscreen from "../Driver Screen/Otp";

export type AuthStackParamList = {
    Signup:undefined;
    Login:undefined;
    Otp: undefined;
    Welcome:undefined
    Starter:undefined
}

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () =>{
    return (
        <Stack.Navigator  screenOptions={{
            headerShown: false
          }} >
            <Stack.Screen name="Starter" component={Starter}/>
            <Stack.Screen name="Welcome" component={Welcome} />
            <Stack.Screen name="Signup" component={RegisterPage}/>
            <Stack.Screen name="Otp" component={Otpscreen}/>

        </Stack.Navigator>
    )
}