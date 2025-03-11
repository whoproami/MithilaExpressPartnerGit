import React ,{useState,useEffect, useContext}from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, Image,PermissionsAndroid } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '../components/Footer';
import Geolocation from '@react-native-community/geolocation';
import { DatabaseContext } from '../appwrite/DatabaseContext';
// import geohash from 'ngeohash';
import { AppwriteContext } from '../appwrite/AuthContext';

//Navigaiton
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../routes/AppStack';

type HomeScreenProps = NativeStackScreenProps<AppStackParamList , 'Home'>;



type Props = {};
const requestLocationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Cool App Location Permission',
        message:
          'Cool this App needs access to your Location' +
          'so you can see your location.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('You can use the Location');
    } else {
      console.log('location permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};
const Home: React.FC<HomeScreenProps> = ({navigation}:HomeScreenProps) => {
  type Location = {
    latitude: number ;
    longitude: number ;
  };
  const{appwritedb} =useContext(DatabaseContext);
  const {appwrite}=useContext(AppwriteContext);
  const [location, setLocation] = useState<Location>({ latitude: 0, longitude:0 });
  const [locPermission, setLocPermission] = useState<boolean>(false);
  type userposition = {
    coords: {
      latitude: string;
      longitude: string;
    }
  }

  useEffect(() => {
    if(locPermission==false){
      requestLocationPermission();
      setLocPermission(true);
    }
  }, [])

  // const Geoloc = ()=>{
  //   Geolocation.watchPosition(
  //     (position: userposition) => {
  //       let { latitude, longitude } = position.coords;
  //       setLocation(prevLocation => ({
  //         ...prevLocation,
  //         latitude: parseFloat(latitude),
  //         longitude: parseFloat(longitude)
  //       }));  
  //       console.log(location.latitude, location.longitude);  
  //       // setInterval(Geoloc,1000000);


  //     },
  //     (error: undefined) => console.log(error),
  //     { enableHighAccuracy: false, timeout: 40000, maximumAge: 1000,interval:60000 }
  //   );
  //   // StoreDriveloc();
  //  }
  // useEffect(() =>{
  //    Geoloc();
  // },[]);
  
  // const StoreDriveloc=async ()=>{
  //      try{
  //        let phoneno:string| undefined;
  //        let Geohash:string | undefined=geohash.encode(location.latitude,location.longitude);
  //        let userId:string | undefined ;
  //        await appwrite.getCurrentUser().then((response)=>{phoneno=response?.phone; userId=response?.$id}).catch((err)=>{console.log(err)});
  //        console.log(phoneno,Geohash);
  //        appwritedb.setuserLocation({phoneno,Geohash,userId});
        
  //      }catch(e){
  //       console.log(e);
  //      }
  // }







  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput style={styles.searchBar} placeholder="Search here" />
        <TouchableOpacity style={styles.notificationButton} >
          <Image source={require('../assets/asset/notification.png')} style={styles.notificationIcon} />
        </TouchableOpacity>
      </View>
      {/* <MapView style={styles.map} region={{ 
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}>*/}
         <Marker
    coordinate={{
      latitude: location.latitude,
      longitude: location.longitude
    }}
    title="Current Location"
    description="This is your current location"
  />
        {/* Example route */}
        <Polyline
          coordinates={[
            { latitude: 22.5726, longitude: 88.3639 },
            { latitude: 22.5728, longitude: 88.3641 },
            // Add the rest of your route coordinates here
          ]}
          strokeColor="black" // If you're using Google Maps, this needs to be in RGBA format
          strokeWidth={6}
        />
      {/* </MapView> */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.statusIndicator}>
          <Text style={styles.statusText}>You're Online</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.statusIndicator} onPress={()=>{navigation.navigate("Notifications")}}>
          <Text style={styles.statusText}>Available Ride</Text>
        </TouchableOpacity>
        <View style={styles.navigationControls}>
          {/* Navigation controls here */}
        </View>
      </View>
      <Footer>
      </Footer>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  searchBar: {
    flex: 1,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  notificationButton: {
    padding: 10,
    backgroundColor: 'transparent', // Adjust as needed
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  map: {
    flex: 1,
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent:"center",
  },
  statusIndicator: {
    padding: 10,
    marginHorizontal: 10,
    backgroundColor: 'red',
    borderRadius: 20,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  // Define styles for your navigation controls here
});

export default Home;
