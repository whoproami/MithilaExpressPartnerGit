import React, { useContext, useState, useEffect, useRef } from 'react';
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
  Keyboard,
  Dimensions,
} from 'react-native';

//snackbar
import Snackbar from 'react-native-snackbar';

//context api
import { AppwriteContext } from '../appwrite/AuthContext';

//Navigaiton
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../routes/AuthStack';

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

const RegisterPage = ({navigation}:SignupScreenProps) => {
  const {appwrite,setisLoggedIn} = useContext(AppwriteContext);
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

  const [email,setemail] = useState<string>("");
  const [name, setName] = useState<string>('');
  const [password,setpassword] = useState<string>("");
  const [phone, setPhone] = useState<string>('');
  const [confirmpassword,setconfirmpassword] = useState<string>("");
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{10}$/;

  const handleRegister = async () => {
    // Validate inputs
    if (!(password === confirmpassword && emailRegex.test(email))) {
      Snackbar.show({
        text: 'Password should be equal to Confirm Password and Email should be valid',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    
    if (!phoneRegex.test(phone)) {
      Snackbar.show({
        text: 'Please enter a valid 10-digit phone number',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }
    
    if (!name || name.trim() === '') {
      Snackbar.show({
        text: 'Please enter your name',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    try {
      const response = await appwrite.createAccount({ 
        email, 
        password, 
        phone, 
        name 
      });
      
      if (response) {
        navigation.replace('Otp');
        Snackbar.show({
          text: 'You are registered successfully. Please login now.',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    } catch (e) {
      console.log(e);
      Snackbar.show({
        text: 'An error occurred. Please try again later.',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
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
          <Text style={styles.header}>Create Account</Text>
          <Text style={styles.subHeader}>Enter Your Information</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor="#A0A0A0"
              onChangeText={text => setName(text)}
              keyboardType="default"
              maxLength={30}
              value={name}
            />
          </View>

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
            <Text style={styles.inputLabel}>Phone No.</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Phone No"
              placeholderTextColor="#A0A0A0"
              onChangeText={text => setPhone(text)}
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
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

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#A0A0A0"
              onChangeText={text => setconfirmpassword(text)}
              secureTextEntry={true}
              maxLength={15}
              value={confirmpassword}
            />
          </View>

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
          
          <Text style={styles.footerText}>
            Already Registered User?{' '}
            <Text
              style={styles.loginLink}
              onPress={() => navigation.navigate('Otp')}
            >
              Login Here
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
  registerButton: {
    backgroundColor: '#E88801',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 20,
  },
  registerButtonText: {
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
  loginLink: {
    color: '#007BFF',
    fontFamily: 'OpenSans-Bold',
  },
});

export default RegisterPage;