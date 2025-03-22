import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '../routes/AppStack';

type RideInProgressProps = NativeStackScreenProps<
  AppStackParamList,
  'RideInProgress'
>;

// Dummy data for testing
const DUMMY_DATA = {
  rideId: 'ride_123456',
  status: 'pickup', // pickup, in_progress, arriving
  customer: {
    name: 'Amit Kumar',
    phone: '+917890123456',
    rating: 4.7,
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  pickup: {
    address: 'MG Road, Bangalore',
    latitude: 12.9716,
    longitude: 77.5946,
    instructions: 'Near Coffee Day, waiting outside',
  },
  dropoff: {
    address: 'Koramangala, Bangalore',
    latitude: 12.9352,
    longitude: 77.6245,
  },
  fare: '₹320',
  distance: '8.5 km',
  duration: '28 min',
  paymentMethod: 'Cash',
};

const RideInProgress = ({navigation, route}: RideInProgressProps) => {
  // Get ride data from route params or use dummy data
  const rideData = route.params?.rideData || DUMMY_DATA;

  const [rideStatus, setRideStatus] = useState(rideData.status);
  const [isLoading, setIsLoading] = useState(false);
  const [eta, setEta] = useState('12 min');
  const webViewRef = useRef(null);

  // Simulate ride progress
  useEffect(() => {
    const statusSequence = [
      {status: 'pickup', delay: 10000, message: 'Arrived at pickup'},
      {status: 'in_progress', delay: 15000, message: 'Ride in progress'},
      {status: 'arriving', delay: 12000, message: 'Arriving at destination'},
      {status: 'completed', delay: 5000, message: 'Ride completed'},
    ];

    let currentIndex = statusSequence.findIndex(s => s.status === rideStatus);
    if (currentIndex === -1) currentIndex = 0;

    const timer = setTimeout(() => {
      if (currentIndex < statusSequence.length - 1) {
        const nextStatus = statusSequence[currentIndex + 1];

        // Show alert about status change
        Alert.alert(nextStatus.message);

        // Update map when starting the ride
        if (nextStatus.status === 'in_progress' && webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            updateRouteToDestination();
            true;
          `);
        }

        // Update the status
        setRideStatus(nextStatus.status);

        // Navigate to ride complete when the ride is completed
        if (nextStatus.status === 'completed') {
          setTimeout(() => {
            navigation.replace('RideComplete', {rideData: rideData});
          }, 2000);
        }
      }
    }, statusSequence[currentIndex].delay);

    return () => clearTimeout(timer);
  }, [rideStatus, navigation]);

  // Call customer
  const callCustomer = () => {
    Linking.openURL(`tel:${rideData.customer.phone}`);
  };

  // Cancel ride
  const cancelRide = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
      {text: 'No', style: 'cancel'},
      {
        text: 'Yes',
        style: 'destructive',
        onPress: () => {
          setIsLoading(true);

          // Simulate API call delay
          setTimeout(() => {
            setIsLoading(false);
            navigation.replace('Home');
          }, 1500);
        },
      },
    ]);
  };

  // Mark as arrived at pickup
  const markAsArrived = () => {
    if (rideStatus === 'pickup') {
      setRideStatus('in_progress');

      // Update route in map
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`
          updateRouteToDestination();
          true;
        `);
      }

      Alert.alert(
        'Ride Started',
        'You have started the ride to the destination.',
      );
    }
  };

  // Complete ride when arrived at destination
  const completeRide = () => {
    if (rideStatus === 'arriving') {
      setIsLoading(true);

      // Prepare complete ride data with earnings information
      const completeRideData = {
        rideId: rideData.rideId,
        customer: rideData.customer,
        pickup: {
          ...rideData.pickup,
          time: '10:15 AM', // In a real app, record actual time
        },
        dropoff: {
          ...rideData.dropoff,
          time: '10:43 AM', // In a real app, record actual time
        },
        fare: {
          base: 80,
          distance: 200,
          time: 30,
          total: parseInt(rideData.fare.replace(/[^0-9]/g, '')),
          driverEarnings: Math.round(
            parseInt(rideData.fare.replace(/[^0-9]/g, '')) * 0.8,
          ),
        },
        distance: rideData.distance,
        duration: rideData.duration,
        paymentMethod: rideData.paymentMethod,
        paymentStatus: 'Collected',
        date: new Date().toDateString(),
      };

      // Simulate API call delay
      setTimeout(() => {
        setIsLoading(false);
        navigation.replace('RideComplete', {rideData: completeRideData});
      }, 1500);
    }
  };
  // Generate map HTML
  const mapHTML = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Driver Navigation</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine/dist/leaflet-routing-machine.css" />
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
      <script src="https://unpkg.com/leaflet-routing-machine"></script>
      <style>
        html, body, #map {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${rideData.pickup.latitude}, ${
    rideData.pickup.longitude
  }], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
        
        // Define custom icons
        var driverIcon = L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/3097/3097144.png',
          iconSize: [35, 35],
          iconAnchor: [17, 17]
        });
        
        var pickupIcon = L.icon({
          iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
          iconSize: [35, 35],
          iconAnchor: [17, 35]
        });
        
        var dropoffIcon = L.icon({
          iconUrl: 'https://cdn1.iconfinder.com/data/icons/maps-and-navigation-8/52/map_pin_destination_location_navigation_pin_geolocation-512.png',
          iconSize: [35, 35],
          iconAnchor: [17, 35]
        });
        
        // Create markers
        var pickupMarker = L.marker([${rideData.pickup.latitude}, ${
    rideData.pickup.longitude
  }], {
          icon: pickupIcon
        }).addTo(map).bindPopup("Pickup: ${rideData.pickup.address}");
        
        var dropoffMarker = L.marker([${rideData.dropoff.latitude}, ${
    rideData.dropoff.longitude
  }], {
          icon: dropoffIcon
        }).addTo(map).bindPopup("Dropoff: ${rideData.dropoff.address}");
        
        // Add driver marker at slightly offset position
        var driverLat = ${rideData.pickup.latitude + 0.001};
        var driverLng = ${rideData.pickup.longitude - 0.002};
        var driverMarker = L.marker([driverLat, driverLng], {
          icon: driverIcon
        }).addTo(map).bindPopup("Your location");
        
        // Initial route to pickup
        var routeControl = L.Routing.control({
          waypoints: [
            L.latLng(driverLat, driverLng),
            L.latLng(${rideData.pickup.latitude}, ${rideData.pickup.longitude})
          ],
          routeWhileDragging: false,
          lineOptions: {
            styles: [
              {color: 'black', opacity: 0.15, weight: 9},
              {color: 'white', opacity: 0.8, weight: 6},
              {color: '#E88801', opacity: 1, weight: 4}
            ]
          },
          createMarker: function() { return null; },
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: false
        }).addTo(map);
        
        // Hide the routing control UI
        routeControl.hide();
        
        // Function to update route to destination
        function updateRouteToDestination() {
          // Update driver marker to pickup location
          driverMarker.setLatLng([${rideData.pickup.latitude}, ${
    rideData.pickup.longitude
  }]);
          
          // Update route to go from pickup to dropoff
          routeControl.setWaypoints([
            L.latLng(${rideData.pickup.latitude}, ${rideData.pickup.longitude}),
            L.latLng(${rideData.dropoff.latitude}, ${
    rideData.dropoff.longitude
  })
          ]);
          
          // Fit map to show the new route
          setTimeout(function() {
            map.fitBounds([
              [${rideData.pickup.latitude}, ${rideData.pickup.longitude}],
              [${rideData.dropoff.latitude}, ${rideData.dropoff.longitude}]
            ], { padding: [50, 50] });
          }, 1000);
        }
        
        // Fit map to show both pickup and dropoff
        map.fitBounds([
          [${rideData.pickup.latitude}, ${rideData.pickup.longitude}],
          [${rideData.dropoff.latitude}, ${rideData.dropoff.longitude}]
        ], { padding: [50, 50] });
      </script>
    </body>
  </html>
  `;

  // Get status-dependent content
  const getStatusContent = () => {
    switch (rideStatus) {
      case 'pickup':
        return {
          title: 'Picking up passenger',
          subtitle: `ETA: ${eta}`,
          buttonText: "I've Arrived at Pickup",
          buttonAction: markAsArrived,
          buttonColor: '#4CAF50',
        };
      case 'in_progress':
        return {
          title: 'Ride in progress',
          subtitle: `Driving to destination • ${rideData.duration} remaining`,
          buttonText: 'Cancel Ride',
          buttonAction: cancelRide,
          buttonColor: '#F44336',
        };
      case 'arriving':
        return {
          title: 'Arriving at destination',
          subtitle: 'Almost there',
          buttonText: 'Complete Ride',
          buttonAction: completeRide,
          buttonColor: '#4CAF50',
        };
      default:
        return {
          title: 'Ride',
          subtitle: '',
          buttonText: 'Cancel Ride',
          buttonAction: cancelRide,
          buttonColor: '#F44336',
        };
    }
  };

  const statusContent = getStatusContent();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{html: mapHTML}}
          style={styles.webView}
        />
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />

        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>{statusContent.title}</Text>
          <Text style={styles.statusSubtitle}>{statusContent.subtitle}</Text>
        </View>

        <View style={styles.customerCard}>
          <Image
            source={{uri: rideData.customer.photo}}
            style={styles.customerPhoto}
          />

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{rideData.customer.name}</Text>
            <View style={styles.ratingContainer}>
              <MaterialIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{rideData.customer.rating}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.callButton} onPress={callCustomer}>
            <MaterialIcons name="phone" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.locationCard}>
          <View style={styles.locationContainer}>
            <View style={styles.iconColumn}>
              <View style={[styles.locationDot, styles.pickupDot]} />
              <View style={styles.locationLine} />
              <View style={[styles.locationDot, styles.dropoffDot]} />
            </View>

            <View style={styles.addressColumn}>
              <View style={styles.addressBlock}>
                <Text style={styles.addressLabel}>PICKUP</Text>
                <Text style={styles.addressText}>
                  {rideData.pickup.address}
                </Text>
                {rideData.pickup.instructions ? (
                  <Text style={styles.instructionsText}>
                    Note: {rideData.pickup.instructions}
                  </Text>
                ) : null}
              </View>

              <View style={styles.addressBlock}>
                <Text style={styles.addressLabel}>DROPOFF</Text>
                <Text style={styles.addressText}>
                  {rideData.dropoff.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <MaterialIcons name="payment" size={20} color="#666" />
            <Text style={styles.detailLabel}>Payment</Text>
            <Text style={styles.detailValue}>{rideData.paymentMethod}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="straighten" size={20} color="#666" />
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>{rideData.distance}</Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="attach-money" size={20} color="#666" />
            <Text style={styles.detailLabel}>Fare</Text>
            <Text style={styles.detailValue}>{rideData.fare}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {backgroundColor: statusContent.buttonColor},
          ]}
          onPress={statusContent.buttonAction}
          disabled={isLoading}>
          <Text style={styles.actionButtonText}>
            {isLoading ? 'Processing...' : statusContent.buttonText}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E88801" />
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  mapContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  customerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E88801',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
  },
  iconColumn: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pickupDot: {
    backgroundColor: '#4CAF50',
  },
  locationLine: {
    width: 2,
    height: 30,
    backgroundColor: '#ddd',
    marginVertical: 4,
  },
  dropoffDot: {
    backgroundColor: '#F44336',
  },
  addressColumn: {
    flex: 1,
  },
  addressBlock: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 15,
    color: '#333',
  },
  instructionsText: {
    fontSize: 13,
    color: '#E88801',
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default RideInProgress;
