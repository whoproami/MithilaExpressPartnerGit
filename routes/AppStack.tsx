import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import Home from '../Driver Screen/Home';
import Welcome from '../Driver Screen/Welcome';
import Profile from '../Driver Screen/Profile';
import History from '../Driver Screen/History';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MapSearch from '../components/MapSearch';
import RegistrationScreen from '../Driver Screen/RegistrationScreen';
import Notification from '../Driver Screen/Notification';
import VehicleInformation from '../components/VehicleInformation';
import DriverLicense from '../components/DriverLicense';
import RideInProgress from '../Driver Screen/RideInProgress';
import RideComplete from '../Driver Screen/RideComplete';
import WalletScreen from '../Driver Screen/Wallet';
import DocumentUpload from '../components/DocumentUpload';
import DocumentView from '../components/DocumentView';
import DocumentsManagement from '../components/DocumentsManagement';

export type AppStackParamList = {
  Home: undefined;
  Signpage: undefined;
  Starter: undefined;
  Loading: undefined;
  Welcome: undefined;
  Login: undefined;
  Profile: undefined;
  History: undefined;
  Notifications: undefined;
  RideInProgress: undefined;
  RideComplete: undefined;
  Wallet: undefined;
  VehicleInfo: undefined;
  DrivingLicense: undefined
  DocumentUpload: undefined;
  DocumentView: undefined;
  DocumentsManagement: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="History" component={History} />
      <Stack.Screen name="Notifications" component={Notification} />
      <Stack.Screen name="VehicleInfo" component={VehicleInformation} />
      <Stack.Screen name="DrivingLicense" component={DriverLicense} />
      <Stack.Screen name="RideInProgress" component={RideInProgress} />
      <Stack.Screen name="RideComplete" component={RideComplete} />
      <Stack.Screen
        name="Wallet"
        component={WalletScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DocumentsManagement"
        component={DocumentsManagement}
      />
      <Stack.Screen name="DocumentUpload" component={DocumentUpload} />
      <Stack.Screen name="DocumentView" component={DocumentView} />
    </Stack.Navigator>
  );
};
