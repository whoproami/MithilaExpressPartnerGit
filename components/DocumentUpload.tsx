import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInput} from 'react-native-gesture-handler';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppwriteContext} from '../appwrite/AuthContext';
import DocumentService from '../appwrite/DocumentService';
import Snackbar from 'react-native-snackbar';
import {PermissionsAndroid} from 'react-native';
import {ID} from 'appwrite';
type DocumentUploadProps = {
  navigation: StackNavigationProp<any>;
  route: {
    params: {
      documentType: string;
    };
  };
};
const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'We need access to your camera to take document photos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Error requesting camera permission:', err);
      return false;
    }
  }
  // iOS handles permissions through Info.plist
  return true;
};

// For storage permissions (needed for picking images)
const requestStoragePermission = async () => {
  if (Platform.OS === 'android') {
    try {
      if (parseInt(Platform.Version as string, 10) >= 33) {
        // Android 13+
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Older Android versions
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Error requesting storage permission:', err);
      return false;
    }
  }
  return true;
};
const DocumentUpload: React.FC<DocumentUploadProps> = ({route, navigation}) => {
  const {documentType} = route.params;
  const {appwrite} = useContext(AppwriteContext);
  const documentService = new DocumentService();

  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentName, setDocumentName] = useState('');

  const [issuedDate, setIssuedDate] = useState<Date | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [showIssuedDatePicker, setShowIssuedDatePicker] = useState(false);
  const [showExpiryDatePicker, setShowExpiryDatePicker] = useState(false);

  const formatDateForDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const handleIssuedDateChange = (event: any, selectedDate?: Date) => {
    setShowIssuedDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setIssuedDate(selectedDate);
    }
  };

  const handleExpiryDateChange = (event: any, selectedDate?: Date) => {
    setShowExpiryDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setExpiryDate(selectedDate);
    }
  };

  const getDocumentTitle = () => {
    switch (documentType) {
      case 'driving_license':
        return 'Driving License';
      case 'vehicle_registration':
        return 'Vehicle Registration (RC)';
      case 'insurance':
        return 'Insurance';
      case 'profile_photo':
        return 'Profile Photo';
      default:
        return documentType
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  const takePhoto = async () => {
    // Request camera permission first
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Snackbar.show({
        text: 'Camera permission is required to take photos',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        cameraType: 'back',
      });

      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri || null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Snackbar.show({
        text: 'Failed to capture photo. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri || null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Snackbar.show({
        text: 'Failed to pick image. Please try again.',
        duration: Snackbar.LENGTH_SHORT,
      });
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      Snackbar.show({
        text: 'Please add a document image',
        duration: Snackbar.LENGTH_SHORT,
      });
      return;
    }

    // Add validation based on document type
    if (
      documentType === 'driving_license' ||
      documentType === 'vehicle_registration'
    ) {
      if (!documentNumber) {
        Snackbar.show({
          text: 'Please enter the document number',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }

      if (!expiryDate) {
        Snackbar.show({
          text: 'Please enter the expiry date',
          duration: Snackbar.LENGTH_SHORT,
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Get current user
      const user = await appwrite.getCurrentUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Determine file mime type from extension
      const mimeType = imageUri.endsWith('.png')
        ? 'image/png'
        : imageUri.endsWith('.jpg') || imageUri.endsWith('.jpeg')
        ? 'image/jpeg'
        : 'application/octet-stream';

      // Upload the file to Appwrite storage
      const uploadResult = await documentService.uploadFileToAppwrite({
        userId: user.$id,
        fileUri: imageUri,
        documentType,
        mimeType,
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Failed to upload file');
      }

      // Create or update the document record in the database
      const result = await documentService.database.createDocument(
        '65fd621368673fa65790',
        '67e637410015db7dc172',
        ID.unique(),
        {
          userId: user.$id,
          documentType,
          documentNumber,
          documentName,
          issuedDate: issuedDate ? issuedDate.toISOString() : '',
          expiryDate: expiryDate ? expiryDate.toISOString() : '',
          fileId: uploadResult.fileId,
          uploadDate: new Date().toISOString(),
          verificationStatus: 'pending',
          rejectionReason: '',
        },
      );

      Snackbar.show({
        text: `${getDocumentTitle()} uploaded successfully`,
        duration: Snackbar.LENGTH_SHORT,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Error uploading document:', error);
      Snackbar.show({
        text: error.message || 'Failed to upload document',
        duration: Snackbar.LENGTH_SHORT,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload {getDocumentTitle()}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          <Text style={styles.instruction}>
            Please upload a clear photo of your{' '}
            {getDocumentTitle().toLowerCase()}
          </Text>

          {/* Document Image */}
          <View style={styles.imageSection}>
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{uri: imageUri}}
                  style={styles.documentImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}>
                  <MaterialIcons name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadPlaceholder}>
                <MaterialIcons name="file-upload" size={40} color="#E88801" />
                <Text style={styles.uploadText}>Upload Document Image</Text>
              </View>
            )}

            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                <MaterialIcons name="camera-alt" size={20} color="#E88801" />
                <Text style={styles.imageButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <MaterialIcons name="photo-library" size={20} color="#E88801" />
                <Text style={styles.imageButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Document Details - conditionally show based on document type */}
          {(documentType === 'driving_license' ||
            documentType === 'vehicle_registration') && (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Document Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                  placeholder="Enter document number"
                  placeholderTextColor="#9E9E9E"
                />
              </View>

              {documentType === 'driving_license' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>
                    Full Name (as on license)
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    value={documentName}
                    onChangeText={setDocumentName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9E9E9E"
                  />
                </View>
              )}

              <View style={styles.dateContainer}>
                <View style={styles.dateField}>
                  <Text style={styles.inputLabel}>Issue Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowIssuedDatePicker(true)}>
                    <Text style={styles.dateText}>
                      {issuedDate
                        ? formatDateForDisplay(issuedDate)
                        : 'Select date'}
                    </Text>
                    <MaterialIcons
                      name="calendar-today"
                      size={20}
                      color="#757575"
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.dateField}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowExpiryDatePicker(true)}>
                    <Text style={styles.dateText}>
                      {expiryDate
                        ? formatDateForDisplay(expiryDate)
                        : 'Select date'}
                    </Text>
                    <MaterialIcons
                      name="calendar-today"
                      size={20}
                      color="#757575"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date Pickers */}
              {showIssuedDatePicker && (
                <DateTimePicker
                  value={issuedDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleIssuedDateChange}
                />
              )}

              {showExpiryDatePicker && (
                <DateTimePicker
                  value={expiryDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={handleExpiryDateChange}
                />
              )}
            </>
          )}

          {/* Note about verification */}
          <View style={styles.noteContainer}>
            <MaterialIcons name="info" size={18} color="#757575" />
            <Text style={styles.noteText}>
              Your document will be verified by our team. This may take up to 24
              hours.
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Upload Document</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  formContainer: {
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#424242',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 10,
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
  },
  uploadText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFF5E6',
  },
  imageButtonText: {
    marginLeft: 8,
    color: '#E88801',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#212121',
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateField: {
    width: '48%',
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#212121',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  noteText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#E88801',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#FFB74D',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DocumentUpload;
