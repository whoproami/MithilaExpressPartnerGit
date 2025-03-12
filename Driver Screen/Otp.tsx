import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard
} from 'react-native';
import { AppwriteContext } from '../appwrite/AuthContext';
import Snackbar from 'react-native-snackbar';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../routes/AuthStack';

type OtpScreenProps = NativeStackScreenProps<AuthStackParamList, 'Otp'>;

const Otpscreen = ({navigation, route}: OtpScreenProps) => {
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const {appwrite, isLoggedIn, setisLoggedIn} = useContext(AppwriteContext);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef(null);
  
  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    // Cleanup function
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleVerifyOTP = () => {
    if (!email || !password) {
      Snackbar.show({
        text: 'Please enter both email and password',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    
    appwrite.login({email, password})
      .then((response) => {
        console.log(response);
        if(response){
          setisLoggedIn(true);
          Snackbar.show({
            text: 'Login successful!',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        Snackbar.show({
          text: 'Login failed. Please check your credentials.',
          duration: Snackbar.LENGTH_SHORT,
        });
      });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}
        enabled={keyboardVisible}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="always"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require('../assets/images/Register.jpg')}
            style={styles.image}
          />
          <Text style={styles.header}>Welcome Back</Text>
          <Text style={styles.subHeader}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#A0A0A0"
              onChangeText={text => setemail(text)}
              keyboardType="email-address"
              maxLength={30}
              value={email}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              placeholderTextColor="#A0A0A0"
              onChangeText={text => setpassword(text)}
              secureTextEntry={true}
              maxLength={15}
              value={password}
            />
          </View>

          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => {/* Handle forgot password */}}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleVerifyOTP}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            New Driver?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('Signup')}
            >
              Register Here
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  image: {
    width: 300,
    height: 200,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 26,
    fontFamily: 'Montserrat-Bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans-Semibold',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#EEF2F5',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    color: 'black',
    backgroundColor: '#F7F8FA',
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007BFF',
    fontFamily: 'OpenSans-Regular',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#E88801',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  loginButtonText: {
    color: '#FFF',
    fontFamily: 'OpenSans-Bold',
    fontSize: 16,
  },
  footerText: {
    textAlign: 'center',
    color: '#666',
    fontFamily: 'OpenSans-Regular',
    marginBottom: 20,
  },
  registerLink: {
    color: '#007BFF',
    fontFamily: 'OpenSans-Bold',
  },
});

export default Otpscreen;