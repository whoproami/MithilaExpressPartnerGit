import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../routes/AppStack';

type RideCompleteProps = NativeStackScreenProps<
  AppStackParamList,
  'RideComplete'
>;

// Dummy data for testing
const DUMMY_DATA = {
  rideId: 'ride_123456',
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
    time: '10:15 AM',
  },
  dropoff: {
    address: 'Koramangala, Bangalore',
    latitude: 12.9352,
    longitude: 77.6245,
    time: '10:43 AM',
  },
  fare: {
    base: 80,
    distance: 200,
    time: 30,
    total: 320,
    driverEarnings: 256, // 80% of total
  },
  distance: '8.5 km',
  duration: '28 min',
  paymentMethod: 'Cash',
  paymentStatus: 'Collected',
  date: new Date().toDateString(),
};

const RideComplete = ({ navigation, route }: RideCompleteProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Use route params if available, otherwise use dummy data
  const rideData = route.params?.rideData || DUMMY_DATA;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `₹${amount}`;
  };

  // Navigate back to home screen
  const goToHome = () => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.checkCircle}>
            <MaterialIcons name="check" size={36} color="white" />
          </View>
          <Text style={styles.headerTitle}>Ride Completed</Text>
          <Text style={styles.headerSubtitle}>
            Ride ID: {rideData.rideId}
          </Text>
          <Text style={styles.dateText}>{rideData.date}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Passenger Information</Text>
          <View style={styles.customerInfo}>
            <Image
              source={{ uri: rideData.customer.photo }}
              style={styles.customerPhoto}
            />
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{rideData.customer.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{rideData.customer.rating}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ride Details</Text>
          
          <View style={styles.locationContainer}>
            <View style={styles.iconColumn}>
              <View style={[styles.locationDot, styles.pickupDot]} />
              <View style={styles.locationLine} />
              <View style={[styles.locationDot, styles.dropoffDot]} />
            </View>
            
            <View style={styles.addressColumn}>
              <View style={styles.addressBlock}>
                <Text style={styles.addressLabel}>PICKUP • {rideData.pickup.time}</Text>
                <Text style={styles.addressText}>{rideData.pickup.address}</Text>
              </View>
              
              <View style={styles.addressBlock}>
                <Text style={styles.addressLabel}>DROPOFF • {rideData.dropoff.time}</Text>
                <Text style={styles.addressText}>{rideData.dropoff.address}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.tripDetails}>
            <View style={styles.detailRow}>
              <MaterialIcons name="straighten" size={20} color="#666" />
              <Text style={styles.detailLabel}>Distance</Text>
              <Text style={styles.detailValue}>{rideData.distance}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="access-time" size={20} color="#666" />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{rideData.duration}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="payment" size={20} color="#666" />
              <Text style={styles.detailLabel}>Payment</Text>
              <Text style={styles.detailValue}>{rideData.paymentMethod}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>{rideData.paymentStatus}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Earnings Breakdown</Text>
          
          <View style={styles.fareBreakdown}>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Base Fare</Text>
              <Text style={styles.fareValue}>{formatCurrency(rideData.fare.base)}</Text>
            </View>
            
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Distance Charge ({rideData.distance})</Text>
              <Text style={styles.fareValue}>{formatCurrency(rideData.fare.distance)}</Text>
            </View>
            
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Time Charge ({rideData.duration})</Text>
              <Text style={styles.fareValue}>{formatCurrency(rideData.fare.time)}</Text>
            </View>
            
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Total Fare</Text>
              <Text style={styles.subtotalValue}>{formatCurrency(rideData.fare.total)}</Text>
            </View>
            
            <View style={styles.platformFeeRow}>
              <Text style={styles.platformFeeLabel}>Platform Fee (20%)</Text>
              <Text style={styles.platformFeeValue}>-{formatCurrency(rideData.fare.total - rideData.fare.driverEarnings)}</Text>
            </View>
            
            <View style={styles.earningsRow}>
              <Text style={styles.earningsLabel}>Your Earnings</Text>
              <Text style={styles.earningsValue}>{formatCurrency(rideData.fare.driverEarnings)}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.doneButton}
          onPress={goToHome}
          disabled={isLoading}
        >
          <Text style={styles.doneButtonText}>
            {isLoading ? 'Loading...' : 'Done'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E88801" />
          <Text style={styles.loadingText}>Please wait...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

// Complete the styling section

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  checkCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#888',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  customerDetails: {
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
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  iconColumn: {
    width: 24,
    alignItems: 'center',
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
    height: 40,
    backgroundColor: '#ddd',
    marginVertical: 4,
  },
  dropoffDot: {
    backgroundColor: '#F44336',
  },
  addressColumn: {
    flex: 1,
    marginLeft: 12,
  },
  addressBlock: {
    marginBottom: 16,
  },
  addressLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
  },
  tripDetails: {
    marginTop:0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  fareBreakdown: {
    marginTop: 8,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 14,
    color: '#666',
  },
  fareValue: {
    fontSize: 14,
    color: '#333',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 12,
  },
  subtotalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  subtotalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  platformFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  platformFeeLabel: {
    fontSize: 14,
    color: '#666',
  },
  platformFeeValue: {
    fontSize: 14,
    color: '#F44336',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  earningsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  doneButton: {
    backgroundColor: '#E88801',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});

export default RideComplete;