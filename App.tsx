import AppwriteProvider, { AppwriteContext } from './appwrite/AuthContext';


import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from './routes/AuthStack';
import { NavigationContainer } from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import Routes  from './routes/routes';

const App = () => {
    return (
        <GestureHandlerRootView style={{flex: 1}}>
        <AppwriteProvider>
            <NavigationContainer >
                <Routes />
            </NavigationContainer>
        </AppwriteProvider>
        </GestureHandlerRootView>
    )
}
export default App;