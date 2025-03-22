import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import Footer from '../components/Footer';
import Geolocation from '@react-native-community/geolocation';
import { DatabaseContext } from '../appwrite/DatabaseContext';
import { AppwriteContext } from '../appwrite/AuthContext';
import Snackbar from 'react-native-snackbar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../routes/AppStack';
import { Camera, useCameraDevices } from 'react-native-vision-camera';

type HomeScreenProps = NativeStackScreenProps<AppStackParamList, 'Home'>;

type Location = {
  latitude: number;
  longitude: number;
};

type UserPosition = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

const requestLocationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show your position on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      Geolocation.requestAuthorization();
      return true;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
};

const requestCameraPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take a selfie.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      console.log('Camera permission result:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      const result = await Camera.requestCameraPermission();
      console.log('iOS Camera permission result:', result);
      return result === 'authorized';
    }
  } catch (err) {
    console.warn('Error requesting camera permission:', err);
    return false;
  }
};

const MOCK_LOCATION: Location = {
  latitude: 26.7271,
  longitude: 85.9274,
};

const Home: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { appwritedb } = useContext(DatabaseContext);
  const { appwrite } = useContext(AppwriteContext);

  const [location, setLocation] = useState<Location>({ latitude: 0, longitude: 0 });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMapLoading, setIsMapLoading] = useState<boolean>(true);
  const [locPermission, setLocPermission] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [useMockLocation, setUseMockLocation] = useState<boolean>(false);
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [cameraModalVisible, setCameraModalVisible] = useState<boolean>(false);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState<boolean>(false);

  const camera = useRef<Camera>(null);
  const devices = useCameraDevices();
  const device = devices.front || devices.back; // Prefer front, fallback to back

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
            mapDiv.innerHTML = '<div class="reload-message"><p>Location not available</p><p>Please use the refresh button</p></div>';
          } else {
            var map = L.map('map').setView([lat, lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
              attribution: '© OpenStreetMap contributors'
            }).addTo(map);
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

  const openLocationSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings();
    } else {
      Linking.openURL('app-settings:');
    }
  };

  const fetchLocation = async () => {
    setIsRefetching(true);
    setLocationError(null);
    setAttemptCount(prev => prev + 1);

    if (attemptCount >= 3 && !useMockLocation) {
      Snackbar.show({
        text: 'Having trouble getting your location. Use demo location?',
        duration: Snackbar.LENGTH_LONG,
        action: {
          text: 'USE DEMO',
          textColor: 'green',
          onPress: () => {
            setUseMockLocation(true);
            setLocation(MOCK_LOCATION);
            setIsLoading(false);
            setIsRefetching(false);
          },
        },
      });
    }

    const successCallback = (position: UserPosition) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      setIsLoading(false);
      setIsRefetching(false);
      setLocationError(null);

      if (isOnline) {
        storeDriverLocation(latitude, longitude);
      }

      Snackbar.show({
        text: 'Location updated successfully!',
        duration: Snackbar.LENGTH_SHORT,
      });
    };

    const errorCallback = (error: any) => {
      let errorMessage = '';
      switch (error.code) {
        case 1:
          errorMessage = 'Location permission denied. Please enable in settings.';
          break;
        case 2:
          errorMessage = 'Location services disabled. Please enable them.';
          break;
        case 3:
          errorMessage = 'Location request timed out.';
          tryLessAccurateLocation();
          return;
        default:
          errorMessage = `Failed to get location: ${error.message}`;
      }

      setLocationError(errorMessage);
      setIsLoading(false);
      setIsRefetching(false);

      Snackbar.show({
        text: errorMessage,
        duration: Snackbar.LENGTH_LONG,
        action: { text: 'SETTINGS', textColor: 'white', onPress: openLocationSettings },
      });
    };

    if (useMockLocation) {
      setLocation(MOCK_LOCATION);
      setIsLoading(false);
      setIsRefetching(false);
      setLocationError(null);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 1000,
    };

    if (locPermission) {
      Geolocation.getCurrentPosition(successCallback, errorCallback, options);
    } else {
      const granted = await requestLocationPermission();
      setLocPermission(granted);
      if (granted) {
        Geolocation.getCurrentPosition(successCallback, errorCallback, options);
      } else {
        setLocationError('Location permission denied');
        setIsRefetching(false);
        setIsLoading(false);
      }
    }
  };

  const tryLessAccurateLocation = () => {
    const successCallback = (position: UserPosition) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      setIsLoading(false);
      setIsRefetching(false);
      setLocationError(null);
      if (isOnline) storeDriverLocation(latitude, longitude);
    };

    const errorCallback = (error: any) => {
      setLocationError('Could not get location. Check device settings.');
      setIsRefetching(false);
      setIsLoading(false);
    };

    Geolocation.getCurrentPosition(successCallback, errorCallback, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000,
    });
  };

  const toggleMockLocation = () => {
    setUseMockLocation(prev => !prev);
    if (!useMockLocation) {
      setLocation(MOCK_LOCATION);
      setIsLoading(false);
      setIsRefetching(false);
      setLocationError(null);
    } else {
      fetchLocation();
    }
  };

  const startLocationTracking = () => {
    if (useMockLocation || !locPermission || isTracking) return null;

    setIsTracking(true);
    const watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLocationError(null);
        if (isOnline) storeDriverLocation(latitude, longitude);
      },
      error => {
        setLocationError(error.code === 3 ? 'Location tracking timed out.' : error.message);
      },
      { enableHighAccuracy: false, distanceFilter: 10, interval: 10000, fastestInterval: 5000 },
    );
    return watchId;
  };

  const storeDriverLocation = async (latitude: number, longitude: number) => {
    try {
      const currentUser = await appwrite.getCurrentUser();
      if (!currentUser) throw new Error('User not logged in');

      const phoneNumber = currentUser.phone || 'unknown';
      const result = await appwritedb.setuserLocation({
        userId: currentUser.$id,
        Phoneno: phoneNumber,
        latitude,
        longitude,
        vehicleType: 'car',
      });

      if (!result?.success) throw new Error(result?.error || 'Failed to store location');
    } catch (error) {
      console.error('Error storing driver location:', error);
      if (isOnline) {
        Snackbar.show({
          text: 'Failed to update your location',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const currentUser = await appwrite.getCurrentUser();
      if (!currentUser) throw new Error('User not logged in');

      const newStatus = !isOnline;
      setIsOnline(newStatus);

      if (newStatus) {
        if (useMockLocation) {
          await storeDriverLocation(MOCK_LOCATION.latitude, MOCK_LOCATION.longitude);
        } else if (location.latitude && location.longitude) {
          await storeDriverLocation(location.latitude, location.longitude);
          fetchMoreAccurateLocation();
        } else {
          fetchLocation();
        }
        if (!isTracking) startLocationTracking();
      } else {
        const result = await appwritedb.setDriverOffline(currentUser.$id);
        if (!result?.success) throw new Error('Failed to set offline');
      }

      Snackbar.show({
        text: newStatus ? 'You are now online' : 'You are now offline',
        duration: Snackbar.LENGTH_SHORT,
      });
    } catch (error) {
      console.error('Error toggling online status:', error);
      Snackbar.show({
        text: 'Failed to update your status',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const fetchMoreAccurateLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        if (isOnline) storeDriverLocation(latitude, longitude);
      },
      error => console.log('Background location update failed:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 },
    );
  };

  const takeSelfie = async () => {
    const permissionGranted = await requestCameraPermission();
    if (!permissionGranted) {
      Snackbar.show({
        text: 'Camera permission denied. Please enable it in settings.',
        duration: Snackbar.LENGTH_LONG,
        action: { text: 'SETTINGS', textColor: 'white', onPress: openLocationSettings },
      });
      return;
    }

    if (!cameraReady || !device) {
      Snackbar.show({
        text: 'Camera not detected yet. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    setCameraModalVisible(true);
  };

  const capturePhoto = async () => {
    if (camera.current) {
      try {
        const photo = await camera.current.takePhoto({
          flash: 'off',
          enableAutoStabilization: true,
        });
        const uri = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;
        setSelfieUri(uri);
        setCameraModalVisible(false);

        console.log('Selfie captured:', uri);
        Snackbar.show({
          text: 'Selfie captured successfully!',
          duration: Snackbar.LENGTH_SHORT,
        });

        // Optional: Upload to Appwrite
        // const file = await appwrite.storage.createFile('selfies', 'unique()', uri);
      } catch (error) {
        console.error('Error capturing selfie:', error);
        Snackbar.show({
          text: 'Failed to capture selfie.',
          duration: Snackbar.LENGTH_SHORT,
        });
      }
    }
  };

  useEffect(() => {
    const init = async () => {
      const granted = await requestLocationPermission();
      setLocPermission(granted);
      if (granted) fetchLocation();
      else setLocationError('Location permission denied');
    };
    init();
  }, []);

  useEffect(() => {
    let watchId: number | null = null;
    if (isOnline && !isTracking && !useMockLocation) {
      watchId = startLocationTracking();
    }
    return () => {
      if (watchId !== null) Geolocation.clearWatch(watchId);
      setIsTracking(false);
    };
  }, [isOnline, useMockLocation]);

  useEffect(() => {
    if (devices && Object.keys(devices).length > 0) {
      console.log('Available camera devices:', devices);
      setCameraReady(true);
    }
  }, [devices]);

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === 'mapReady') setIsMapLoading(false);
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TextInput style={styles.searchBar} placeholder="Search here" placeholderTextColor="black" />
        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
          <Image source={require('../assets/asset/notification.png')} style={styles.notificationIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.mapContainer}>
        {(isMapLoading || isRefetching) && (
          <View style={styles.mapLoadingOverlay}>
            <ActivityIndicator size="large" color="#E88801" />
            <Text style={styles.mapLoadingText}>
              {isRefetching ? 'Updating location...' : 'Loading map...'}
            </Text>
          </View>
        )}

        <WebView
          key={`${location.latitude}_${location.longitude}`}
          originWhitelist={['*']}
          source={{ html: mapHTML }}
          style={styles.map}
          onMessage={handleWebViewMessage}
          onLoad={() => setIsMapLoading(false)}
          onError={() => {
            setIsMapLoading(false);
            Snackbar.show({ text: 'Failed to load map', duration: Snackbar.LENGTH_SHORT });
          }}
        />

        {locationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.floatingRefreshButton} onPress={fetchLocation} disabled={isRefetching}>
          {isRefetching ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="refresh" size={24} color="white" />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingSelfieButton} onPress={takeSelfie}>
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.statusButton, isOnline ? styles.onlineStatus : styles.offlineStatus]}
          onPress={toggleOnlineStatus}
        >
          <Text style={styles.statusText}>{isOnline ? "You're Online" : 'Go Online'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusButton, useMockLocation ? styles.mockModeActive : styles.offlineStatus]}
          onPress={toggleMockLocation}
        >
          <Text style={styles.statusText}>{useMockLocation ? 'Demo Mode On' : 'Demo Mode Off'}</Text>
        </TouchableOpacity>
      </View>

      <Footer />

      {/* Camera Modal */}
      <Modal visible={cameraModalVisible} animationType="slide" transparent={false}>
        <SafeAreaView style={styles.modalContainer}>
          {cameraReady && device ? (
            <>
              <Camera
                ref={camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={cameraModalVisible}
                photo={true}
              />
              <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
                <Ionicons name="camera" size={40} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setCameraModalVisible(false)}
              >
                <Ionicons name="close" size={30} color="white" />
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noCameraText}>
              {cameraReady ? 'No camera available' : 'Detecting camera...'}
            </Text>
          )}
        </SafeAreaView>
      </Modal>

      {/* Selfie Preview */}
      {selfieUri && (
        <View style={styles.selfiePreview}>
          <Image source={{ uri: selfieUri }} style={styles.selfieImage} />
        </View>
      )}
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
    borderRadius: 20,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    margin: 5,
    marginBottom: 45,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  map: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
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
  errorContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  footer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 140,
    alignItems: 'center',
  },
  onlineStatus: {
    backgroundColor: '#28a745',
  },
  offlineStatus: {
    backgroundColor: '#dc3545',
  },
  mockModeActive: {
    backgroundColor: '#17a2b8',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  floatingRefreshButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#E88801',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 2000,
  },
  floatingSelfieButton: {
    position: 'absolute',
    right: 80,
    bottom: 20,
    backgroundColor: '#E88801',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 2000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: '#E88801',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCameraText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
  selfiePreview: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: 'hidden',
    zIndex: 2000,
  },
  selfieImage: {
    width: '100%',
    height: '100%',
  },
});

export default Home;