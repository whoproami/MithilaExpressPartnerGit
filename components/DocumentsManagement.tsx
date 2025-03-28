import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StackNavigationProp} from '@react-navigation/stack';
import {AppwriteContext} from '../appwrite/AuthContext';
import DocumentService from '../appwrite/DocumentService';
import Snackbar from 'react-native-snackbar';
import Footer from './Footer';

type Document = {
  $id: string;
  documentType: string;
  documentNumber: string;
  verificationStatus: string;
  fileId: string;
  expiryDate: string;
  uploadDate: string;
  rejectionReason: string;
};

type DocumentsManagementProps = {
  navigation: StackNavigationProp<any>;
};

const DocumentsManagement: React.FC<DocumentsManagementProps> = ({
  navigation,
}) => {
  const {appwrite} = useContext(AppwriteContext);
  const documentService = new DocumentService();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  // Document types needed for drivers
  const requiredDocuments = [
    {
      type: 'profile_photo',
      title: 'Profile Photo',
      icon: 'person',
    },
    {
      type: 'driving_license',
      title: 'Driving License',
      icon: 'card-membership',
    },
    {
      type: 'vehicle_registration',
      title: 'Vehicle Registration (RC)',
      icon: 'directions-car',
    },
    {
      type: 'insurance',
      title: 'Insurance',
      icon: 'security',
    },
  ];

  const fetchDocuments = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const user = await appwrite.getCurrentUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get all user documents
      const result = await documentService.getUserDocuments(user.$id);

      if (result.success) {
        setDocuments(result.documents);
      } else {
        throw new Error(result.error);
      }

      // Check verification status
      const statusResult =
        await documentService.checkDocumentVerificationStatus(user.$id);

      if (statusResult.success) {
        setVerificationStatus(statusResult);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      Snackbar.show({
        text: error.message || 'Failed to load documents',
        duration: Snackbar.LENGTH_SHORT,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    // Add listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDocuments();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    fetchDocuments(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return '#4CAF50';
      case 'pending':
        return '#FFC107';
      case 'rejected':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'rejected':
        return 'cancel';
      default:
        return 'help';
    }
  };

  const getDocumentByType = (type: string) => {
    return documents.find(doc => doc.documentType === type);
  };

  const handleUploadDocument = (documentType: string) => {
    navigation.navigate('DocumentUpload', {documentType});
  };

  const handleViewDocument = (document: Document) => {
    navigation.navigate('DocumentView', {document});
  };

  // Render a single document card
  const renderDocumentCard = ({item}: {item: any}) => {
    const document = getDocumentByType(item.type);
    const isUploaded = !!document;

    return (
      <TouchableOpacity
        style={styles.documentCard}
        onPress={() =>
          isUploaded
            ? handleViewDocument(document)
            : handleUploadDocument(item.type)
        }>
        <View style={styles.documentIconContainer}>
          <MaterialIcons name={item.icon} size={24} color="#E88801" />
        </View>

        <View style={styles.documentInfo}>
          <Text style={styles.documentTitle}>{item.title}</Text>

          {isUploaded ? (
            <View style={styles.statusContainer}>
              <MaterialIcons
                name={getStatusIcon(document.verificationStatus)}
                size={16}
                color={getStatusColor(document.verificationStatus)}
              />
              <Text
                style={[
                  styles.statusText,
                  {color: getStatusColor(document.verificationStatus)},
                ]}>
                {document.verificationStatus.charAt(0).toUpperCase() +
                  document.verificationStatus.slice(1)}
              </Text>
            </View>
          ) : (
            <Text style={styles.notUploadedText}>Not uploaded</Text>
          )}
        </View>

        <View style={styles.actionContainer}>
          {isUploaded ? (
            <MaterialIcons name="chevron-right" size={24} color="#BDBDBD" />
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleUploadDocument(item.type)}>
              <Text style={styles.uploadButtonText}>Upload</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Verification</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E88801" />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : (
        <>
          {/* Verification Status Card */}
          {verificationStatus && (
            <View style={styles.verificationCard}>
              <View style={styles.verificationHeader}>
                <Text style={styles.verificationTitle}>
                  Verification Status
                </Text>

                {verificationStatus.isFullyVerified ? (
                  <View style={styles.verifiedBadge}>
                    <MaterialIcons
                      name="check-circle"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text style={styles.verifiedText}>Fully Verified</Text>
                  </View>
                ) : (
                  <View style={styles.pendingBadge}>
                    <MaterialIcons name="schedule" size={16} color="#FFC107" />
                    <Text style={styles.pendingText}>Verification Pending</Text>
                  </View>
                )}
              </View>

              {!verificationStatus.isFullyVerified && (
                <View style={styles.verificationDetails}>
                  {verificationStatus.missingDocuments.length > 0 && (
                    <Text style={styles.verificationMessage}>
                      <Text style={styles.highlightText}>
                        Missing documents:{' '}
                      </Text>
                      {verificationStatus.missingDocuments
                        .map((doc: string) =>
                          documentService.formatDocumentType(doc),
                        )
                        .join(', ')}
                    </Text>
                  )}

                  {verificationStatus.pendingDocuments.length > 0 && (
                    <Text style={styles.verificationMessage}>
                      <Text style={styles.highlightText}>
                        Pending approval:{' '}
                      </Text>
                      {verificationStatus.pendingDocuments
                        .map((doc: string) =>
                          documentService.formatDocumentType(doc),
                        )
                        .join(', ')}
                    </Text>
                  )}

                  {verificationStatus.rejectedDocuments.length > 0 && (
                    <View>
                      <Text style={styles.verificationMessage}>
                        <Text style={styles.highlightText}>
                          Rejected documents:{' '}
                        </Text>
                        {verificationStatus.rejectedDocuments
                          .map((doc: any) =>
                            documentService.formatDocumentType(doc.type),
                          )
                          .join(', ')}
                      </Text>

                      {verificationStatus.rejectedDocuments.map((doc: any) => (
                        <Text key={doc.type} style={styles.rejectionReason}>
                          ・ {documentService.formatDocumentType(doc.type)}:{' '}
                          {doc.reason}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          <FlatList
            data={requiredDocuments}
            renderItem={renderDocumentCard}
            keyExtractor={item => item.type}
            contentContainerStyle={styles.documentsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#E88801']}
              />
            }
            ListHeaderComponent={
              <Text style={styles.sectionTitle}>Required Documents</Text>
            }
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#757575',
  },
  verificationCard: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    marginLeft: 4,
    color: '#4CAF50',
    fontWeight: '500',
    fontSize: 12,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    marginLeft: 4,
    color: '#FFC107',
    fontWeight: '500',
    fontSize: 12,
  },
  verificationDetails: {
    marginTop: 8,
  },
  verificationMessage: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    lineHeight: 20,
  },
  highlightText: {
    fontWeight: '600',
    color: '#212121',
  },
  rejectionReason: {
    fontSize: 14,
    color: '#F44336',
    marginLeft: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
    marginHorizontal: 16,
  },
  documentsList: {
    paddingBottom: 20,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  documentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 4,
  },
  notUploadedText: {
    fontSize: 14,
    color: '#757575',
  },
  actionContainer: {
    paddingLeft: 8,
  },
  uploadButton: {
    backgroundColor: '#E88801',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
});

export default DocumentsManagement;
