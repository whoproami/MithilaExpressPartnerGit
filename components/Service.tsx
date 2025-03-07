import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const RideBookingScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>();
  const [destination, setDestination] = useState<{ latitude: number; longitude: number }>();
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    const fetchUserAndDestination = async () => {
      try {
        const userLocationResponse = await fetchUserLocation();
        const destinationResponse = await fetchDestination();
        setUserLocation(userLocationResponse);
        setDestination(destinationResponse);
      } catch (error) {
        console.error("Error fetching user location and destination:", error);
      }
    };

    fetchUserAndDestination();
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        if (userLocation && destination) {
          const routeResponse = await fetchRouteCoordinates(userLocation, destination);
          setRouteCoordinates(routeResponse);
        }
      } catch (error) {
        console.error("Error fetching route coordinates:", error);
      }
    };

    fetchRoute();
  }, [userLocation, destination]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {userLocation && (
          <Marker coordinate={userLocation} title="Your Location" pinColor="blue" />
        )}
        {destination && (
          <Marker coordinate={destination} title="Destination" pinColor="red" />
        )}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#000"
            strokeWidth={4}
          />
        )}
      </MapView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

const fetchUserLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  // Simulate fetching user's location from backend
  return { latitude: 37.78825, longitude: -122.4324 }; // Example location
};

const fetchDestination = async (): Promise<{ latitude: number; longitude: number }> => {
  // Simulate fetching destination from backend
  return { latitude: 37.75825, longitude: -122.4624 }; // Example destination
};

const fetchRouteCoordinates = async (
  userLocation: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{ latitude: number; longitude: number }[]> => {
  // Simulate fetching route coordinates from backend
  const routeCoordinates = [];
  const numPoints = 10;
  for (let i = 0; i < numPoints; i++) {
    const latitude = userLocation.latitude + (destination.latitude - userLocation.latitude) * (i / numPoints);
    const longitude = userLocation.longitude + (destination.longitude - userLocation.longitude) * (i / numPoints);
    routeCoordinates.push({ latitude, longitude });
  }
  return routeCoordinates;
};

export default RideBookingScreen;
