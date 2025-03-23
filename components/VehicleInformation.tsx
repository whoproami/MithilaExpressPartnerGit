import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {AppStackParamList} from '../routes/AppStack'; // Ensure this path is correct

type VehicleInfoScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'VehicleInformation'
>;

const VehicleInformation: React.FC = () => {
  const navigation = useNavigation<VehicleInfoScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock vehicle data (replace with actual data fetching logic)
  const vehicleData = {
    make: 'Toyota',
    model: 'Camry',
    year: '2020',
    licensePlate: 'ABC 1234',
    vin: '1HGCM82633A004352',
    imageUri: 'https://example.com/vehicle-image.jpg',
  };

  const handleEditVehicle = () => {
    console.log('Edit vehicle pressed');
    // Example: navigation.navigate('EditVehicle', { vehicleId: 'some-id' });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Information</Text>
      </View>

      {/* Loading Indicator */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E88801" />
          <Text style={styles.loadingText}>Loading vehicle information...</Text>
        </View>
      ) : (
        <View style={{flex: 1}}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Vehicle Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{uri: vehicleData.imageUri}}
                style={styles.vehicleImage}
                resizeMode="contain"
                onError={() => console.log('Failed to load vehicle image')}
              />
            </View>

            {/* Vehicle Details */}
            <View style={styles.content}>
              <View style={styles.infoCard}>
                <Text style={styles.label}>Vehicle Make</Text>
                <Text style={styles.value}>{vehicleData.make}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.label}>Model</Text>
                <Text style={styles.value}>{vehicleData.model}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.label}>Year</Text>
                <Text style={styles.value}>{vehicleData.year}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.label}>License Plate</Text>
                <Text style={styles.value}>{vehicleData.licensePlate}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.label}>VIN</Text>
                <Text style={styles.value}>{vehicleData.vin}</Text>
              </View>
            </View>
          </ScrollView>

          {/* Floating Edit Button */}
          <TouchableOpacity
            style={styles.floatingEditButton}
            onPress={handleEditVehicle}>
            <Ionicons name="pencil" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#E88801',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    paddingBottom: 80, // Space for floating button
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vehicleImage: {
    width: '90%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2A44',
    lineHeight: 24,
  },
  floatingEditButton: {
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
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
});

export default VehicleInformation;
