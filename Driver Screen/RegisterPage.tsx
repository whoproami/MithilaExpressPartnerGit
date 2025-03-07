import React, { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

//snackbar
import Snackbar from 'react-native-snackbar';

//context api
import { AppwriteContext } from '../appwrite/AuthContext';


//Navigaiton
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../routes/AuthStack';

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList , 'Signup'>;


const RegisterPage = ({navigation}:SignupScreenProps) => {
  const {appwrite,setisLoggedIn} = useContext(AppwriteContext);

  const [email,setemail] = useState<string>("");
  const [password,setpassword] = useState<string>("");
  const [confirmpassword,setconfirmpassword] = useState<string>("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Correct regex declaration

  const handleRegister = async () => {
    if (!(password === confirmpassword && emailRegex.test(email))) { // Correct usage of regex
      Snackbar.show({
        text: "Password should be equal to Confirm Password and Email should be valid",
        duration:Snackbar.LENGTH_SHORT
      })
    } else {
      await appwrite.createAccount({email, password})
        .then((response:any) => {
          if(response){
            navigation.navigate('Otp');
            Snackbar.show({
              text:'You are registered successfully. Please login now.',
              duration:Snackbar.LENGTH_SHORT
            })
          }
        })
        .catch(e => {
          console.log(e);
          // Handle error properly
          Snackbar.show({
            text: 'An error occurred. Please try again later.',
            duration: Snackbar.LENGTH_SHORT
          });
        })
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email address"
        onChangeText={(text)=>{setemail(text)}}
        keyboardType="default"
        maxLength={30}
      />
       <TextInput
        style={styles.input}
        placeholder="Enter your Password"
        onChangeText={(text)=>{setpassword(text)}}
        keyboardType="default"
        maxLength={15}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your confirm Password"
        onChangeText={(text)=>{setconfirmpassword(text)}}
        keyboardType="default"
        maxLength={15}
      />
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>Register</Text>
      </TouchableOpacity>
      <Text>Already Registered User</Text><Text style={{color:"green", fontStyle:"italic" }} onPress={()=>{navigation.navigate('Otp')}}>Login Here?</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // Changed background color to white
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: 'green', // Changed header text color
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  registerButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

 export default RegisterPage;