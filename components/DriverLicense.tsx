import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';

export default function DriverLicense() {
  const navigation = useNavigation();
  const saveLicense = async () => {
    const driverLicenseData = {
      Name: 'John Doe',
      LicenseNumber: 123456789,
      address: '0123 Anystreet, Anytown, CA 01234',
      dob: 19930905,
      issueDate: 20150711,
      expiration_date: 20250711,
    };

    const response = await DriverLicenseService.storeDriverLicense(
      driverLicenseData,
    );
    console.log('Response:', response);
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{uri: 'https://example.com/license-image.jpg'}}
            style={styles.licenseImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.column}>
            <View style={styles.infoCard}>
              <Text style={styles.label}>License Number</Text>
              <Text style={styles.value}>123456789</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>John Doe</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>
                0123 Anystreet, Anytown, CA 01234
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>09/05/1993</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Issue Date</Text>
              <Text style={styles.value}>07/11/2015</Text>
            </View>
          </View>

          <View style={styles.column}>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Expiration Date</Text>
              <Text style={styles.value}>07/11/2025</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Class</Text>
              <Text style={styles.value}>C</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Sex</Text>
              <Text style={styles.value}>M</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Height</Text>
              <Text style={styles.value}>6'0"</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.label}>Weight</Text>
              <Text style={styles.value}>183 lb</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 20,
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
    shadowOffset: {width: 0, height: 1},
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
});
