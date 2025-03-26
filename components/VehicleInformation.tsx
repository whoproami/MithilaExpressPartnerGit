import React, { useState, useEffect } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AppStackParamList } from '../routes/AppStack';
import DatabaseService from '../appwrite/DatabaseService'; // Adjust the import path

type VehicleInfoScreenNavigationProp = NativeStackNavigationProp<
  AppStackParamList,
  'VehicleInformation'
>;

const VehicleInformation: React.FC = () => {
  const navigation = useNavigation<VehicleInfoScreenNavigationProp>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [vehicleData, setVehicleData] = useState<null | {
    make: string;
    model: string;
    year?: number;
    license_plate: string;
    vin?: number;
    photo: string;
  }>(null);
  const [error, setError] = useState<string | null>(null);

  const databaseService = new DatabaseService();

  // Dummy data to use when userId is not provided
  const dummyVehicleData = {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    license_plate: 'ABC 1234',
    vin: 12345678901234567,
    photo: 'https://example.com/vehicle-image.jpg',
  };

  useEffect(() => {
    fetchVehicleData();
  }, []);

  const fetchVehicleData = async () => {
    try {
      setIsLoading(true);
      // Replace this with your actual logic to get userId (e.g., from auth context or navigation params)
      const userId = undefined; // For now, simulating no userId; replace with actual userId if available

      if (userId) {
        // Fetch real data if userId is provided
        const response = await databaseService.getVehicleInformation(userId);

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch vehicle data');
        }

        if (response.documents && response.documents.length > 0) {
          const vehicle = response.documents[0];
          setVehicleData({
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            license_plate: vehicle.license_plate,
            vin: vehicle.vin,
            photo: vehicle.photo,
          });
        } else {
          setError('No vehicle information found for this user');
        }
      } else {
        // Use dummy data if no userId is provided
        console.log('No userId provided, using dummy data');
        setVehicleData(dummyVehicleData);
      }
    } catch (err) {
      console.error('Error fetching vehicle data:', err);
      setError('Failed to load vehicle information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditVehicle = () => {
    console.log('Edit vehicle pressed');
    if (vehicleData) {
      navigation.navigate('EditVehicle', { vehicleData });
    }
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

      {/* Loading/Error States */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E88801" />
          <Text style={styles.loadingText}>Loading vehicle information...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchVehicleData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {/* Vehicle Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: vehicleData?.photo || 'https://example.com/placeholder.jpg' }}
                style={styles.vehicleImage}
                resizeMode="contain"
                onError={() => console.log('Failed to load vehicle image')}
              />
            </View>

            {/* Vehicle Details */}
            <View style={styles.content}>
              <View style={styles.infoCard}>
                <Text style={styles.label}>Vehicle Make</Text>
                <Text style={styles.value}>{vehicleData?.make || 'N/A'}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.label}>Model</Text>
                <Text style={styles.value}>{vehicleData?.model || 'N/A'}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.label}>Year</Text>
                <Text style={styles.value}>{vehicleData?.year || 'N/A'}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.label}>License Plate</Text>
                <Text style={styles.value}>{vehicleData?.license_plate || 'N/A'}</Text>
              </View>

              <View style={styles.infoCard}>
                <Text style={styles.label}>VIN</Text>
                <Text style={styles.value}>{vehicleData?.vin || 'N/A'}</Text>
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

// Styles remain unchanged
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
    shadowOffset: { width: 0, height: 2 },
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#E88801',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 80,
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
    shadowOffset: { width: 0, height: 1 },
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
    shadowOffset: { width: 0, height: 1 },
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
});

export default VehicleInformation;