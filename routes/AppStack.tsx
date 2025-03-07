import { StyleSheet, Text, View } from "react-native";
import React from "react";

import Home from "../Driver Screen/Home";
import Welcome  from "../Driver Screen/Welcome";
import Profile from "../Driver Screen/Profile";
import History  from "../Driver Screen/History";


import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapSearch from "../components/MapSearch";
import RegistrationScreen from "../Driver Screen/RegistrationScreen";
import Notification from "../Driver Screen/Notification";


export type AppStackParamList = {
    Home: undefined,
    Signpage: undefined
    Starter: undefined,
    Loading: undefined,
    Welcome: undefined,
    Login: undefined,
    Profile: undefined,
    History: undefined,
    Notifications:undefined,
    
}

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack = () => {
    return (
        <Stack.Navigator  screenOptions={{
            headerShown: false
          }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="History" component={History} />
            <Stack.Screen name="Notifications" component={Notification} />


            

        </Stack.Navigator>
    )
}