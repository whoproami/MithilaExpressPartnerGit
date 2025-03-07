import React from "react";

import { Text,Image,View,StyleSheet,useColorScheme, SafeAreaView, ActivityIndicator } from 'react-native'

export default function Loading(){
    const isDarkMode = useColorScheme()=== "light"
    return(
        
         <View style={styles.containeer}>
           <Image source={require("../assets/asset/logo.jpeg")} style={styles.images}></Image>
          {/* <Text style={isDarkMode ? styles.darkText:styles.whiteText }>Mithila Express</Text> */}
          <Text style={styles.footer}>Powered by Mithila Express pvt.ltd</Text>
          <ActivityIndicator size="large" color="#FFA500" />
         </View>
        )
}
const styles = StyleSheet.create({
    containeer: {
        flex: 1,
        alignItems: 'center',
        justifyContent:'center',
        backgroundColor:'black',
    },
    whiteText: {
        color: 'white'
    },
    darkText: {
        color: '#ff4d30',
        fontSize: 24,
        fontWeight: 'bold',
        
    },
    images:{
        width: 200,
        borderRadius: 8,
        height: 200,
        marginBottom:12,

    },
    footer:{
        position: 'absolute',
        paddingBottom: 60,
        fontSize: 12,
        opacity: 0.5,
        bottom: 0,
        color: 'white',
    }
  
});


