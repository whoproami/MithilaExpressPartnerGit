import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, FlatList, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const App = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [rideOptions, setRideOptions] = useState([]);

  useEffect(() => {
    getCurrentLocation();
    fetchRideOptions();
  }, []);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.error(error.message);
        Alert.alert('Error', 'Failed to fetch current location. Please make sure location services are enabled.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const fetchRideOptions = () => {
    // Simulated API call to fetch ride options
    setTimeout(() => {
      setRideOptions([
        { id: '1', name: 'JUBERGO', price: '$25.50', time: '1-4 min' },
        { id: '2', name: 'JUBERCAR', price: '$35.00', time: '1-5 min' },
      ]);
    }, 1000);
  };

  const handleLocationSelect = (data, details = null) => {
    setDestination({
      name: data.description,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    });
  };

  const handleBookNow = () => {
    // Here you would implement the booking logic, such as sending a request to the backend
    // For demonstration purposes, we'll just show an alert
    Alert.alert('Booking', 'Your ride has been booked!');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput placeholder="Enter Destination" style={styles.searchBar} />
      </View>
      <MapView style={styles.map} initialRegion={{
        latitude: currentLocation ? currentLocation.latitude : 37.78825,
        longitude: currentLocation ? currentLocation.longitude : -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}>
        {currentLocation && <Marker coordinate={currentLocation} title="Current Location" />}
        {destination && <Marker coordinate={destination} title="Destination" />}
      </MapView>
      <View style={styles.rideOptionsContainer}>
        <Text style={styles.suggestedRidesText}>Suggested Rides</Text>
        <FlatList
          data={rideOptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.rideOption}>
              <Text style={styles.rideName}>{item.name}</Text>
              <Text style={styles.ridePrice}>{item.price}</Text>
              <Text style={styles.rideTime}>{item.time}</Text>
            </View>
          )}
        />
        <TouchableOpacity style={styles.bookNowButton} onPress={handleBookNow}>
          <Text style={styles.bookNowText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBarContainer: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  searchBar: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    fontSize: 16,
  },
  map: {
    flex: 1,
  },
  rideOptionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
  },
  suggestedRidesText: {
    fontSize: 18,
    marginBottom: 16,
  },
  rideOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  rideName: {
    fontSize: 16,
  },
  ridePrice: {
    fontSize: 16,
  },
  rideTime: {
    fontSize: 16,
  },
  bookNowButton: {
    backgroundColor: 'red',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookNowText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default App;
