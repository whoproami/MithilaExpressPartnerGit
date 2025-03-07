import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Modal, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

type Location = {
  latitude: number;
  longitude: number;
};

type Props = {};
type State = {
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  markerLocation: Location;
  pickupLocation: Location | null;
  dropoffLocation: Location | null;
  modalVisible: boolean;
  price: number;
};

const TransportOption = ({ type, price, eta }: { type: string; price: number; eta: number }) => {
  return (
    <View style={styles.transportOption}>
      <Text>{type}</Text>
      <Text>Price: ${price}</Text>
      <Text>ETA: {eta} mins</Text>
    </View>
  );
};

export default class RideSharingScreen extends React.Component<Props, State> {
  state: State = {
    region: {
      latitude: 26.7182, // Latitude for Janakpur, Nepal
      longitude: 85.9224, // Longitude for Janakpur, Nepal
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    markerLocation: {
      latitude: 0,
      longitude: 0,
    },
    pickupLocation: null,
    dropoffLocation: null,
    modalVisible: false,
    price: 0,
  };

  componentDidMount() {
    this.getCurrentLocation();
  }

  getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        this.setState({ region, markerLocation: { latitude, longitude } });
      },
      error => {
        console.log('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
    );
  };

  findDriver = () => {
    this.setState({ modalVisible: true });
    this.calculatePrice();
  };

  calculatePrice = () => {
    const price = 10; // Placeholder for demonstration
    this.setState({ price });
  };

  setDropoffLocation = (location: Location) => {
    this.setState({ dropoffLocation: location });
  };

  setPickupLocation = (location: Location) => {
    this.setState({ pickupLocation: location });
  };

  onRegionChangeComplete = (region: any) => {
    this.setState({ markerLocation: region });
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={this.state.region}
            onRegionChangeComplete={this.onRegionChangeComplete}
          >
            <Marker coordinate={this.state.markerLocation} />
            {this.state.pickupLocation && (
              <Marker coordinate={this.state.pickupLocation} pinColor="blue" />
            )}
            {this.state.dropoffLocation && (
              <Marker coordinate={this.state.dropoffLocation} pinColor="green" />
            )}
          </MapView>
        </View>
        <View style={styles.bottomSheet}>
          <TouchableOpacity style={styles.locationButton} onPress={() => this.setPickupLocation(this.state.markerLocation)}>
            <Text style={styles.locationButtonText}>Set Pickup Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.locationButton} onPress={() => this.setDropoffLocation(this.state.markerLocation)}>
            <Text style={styles.locationButtonText}>Set Drop-off Location</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.findDriverButton} onPress={this.findDriver}>
            <Text style={styles.findDriverText}>Find a driver</Text>
          </TouchableOpacity>
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({ modalVisible: false });
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Driver Found</Text>
              <Text style={styles.modalText}>Driver Name: John Doe</Text>
              <Text style={styles.modalText}>Car Model: Toyota Camry</Text>
              <Text style={styles.modalText}>Estimated Fare: ${this.state.price}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => this.setState({ modalVisible: false })}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <ScrollView style={styles.optionsContainer}>
          <TransportOption type="Bike" price={97} eta={16} />
          <TransportOption type="Auto" price={132} eta={4} />
          <TransportOption type="Cab" price={180} eta={7} />
        </ScrollView>

      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: '40%', // Set map height to 40%
    borderWidth: 1, // Add border
    borderColor: 'black', // Border color
  },
  map: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingVertical: 20,
  },
  locationButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  findDriverButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  findDriverText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginVertical: 10,
  },
  transportOption: {
    backgroundColor: '#EFEFEF',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
