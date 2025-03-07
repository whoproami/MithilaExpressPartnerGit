import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableHighlight, ActivityIndicator } from 'react-native';
import {sendMessage,sendingMessage,subscribeToMessages} from '../appwrite/RealtimeServices';
import { AppwriteContext } from '../appwrite/AuthContext';

function RideRequestComp({ ridedata }: { ridedata: string }){
  return(
    <View style={styles.message}>
              <Text style={styles.messageText}>HI Address to Go:{ridedata}</Text>
              <Text style={styles.messageText}>From the</Text>
              <Text style={styles.messageText}>Timing</Text>
              <Text style={styles.messageText}>Pricing</Text>
              <View style={styles.buttonContainer}>
                  <TouchableHighlight style={styles.buttn1}><Text>Yes</Text></TouchableHighlight>
                  <TouchableHighlight style={styles.buttn2}><Text>No</Text></TouchableHighlight>
              </View>
          </View>
  )
}



const Notification = () => {
    const { appwrite } = useContext(AppwriteContext);
    const [driverId, setDriverId] = useState("");
    const [ride, setRide] = useState<sendingMessage | null>(null); // Use null for initial state    let ride:sendingMessage={sender:"",content:"",timestamp:new Date};
    const [showm,setShowm] = useState(false);
    const fetchData = async () => {
      try {
        const user = await appwrite.getCurrentUser();
        if (user?.$id) {
          setDriverId(user.$id);
          console.log(driverId);
        } else {
          console.log("No logged-in user found. Please sign in to receive messages.");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    const getMessage = async () => {
      // if (!driverId) {
      //   return; // Prevent unnecessary calls if driverId is not set
      // }
    console.log("getMessage");
      try {
        await subscribeToMessages((message:sendingMessage)=>{
          console.log(message);
          setShowm(true);
          setRide(message)});
        // Log the received message
      } catch (err) {
        console.error("Error fetching message:", err);
      }
    };
    
    useEffect(() => {
      fetchData();
      getMessage();  
    },[]);

    useEffect(() => {

    },[showm])
    

 
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.notificationContainer}>
                <Text style={styles.notificationText}>You have a new notification!</Text>
            </View>
            {
              ride ? <RideRequestComp ridedata={ride.content}/> : <View><Text>Searching For Ride Requests & Notifications</Text><ActivityIndicator></ActivityIndicator></View>

            }
            
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff', // Adjust as per your design
        alignItems: 'center',

    },
    notificationContainer: {
        backgroundColor: '#e3f2fd', // Adjust as per your design
        padding: 20,
        borderRadius: 10,
        margin: 20,
        alignItems: 'center',

    },
    notificationText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1976D2', // Adjust as per your design
    },
    message: {
        alignItems: 'center',
        backgroundColor: "lightgray",
        borderRadius: 5,
        width: "80%",
        padding: 10
    },
    messageText: {
        fontSize: 16,
        fontFamily: 'Helvetica',
        fontWeight: "bold",
        marginBottom: 10,
        color: '#333', // Adjust as per your design
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: "16%",
    },
    buttn1: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        backgroundColor: "green",
        elevation: 10,
        borderRadius: 5,

    },
    buttn2: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        backgroundColor: "red",
        elevation: 10,
        borderRadius: 5,

    }
});

export default Notification;