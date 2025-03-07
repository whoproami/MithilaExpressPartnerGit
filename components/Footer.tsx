import { 
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    Image,
    Pressable,
    TouchableOpacity
} from "react-native";
import React, { useState } from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";
import Ficon from "react-native-vector-icons/Fontisto";
import { useNavigation } from "@react-navigation/native";


export default function Footer(){
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.BigContainer}>
        <View  style={styles.Container}>
             <TouchableOpacity style={styles.footerop} onPress={()=>navigation.navigate('Home')}>
                <Icon name="home" size={32}/>
              <Text>Home</Text>          
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerop} onPress={()=>{navigation.navigate("History")}}>
                <Icon name="history" size={32} />
                <Text>History</Text>
            </TouchableOpacity>   
            <TouchableOpacity style={styles.footerop} onPress={()=>navigation.navigate('Profile')} >
                <Icon name="user-circle" size={32} />
                <Text>Account</Text>
            </TouchableOpacity>  
        </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    BigContainer:{
        height: '10%',
    },
    Container:{
       flex:1,
       flexDirection:'row',
       padding:10,
       justifyContent: 'space-between',
       alignItems:"center",
       backgroundColor:'white',

    },
    footerop:{
      flex:1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    img:{
        width:40,
        height:40,
    }
    
});