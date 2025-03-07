import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';

const MapSearch = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);

  // Function to get the current location
  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          latitude,
          longitude,
        });
      },
      error => alert(error.message),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  }, []);

  // Function to handle selection of a location from the autocomplete suggestions
  const handleLocationSelect = (data, details = null) => {
    console.log(data, details);
    setDestination({
      name: data.description,
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Map Section */}
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: currentLocation ? currentLocation.latitude : 37.78825, // Initial map latitude
          longitude: currentLocation ? currentLocation.longitude : -122.4324, // Initial map longitude
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Display Marker for Current Location */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title='Current Location'
          />
        )}

        {/* Display Marker for Destination if Selected */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title={destination.name}
          />
        )}
      </MapView>

      {/* Search Section */}
      <View style={{ position: 'absolute', top: 20, left: 20, right: 20 }}>
        <GooglePlacesAutocomplete
          placeholder='Search'
          onPress={handleLocationSelect}
          query={{
            key: 'AIzaSyBfNa6S4I9scodDEApA4lwwncGrddf8eB4',
            language: 'en',
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          styles={{
            textInput: {
              backgroundColor: '#DDDDDF',
              borderRadius: 5,
              fontSize: 16,
            },
            listView: {
              backgroundColor: 'white',
              zIndex: 9999,
              position: 'absolute',
              marginTop: 40,
            },
          }}
        />
      </View>

      {/* Destination Section */}
      {destination && (
        <View style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
          <Text>Destination: {destination.name}</Text>
          <Button
            title='Clear Destination'
            onPress={() => setDestination(null)}
          />
        </View>
      )}
    </View>
  );
};

export default MapSearch;
