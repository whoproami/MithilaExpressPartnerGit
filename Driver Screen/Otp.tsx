import React, { useState ,useContext} from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { AppwriteContext } from '../appwrite/AuthContext';


import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../routes/AuthStack';

type OtpScreenProps = NativeStackScreenProps<AuthStackParamList , 'Otp'>;




const Otpscreen = ({navigation,route}:OtpScreenProps) => {
  const [email, setemail]= useState('');
  const [password, setpassword]= useState('');
  const {appwrite,isLoggedIn,setisLoggedIn} = useContext(AppwriteContext);

  const handleVerifyOTP = () => {
    //  const {userId} = route.params;
    //  const secret = otp;
     appwrite.login({email,password})
     .then((response) => {
        console.log(response)
        if(response){
          setisLoggedIn(true);
        }
     })
     .catch((error) => {console.log(error)})
     ;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        keyboardType="default"
        value={email}
        onChangeText={setemail}
      />
         <TextInput
        style={styles.input}
        placeholder="Enter Password"
        keyboardType="default"
        value={password}
        onChangeText={setpassword}
      />
      <Button title="Login" onPress={handleVerifyOTP} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default Otpscreen;