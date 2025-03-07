import AppwriteProvider, { AppwriteContext } from './appwrite/AuthContext';


import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from './routes/AuthStack';
import { NavigationContainer } from '@react-navigation/native';
import Routes  from './routes/routes';

const App = () => {
    return (
        <AppwriteProvider>
            <NavigationContainer >
                <Routes />
            </NavigationContainer>
        </AppwriteProvider>

    )
}
export default App;