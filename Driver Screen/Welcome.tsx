import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import {NativeStackScreenProps} from "@react-navigation/native-stack"
import { AuthStackParamList } from '../routes/AuthStack';


type welcomeprops = NativeStackScreenProps<AuthStackParamList,'Welcome'>



// This is a functional component for the Welcome Screen
export default function Welcome({navigation}:welcomeprops){
    return (
        <View style={styles.container}>
            {/* Illustration Image */}
            <Image source={require('../assets/asset/WelcomeScreen.png')} style={styles.illustration} />
            
            {/* Welcome Text */}
            <Text style={styles.title}>Welcome To</Text>
            <Text style={styles.brandName}>Mithila Express</Text>
            <Text style={styles.subtitle}>Ride Relaxed Travel Safe</Text>
            
            {/* Action Buttons */}
            <TouchableOpacity style={styles.button} onPress={()=>navigation.navigate('Signup')}>
                <Text style={styles.buttonText}>Log In </Text>
            </TouchableOpacity>
        </View>
    );
};

// Stylesheet for the welcome screen
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff', // Replace with your background color
    },
    illustration: {
        width: '100%', // Adjust as needed
        height: 200, // Adjust as needed
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000', // Replace with your text color
        marginTop: 30,
    },
    brandName: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#E88801', // Replace with your brand color
    },
    subtitle: {
        fontSize: 16,
        color: '#000', // Replace with your text color
        marginBottom: 50,
    },
    button: {
        backgroundColor: '#E88801', // Replace with your brand color
        padding: 15,
        borderRadius: 5,
        marginVertical: 10,
        width: '100%', // Adjust as needed
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff', // Replace with your button text color
    },
});


