import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import Swiper from 'react-native-swiper';
import Loading from './Loading';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../routes/AuthStack';
type StarterProps = NativeStackScreenProps<AuthStackParamList, 'Starter'>;

export default function Starter({ navigation }: StarterProps) {


  return (
        <SafeAreaView style={styles.container}>
          <Swiper
            style={styles.wrapper}
            autoplay={true} // Enable autoplay
            autoplayTimeout={3} // Time in seconds for each slide
            nextButton={<Text style={styles.arrow}>›</Text>} // Next arrow button
            prevButton={<Text style={styles.arrow}>‹</Text>} // Previous arrow button
          >
            <View style={styles.slide}>
              <Image source={require('../assets/asset/starter.jpg')} style={styles.simg} />
              <Text style={styles.stext1}>Book a car, bike, and auto within seconds</Text>
              <Text style={styles.stext2}>The fastest app to book a car, bike, and auto in Nepal</Text>
            </View>
            <View style={styles.slide}>
              <Image source={require('../assets/asset/Starter1.png')} style={styles.simg} />
              <Text style={styles.stext1}>Another slide content</Text>
              <Text style={styles.stext2}>Description of the second slide</Text>
            </View>
            <View style={styles.slide}>
              <Image source={require('../assets/asset/Starter2.png')} style={styles.simg} />
              <Text style={styles.stext1}>Another slide content</Text>
              <Text style={styles.stext2}>Description of the second slide</Text>
            </View>
            <View style={styles.slide}>
              <Image source={require('../assets/asset/Starter3.png')} style={styles.simg} />
              <Text style={styles.stext1}>Another slide content</Text>
              <Text style={styles.stext2}>Description of the second slide</Text>
            </View>
          </Swiper>
          <Text style={styles.butn} onPress={() => navigation.navigate('Welcome')}>
            Get Started
          </Text>
        </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 2,
    alignItems: 'center',
    padding:20,
    height: 300,
  
  },
  wrapper: {

  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  butn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: '#ff8300', 
    marginBottom:124
  },
  simg: {
    height: 200,
    width: 300,
  },
  stext1: {
    textAlign: 'center',
    marginBottom: 4,
  },
  stext2: {
    textAlign: 'center',
    marginVertical: 4,
  },
  arrow: {
    fontSize: 50,
    color: '#ff8300',
  },
});
