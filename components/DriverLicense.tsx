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
import { useNavigation } from '@react-navigation/native';
import DatabaseService from '../appwrite/DatabaseService'; // Adjust the import path

export default function DriverLicense() {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [licenseData, setLicenseData] = useState<null | {
    Name: string;
    LicenseNumber: number;
    address: string;
    dob: number;
    issueDate?: number;
    expiration_date?: number;
    class?: string;
    sex?: string;
    height?: string;
    weight?: string;
    userId?: string; // Added to associate with a user
  }>(null);
  const [error, setError] = useState<string | null>(null);

  const databaseService = new DatabaseService();

  // Dummy data to use when userId is not provided or no data exists
  const dummyLicenseData = {
    Name: 'John Doe',
    LicenseNumber: 123456789,
    address: '0123 Anystreet, Anytown, CA 01234',
    dob: 19930905, // Format: YYYYMMDD
    issueDate: 20150711,
    expiration_date: 20250711,
    class: 'C',
    sex: 'M',
    height: "6'0\"",
    weight: '183 lb',
    userId: 'dummy-user-id', // Optional, for consistency
  };

  useEffect(() => {
    fetchLicenseData();
  }, []);

  const fetchLicenseData = async () => {
    try {
      setIsLoading(true);
      // Replace with actual logic to get userId (e.g., from auth context or navigation params)
      const userId = undefined; // Simulating no userId; replace with actual userId

      if (userId) {
        const response = await databaseService.getDriverLicenseInformation(userId);

        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch license data');
        }

        if (response.documents && response.documents.length > 0) {
          const license = response.documents[0];
          setLicenseData({
            Name: license.Name,
            LicenseNumber: license.LicenseNumber,
            address: license.address,
            dob: license.dob,
            issueDate: license.issueDate,
            expiration_date: license.expiration_date,
            class: license.class || 'C',
            sex: license.sex || 'M',
            height: license.height || "6'0\"",
            weight: license.weight || '183 lb',
            userId: license.userId || userId,
          });
        } else {
          console.log('No license found, using dummy data');
          setLicenseData({ ...dummyLicenseData, userId });
        }
      } else {
        console.log('No userId provided, using dummy data');
        setLicenseData(dummyLicenseData);
      }
    } catch (err) {
      console.error('Error fetching license data:', err);
      setError('Failed to load driver license information');
    } finally {
      setIsLoading(false);
    }
  };

  const saveLicense = async () => {
    if (!licenseData) return;

    try {
      setIsLoading(true);
      const dataToSave = {
        Name: licenseData.Name,
        LicenseNumber: licenseData.LicenseNumber,
        address: licenseData.address,
        dob: licenseData.dob,
        issueDate: licenseData.issueDate,
        expiration_date: licenseData.expiration_date,
        userId: licenseData.userId || 'default-user-id', // Replace with actual userId
      };

      const response = await databaseService.storeDriverLicense(dataToSave);
      if (response.success) {
        console.log('License saved successfully:', response.documentId);
        // Optionally refresh data after saving
        await fetchLicenseData();
      } else {
        throw new Error(response.error || 'Failed to save license');
      }
    } catch (err) {
      console.error('Error saving license:', err);
      setError('Failed to save driver license');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date from YYYYMMDD to MM/DD/YYYY
  const formatDate = (dateNum: number) => {
    const str = dateNum.toString();
    const year = str.slice(0, 4);
    const month = str.slice(4, 6);
    const day = str.slice(6, 8);
    return `${month}/${day}/${year}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver's License</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff9500" />
          <Text style={styles.loadingText}>Loading license information...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchLicenseData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: 'https://example.com/license-image.jpg' }}
                style={styles.licenseImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.column}>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>License Number</Text>
                  <Text style={styles.value}>{licenseData?.LicenseNumber || 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>Full Name</Text>
                  <Text style={styles.value}>{licenseData?.Name || 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>Address</Text>
                  <Text style={styles.value}>{licenseData?.address || 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>Date of Birth</Text>
                  <Text style={styles.value}>
                    {licenseData?.dob ? formatDate(licenseData.dob) : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>Issue Date</Text>
                  <Text style={styles.value}>
                    {licenseData?.issueDate ? formatDate(licenseData.issueDate) : 'N/A'}
                  </Text>
                </View>
              </View>

              <View style={styles.column}>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>Expiration Date</Text>
                  <Text style={styles.value}>
                    {licenseData?.expiration_date
                      ? formatDate(licenseData.expiration_date)
                      : 'N/A'}
                  </Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>Class</Text>
                  <Text style={styles.value}>{licenseData?.class || 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>Sex</Text>
                  <Text style={styles.value}>{licenseData?.sex || 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>Height</Text>
                  <Text style={styles.value}>{licenseData?.height || 'N/A'}</Text>
                </View>
                <View style={styles.infoCard}>
                  <Text style={styles.label}>Weight</Text>
                  <Text style={styles.value}>{licenseData?.weight || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Floating Save Button */}
          <TouchableOpacity
            style={styles.floatingSaveButton}
            onPress={saveLicense}>
            <Ionicons name="save" size={24} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 20,
    backgroundColor: '#ff9500',
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
    letterSpacing: 0.2,
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
    marginBottom: 16,
    borderRadius: 12,
  },
  licenseImage: {
    width: 300,
    height: 180,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
  },
  column: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2A44',
    lineHeight: 24,
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
    backgroundColor: '#ff9500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  floatingSaveButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#ff9500',
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