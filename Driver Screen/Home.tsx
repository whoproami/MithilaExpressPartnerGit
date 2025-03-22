import React, {useState, useEffect, useContext} from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  PermissionsAndroid,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {SafeAreaView} from 'react-native-safe-area-context';
import Footer from '../components/Footer';
import Geolocation from '@react-native-community/geolocation';
import {DatabaseContext} from '../appwrite/DatabaseContext';
import {AppwriteContext} from '../appwrite/AuthContext';
import Snackbar from 'react-native-snackbar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RideRequestPopup from '../components/RideRequestPopup';

//Navigation
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '../routes/AppStack';

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

type Location = {
  latitude: number;
  longitude: number;
};

type userposition = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

// Enhanced permission request that also checks location services
const requestLocationPermission = async () => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'This app needs access to your location to show your position on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // For iOS, we just request and assume it works
      // iOS handles permissions differently
      Geolocation.requestAuthorization();
      return true;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

// Mock location for testing - remove in production
const MOCK_LOCATION = {
  latitude: 26.7271, // Example: Janakpur, Nepal coordinates
  longitude: 85.9274,
};

const Home: React.FC<HomeScreenProps> = ({navigation}: HomeScreenProps) => {
  const {appwritedb} = useContext(DatabaseContext);
  const {appwrite} = useContext(AppwriteContext);

  const [location, setLocation] = useState<Location>({
    latitude: 0,
    longitude: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
  const [locPermission, setLocPermission] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [useMockLocation, setUseMockLocation] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isRideRequestVisible, setIsRideRequestVisible] = useState(false);
  const [currentRideRequest, setCurrentRideRequest] = useState(null);

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Driver Location Map</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          body { background-color: #f5f5f5; margin: 0; padding: 0; }
          #map { width: 100%; height: 100vh; }
          .reload-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(255,255,255,0.8);
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            font-family: Arial, sans-serif;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var lat = ${location.latitude || 0};
          var lng = ${location.longitude || 0};
          if (lat === 0 && lng === 0) {
            var mapDiv = document.getElementById('map');
            mapDiv.innerHTML = '<div class="reload-message"><p>Location not available</p><p>Please use the refresh button below</p></div>';
          } else {
            var map = L.map('map').setView([lat, lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
            
            // Driver marker with custom icon
            var driverIcon = L.icon({
              iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097144.png',
              iconSize: [40, 40],
              iconAnchor: [20, 20],
              popupAnchor: [0, -20]
            });
            
            var marker = L.marker([lat, lng], { icon: driverIcon }).addTo(map)
              .bindPopup("Your current location")
              .openPopup();
              
            var circle = L.circle([lat, lng], {
              color: 'blue',
              fillColor: '#3388ff',
              fillOpacity: 0.3,
              radius: 100
            }).addTo(map);
            
            // Report map is ready
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              event: 'mapReady',
              lat: lat,
              lng: lng 
            }));
          }
        </script>
      </body>
    </html>
  `;

  // Function to open location settings
  const openLocationSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('app-settings:');
    }
  };

  // Try different geolocation methods with progressive fallbacks
  const fetchLocation = async () => {
    setIsRefetching(true);
    setLocationError(null);
    setAttemptCount(prev => prev + 1);

    // If we've tried multiple times and failed, suggest mock location
    if (attemptCount >= 3 && !useMockLocation) {
      Snackbar.show({
        text: 'Having trouble getting your location. Would you like to use a demo location?',
        duration: Snackbar.LENGTH_LONG,
        action: {
          text: 'USE DEMO',
          textColor: 'green',
          onPress: () => {
            setUseMockLocation(true);
            setLocation(MOCK_LOCATION);
            setIsLoading(false);
            setIsRefetching(false);
            setLocationError(null);
          },
        },
      });
    }

    const successCallback = (position: userposition) => {
      const {latitude, longitude} = position.coords;
      console.log('Got location successfully:', latitude, longitude);
      setLocation({latitude, longitude});
      setIsLoading(false);
      setIsRefetching(false);
      setLocationError(null);

      // Store driver location in database when online
      if (isOnline) {
        storeDriverLocation(latitude, longitude);
      }

      Snackbar.show({
        text: 'Location updated successfully!',
        duration: Snackbar.LENGTH_SHORT,
      });
    };

    const errorCallback = (error: any) => {
      console.log('Geolocation error:', error);
      let errorMessage = '';

      if (error.code === 3) {
        // TIMEOUT
        errorMessage =
          'Location request timed out. Try adjusting your settings.';
      } else if (error.code === 2) {
        // POSITION_UNAVAILABLE
        errorMessage = 'Location services are disabled. Please enable them.';
      } else if (error.code === 1) {
        // PERMISSION_DENIED
        errorMessage =
          'Location permission denied. Please enable location in settings.';
      } else {
        errorMessage = 'Failed to get location: ' + error.message;
      }

      // If we get a timeout, try with less accurate but faster settings
      if (error.code === 3 && !useMockLocation) {
        tryLessAccurateLocation();
      } else {
        setLocationError(errorMessage);
        Snackbar.show({
          text: errorMessage,
          duration: Snackbar.LENGTH_LONG,
          action: {
            text: 'SETTINGS',
            textColor: 'white',
            onPress: openLocationSettings,
          },
        });

        setIsLoading(false);
        setIsRefetching(false);
      }
    };

    // If user opted to use mock location, don't try real geolocation
    if (useMockLocation) {
      setLocation(MOCK_LOCATION);
      setIsLoading(false);
      setIsRefetching(false);
      setLocationError(null);
      return;
    }

    // Standard high accuracy position request
    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // Reduced from 20000
      maximumAge: 1000,
    };

    if (locPermission) {
      console.log('Attempting to get location with high accuracy...');
      Geolocation.getCurrentPosition(successCallback, errorCallback, options);
    } else {
      const granted = await requestLocationPermission();
      setLocPermission(granted);
      if (granted) {
        console.log('Permission granted, getting location...');
        Geolocation.getCurrentPosition(successCallback, errorCallback, options);
      } else {
        setLocationError('Location permission denied');
        setIsRefetching(false);
        setIsLoading(false);
      }
    }
  };

  // Try to get location with lower accuracy settings
  const tryLessAccurateLocation = () => {
    console.log('Trying with lower accuracy settings...');

    const successCallback = (position: userposition) => {
      const {latitude, longitude} = position.coords;
      console.log('Got location with lower accuracy:', latitude, longitude);
      setLocation({latitude, longitude});
      setIsLoading(false);
      setIsRefetching(false);
      setLocationError(null);

      // CRITICAL FIX: Explicitly store driver location in database when online
      if (isOnline) {
        console.log('Explicitly storing lower accuracy location in database');
        storeDriverLocation(latitude, longitude);
      }

      Snackbar.show({
        text: 'Location updated (lower accuracy)!',
        duration: Snackbar.LENGTH_SHORT,
      });
    };

    const errorCallback = (error: any) => {
      console.log('Low accuracy geolocation also failed:', error);
      setLocationError(
        'Could not get your location. Please check your device settings.',
      );
      setIsRefetching(false);
      setIsLoading(false);

      Snackbar.show({
        text: 'Location detection failed. Try enabling "Demo Location" below.',
        duration: Snackbar.LENGTH_LONG,
      });
    };

    // Lower accuracy options
    const options = {
      enableHighAccuracy: false, // Lower accuracy
      timeout: 10000, // Even shorter timeout
      maximumAge: 60000, // Accept up to 1 minute old locations
    };

    Geolocation.getCurrentPosition(successCallback, errorCallback, options);
  };

  // Toggle between mock location and real location
  const toggleMockLocation = () => {
    if (useMockLocation) {
      // Switch to real location
      setUseMockLocation(false);
      setAttemptCount(0);
      fetchLocation();
    } else {
      // Switch to mock location
      setUseMockLocation(true);
      setLocation(MOCK_LOCATION);
      setIsLoading(false);
      setIsRefetching(false);
      setLocationError(null);

      Snackbar.show({
        text: 'Using demo location mode',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const startLocationTracking = () => {
    // If using mock location, don't start real tracking
    if (useMockLocation) return null;

    if (!isTracking && locPermission) {
      setIsTracking(true);
      // Set up a location watcher
      const watchId = Geolocation.watchPosition(
        position => {
          const {latitude, longitude} = position.coords;
          setLocation({latitude, longitude});
          setLocationError(null);

          // Store location in database when online
          if (isOnline) {
            storeDriverLocation(latitude, longitude);
          }
        },
        error => {
          console.log('Tracking error:', error);
          if (error.code === 3) {
            setLocationError(
              'Location tracking timed out. Trying to recover...',
            );
          }
        },
        {
          enableHighAccuracy: false, // Use lower accuracy for tracking to save battery
          distanceFilter: 10, // Update when moved at least 10 meters
          interval: 10000, // Update every 10 seconds (increased to reduce timeouts)
          fastestInterval: 5000, // Increased to reduce timeouts
        },
      );

      // Store watchId to clear it later
      return watchId;
    }
    return null;
  };

  // Update the storeDriverLocation function
  const storeDriverLocation = async (latitude: number, longitude: number) => {
    try {
      // Validate inputs before proceeding
      if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
        console.error('Invalid location data:', {latitude, longitude});
        return;
      }

      const currentUser = await appwrite.getCurrentUser();
      if (currentUser) {
        console.log('Storing driver location:', {latitude, longitude});
        console.log('Current user:', currentUser.$id, currentUser.phone);

        // Make sure we have a phone number
        const phoneNumber = currentUser.phone || 'unknown';

        // Call the updated setuserLocation method with all required parameters
        console.log('Calling setuserLocation with:', {
          userId: currentUser.$id,
          Phoneno: phoneNumber,
          latitude,
          longitude,
          vehicleType: 'car',
        });

        const result = await appwritedb.setuserLocation({
          userId: currentUser.$id,
          Phoneno: phoneNumber,
          latitude,
          longitude,
          vehicleType: 'car', // Example: Set vehicle type dynamically
        });

        console.log('Result from setuserLocation:', result);

        if (result?.success) {
          console.log('Driver location stored successfully with H3 indexing');
        } else {
          console.error('Failed to store driver location:', result?.error);

          // Only show error if we're online
          if (isOnline) {
            Snackbar.show({
              text: 'Failed to update your status in the database',
              duration: Snackbar.LENGTH_SHORT,
            });
          }
        }
      } else {
        console.error('Cannot store location: User not logged in');
        setIsOnline(false); // Turn offline if user isn't logged in

        Snackbar.show({
          text: 'You need to be logged in to go online',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    } catch (error) {
      console.error('Error storing driver location:', error);

      Snackbar.show({
        text: 'Failed to update your location',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  // Update the toggleOnlineStatus function
  const toggleOnlineStatus = async () => {
    try {
      const currentUser = await appwrite.getCurrentUser();
      if (!currentUser) {
        Snackbar.show({
          text: 'You need to be logged in to change online status',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      const newOnlineStatus = !isOnline;

      if (newOnlineStatus) {
        // Going online - refresh location first
        console.log('Driver going online, fetching location...');

        // Set online state FIRST to make sure all location callbacks know we're online
        setIsOnline(true);

        if (useMockLocation) {
          console.log('Using mock location for online status');
          // Explicitly store in database
          await storeDriverLocation(
            MOCK_LOCATION.latitude,
            MOCK_LOCATION.longitude,
          );
        } else {
          // For real location, directly use the current location if available
          if (location.latitude !== 0 && location.longitude !== 0) {
            console.log('Using current location for online status:', location);
            await storeDriverLocation(location.latitude, location.longitude);

            // Also try to get a more accurate fix in the background
            fetchMoreAccurateLocation();
          } else {
            console.log('No current location, fetching new location...');
            fetchRealLocation();
          }
        }

        Snackbar.show({
          text: 'You are now online and available for rides',
          duration: Snackbar.LENGTH_SHORT,
        });

        if (!isTracking && !useMockLocation) {
          console.log('Starting location tracking');
          startLocationTracking();
        }
      } else {
        // Going offline - delete or update status in database
        console.log('Driver going offline, updating status...');

        // Set offline state immediately
        setIsOnline(false);

        try {
          const result = await appwritedb.setDriverOffline(currentUser.$id);
          console.log('Result from setDriverOffline:', result);

          if (result?.success) {
            Snackbar.show({
              text: 'You are now offline',
              duration: Snackbar.LENGTH_SHORT,
            });
          } else {
            console.error('Error setting driver offline:', result?.error);
            Snackbar.show({
              text: 'Failed to update your status, but you are offline in the app',
              duration: Snackbar.LENGTH_SHORT,
            });
          }
        } catch (error) {
          console.error('Error setting driver offline:', error);
          Snackbar.show({
            text: 'Failed to update your status, but you are offline in the app',
            duration: Snackbar.LENGTH_SHORT,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling online status:', error);

      Snackbar.show({
        text: 'Failed to update your status',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const fetchRealLocation = () => {
    console.log('Fetching real location for online status');

    // If using mock location, use it directly
    if (useMockLocation) {
      console.log('Using mock location for online status');
      storeDriverLocation(MOCK_LOCATION.latitude, MOCK_LOCATION.longitude);
      return;
    }

    // If we already have a current location, use it immediately
    if (location.latitude !== 0 && location.longitude !== 0) {
      console.log('Using existing location immediately:', location);
      storeDriverLocation(location.latitude, location.longitude);

      // Also try to get a more accurate location in the background
      fetchMoreAccurateLocation();
      return;
    }

    // No existing location, need to fetch one
    const successCallback = (position: userposition) => {
      const {latitude, longitude} = position.coords;
      console.log('Got location successfully:', latitude, longitude);
      // Update UI and state
      setLocation({latitude, longitude});
      // Always call storeDriverLocation when we get a location
      storeDriverLocation(latitude, longitude);
    };

    const errorCallback = (error: any) => {
      console.error('Error fetching location:', error);

      if (error.code === 3) {
        // TIMEOUT
        console.log('Retrying with lower accuracy...');
        Geolocation.getCurrentPosition(
          (position: userposition) => {
            const {latitude, longitude} = position.coords;
            console.log(
              'Got location with lower accuracy:',
              latitude,
              longitude,
            );
            // Update UI and state
            setLocation({latitude, longitude});
            // CRITICAL FIX: Explicitly store this lower accuracy location
            console.log(
              'Explicitly storing lower accuracy location in database',
            );
            storeDriverLocation(latitude, longitude);
          },
          (fallbackError: any) => {
            console.error('Fallback location fetch failed:', fallbackError);
            Snackbar.show({
              text: 'Failed to fetch location. Please check your device settings.',
              duration: Snackbar.LENGTH_LONG,
            });
          },
          {
            enableHighAccuracy: false, // Lower accuracy
            timeout: 20000, // Shorter timeout
            maximumAge: 60000, // Accept up to 1-minute-old locations
          },
        );
      } else {
        Snackbar.show({
          text: 'Failed to fetch location. Please try again.',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    };

    // First attempt with high accuracy
    Geolocation.getCurrentPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
      timeout: 30000, // Increased timeout
      maximumAge: 1000,
    });
  };

  // Helper function to get more accurate location in the background
  const fetchMoreAccurateLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        console.log(
          'Got more accurate location in background:',
          latitude,
          longitude,
        );
        // Update location state
        setLocation({latitude, longitude});
        // Update database with more accurate location
        if (isOnline) {
          storeDriverLocation(latitude, longitude);
        }
      },
      error => {
        // Just log error, don't show user-facing message since we already have a location
        console.log('Background location update failed:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000,
      },
    );
  };

  const handleAcceptRide = (rideId: string, rideData: any) => {
    console.log('Ride accepted:', rideId, rideData);

    // Close the popup
    setIsRideRequestVisible(false);
    setCurrentRideRequest(null);

    // Navigate to RideInProgress with ride data
    navigation.navigate('RideInProgress', {rideData});
  };

  const handleRejectRide = (rideId: string) => {
    console.log('Ride rejected:', rideId);
    setIsRideRequestVisible(false);
    setCurrentRideRequest(null);

    Snackbar.show({
      text: 'Ride request rejected',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  const handleRideRequestTimeout = () => {
    console.log('Ride request timed out');
    setIsRideRequestVisible(false);
    setCurrentRideRequest(null);

    Snackbar.show({
      text: 'Ride request expired',
      duration: Snackbar.LENGTH_SHORT,
    });
  };

  // Add this function to test the ride request popup
  const testRideRequest = () => {
    // Sample ride request data
    const sampleRideRequest = {
      id: 'ride_' + Math.random().toString(36).substr(2, 9),
      customerName: 'Amit Kumar',
      pickupLocation: {
        address: 'MG Road, Bangalore',
        distance: '2.3 km',
        eta: '7 min',
      },
      dropLocation: {
        address: 'Electronic City, Bangalore',
        distance: '18.5 km',
      },
      fare: '₹320',
      paymentMethod: 'Cash',
      rideType: 'Regular',
    };

    setCurrentRideRequest(sampleRideRequest);
    setIsRideRequestVisible(true);
  };

  useEffect(() => {
    const checkAndRequestPermission = async () => {
      const granted = await requestLocationPermission();
      setLocPermission(granted);

      if (!granted) {
        setLocationError('Location permission denied');
        Snackbar.show({
          text: 'Location permission denied. You need to enable location to use this app.',
          duration: Snackbar.LENGTH_LONG,
          action: {
            text: 'SETTINGS',
            textColor: 'white',
            onPress: openLocationSettings,
          },
        });
      }
    };

    checkAndRequestPermission();
  }, []);

  useEffect(() => {
    if (locPermission) {
      fetchLocation();
    }
  }, [locPermission]);

  // Set up location tracking when going online
  useEffect(() => {
    let watchId: number | null = null;

    if (isOnline && !isTracking && !useMockLocation) {
      watchId = startLocationTracking();
    }

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
        setIsTracking(false);
      }
    };
  }, [isOnline, useMockLocation]);

  useEffect(() => {
    if (isOnline) {
      // Simulate receiving a ride request after going online
      const timeoutId = setTimeout(() => {
        testRideRequest();
      }, 5000); // Show after 5 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [isOnline]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);

      if (data.event === 'mapReady') {
        console.log('Map is ready with coordinates:', data.lat, data.lng);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput style={styles.searchBar} placeholder="Search here" />
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}>
          <Image
            source={require('../assets/asset/notification.png')}
            style={styles.notificationIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {(isMapLoading || isRefetching) && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color="#E88801" />
            <Text style={styles.mapLoadingText}>
              {isRefetching ? 'Updating your location...' : 'Loading map...'}
            </Text>
          </View>
        )}

        {/* Refresh Location Button - Displayed when there's a location error */}
        {(locationError ||
          (location.latitude === 0 && location.longitude === 0)) && (
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchLocation}
            disabled={isRefetching}>
            <Ionicons name="refresh" size={24} color="white" />
            <Text style={styles.refreshButtonText}>
              {isRefetching ? 'Getting Location...' : 'Refresh Location'}
            </Text>
          </TouchableOpacity>
        )}

        <WebView
          key={`${location.latitude}_${location.longitude}`} // Force reload when location changes
          originWhitelist={['*']}
          source={{html: mapHTML}}
          style={styles.map}
          onMessage={handleWebViewMessage}
          onLoad={() => {
            console.log('WebView loaded successfully');
            setIsMapLoading(false);
          }}
          onError={error => {
            console.log('WebView error:', error);
            setIsMapLoading(false);
            Snackbar.show({
              text: 'Failed to load map',
              duration: Snackbar.LENGTH_SHORT,
            });
          }}
        />

        {/* Error Message */}
        {locationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.statusIndicator,
            isOnline ? styles.onlineStatus : styles.offlineStatus,
          ]}
          onPress={toggleOnlineStatus}>
          <Text style={styles.statusText}>
            {isOnline ? "You're Online" : 'Go Online'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statusIndicator,
            useMockLocation ? styles.mockModeActive : styles.statusIndicator,
          ]}
          onPress={toggleMockLocation}>
          <Text style={styles.statusText}>
            {useMockLocation ? 'Using Demo Location' : 'Demo Location'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testRideRequest}>
          <Text style={styles.testButtonText}>Test Ride Request</Text>
        </TouchableOpacity>
      </View>

      {/* Fixed position refresh location button */}
      {/* <TouchableOpacity
        style={styles.floatingRefreshButton}
        onPress={fetchLocation}
        disabled={isRefetching}>
        <Ionicons name="locate" size={24} color="white" />
      </TouchableOpacity> */}

      <RideRequestPopup
        visible={isRideRequestVisible}
        rideData={currentRideRequest}
        onAccept={handleAcceptRide}
        onReject={handleRejectRide}
        onTimeout={handleRideRequestTimeout}
        timeoutDuration={30} // 30 seconds to respond
      />

      {/* For testing only */}

      <Footer />
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
    backgroundColor: 'transparent',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
  },
  map: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  mapLoadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#000',
  },
  refreshButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{translateX: -80}, {translateY: -20}],
    backgroundColor: '#E88801',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1001,
    elevation: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(220, 53, 69, 0.8)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusIndicator: {
    padding: 12,
    marginHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 120,
    backgroundColor: '#6c757d', // Default gray color
  },
  onlineStatus: {
    backgroundColor: '#28a745', // Green for online
  },
  offlineStatus: {
    backgroundColor: '#dc3545', // Red for offline
  },
  mockModeActive: {
    backgroundColor: '#17a2b8', // Blue for mock mode
  },
  statusText: {
    color: 'white',
    fontWeight: 'bold',
  },
  floatingRefreshButton: {
    position: 'absolute',
    right: 20,
    bottom: 90, // Positioned above the footer
    backgroundColor: '#E88801',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 2000,
  },
  testButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#E88801',
    padding: 10,
    borderRadius: 5,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Home;
