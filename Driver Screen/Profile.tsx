import React,{useContext} from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import {NativeStackScreenProps} from "@react-navigation/native-stack"
import { AppStackParamList } from '../routes/AppStack';
import Snackbar from 'react-native-snackbar';
import { AppwriteContext } from '../appwrite/AuthContext';
type Profileprops = NativeStackScreenProps<AppStackParamList,'Profile'>
const ProfileScreen:React.FC<Profileprops> = ({navigation}:Profileprops) => {
  const {appwrite,setisLoggedIn} = useContext(AppwriteContext);

  const logout = () =>{
    appwrite.logout().then(()=>{
      Snackbar.show({
        text:'You are logged out',
        duration:Snackbar.LENGTH_SHORT
      })
     setisLoggedIn(false);
    })
      
    .catch(() => {

    })
   }
  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={require('../assets/Account/Profite.jpg')} style={styles.profileImage} />
        <Text style={styles.profileName}>Mithila Express</Text>
        <Text style={styles.phoneNumber}>+977 0000 000 000</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>5.0</Text>
          <Image source={require('../assets/Account/Rate.jpg')} style={styles.starIcon} />
        </View>
        <TouchableOpacity>
          <Text style={styles.updateInfo}>Update Profile Info</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.menuItem}>
        <TouchableOpacity style={styles.menuItemButton} onPress={()=>{navigation.navigate("RegistrationScreen")}}>
          <Image source={require('../assets/Account/Rate.jpg')} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Registration</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItemButton}>
          <Image source={require('../assets/Account/Wallet.jpg')} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Payout Method</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItemButton}>
          <Image source={require('../assets/Account/History.jpg')} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Trips History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItemButton}>
          <Image source={require('../assets/Account/Setting.jpg')} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItemButton}>
          <Image source={require('../assets/Account/Privacy.jpg')} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItemButton} onPress={logout} >
          <Image source={require('../assets/Account/Rate.jpg')} style={styles.menuItemIcon} />
          <Text style={styles.menuText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  rating: {
    fontSize: 16,
    color: 'green',
    marginRight: 5,
  },
  starIcon: {
    width: 20,
    height: 20,
    tintColor: 'green',
  },
  updateInfo: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  menuItem: {
    paddingHorizontal: 20,
  },
  menuItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuItemIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  menuText: {
    fontSize: 18,
    color: '#333',
  },
});

export default ProfileScreen;