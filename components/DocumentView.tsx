import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StackNavigationProp} from '@react-navigation/stack';
import DocumentService from '../appwrite/DocumentService';
import Snackbar from 'react-native-snackbar';

type DocumentViewProps = {
  navigation: StackNavigationProp<any>;
  route: {
    params: {
      document: any;
    };
  };
};

const DocumentView: React.FC<DocumentViewProps> = ({navigation, route}) => {
  const {document} = route.params;
  const documentService = new DocumentService();

  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    loadDocumentImage();
  }, []);

  const loadDocumentImage = async () => {
    try {
      setLoading(true);
      const result = await documentService.getDocumentPreviewUrl(
        document.fileId,
      );

      if (result.success) {
        setImageUrl(result.previewUrl);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error loading document image:', error);
      Snackbar.show({
        text: 'Failed to load document image',
        duration: Snackbar.LENGTH_SHORT,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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

  const handleReplaceDocument = () => {
    navigation.navigate('DocumentUpload', {
      documentType: document.documentType,
    });
  };

  const handleDeleteDocument = () => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await documentService.deleteDocument(
                document.$id,
                document.fileId,
              );

              if (result.success) {
                Snackbar.show({
                  text: 'Document deleted successfully',
                  duration: Snackbar.LENGTH_SHORT,
                });
                navigation.goBack();
              } else {
                throw new Error(result.error);
              }
            } catch (error) {
              console.error('Error deleting document:', error);
              Snackbar.show({
                text: 'Failed to delete document',
                duration: Snackbar.LENGTH_SHORT,
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {documentService.formatDocumentType(document.documentType)}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Document Status Banner */}
        <View
          style={[
            styles.statusBanner,
            {
              backgroundColor: `${getStatusColor(
                document.verificationStatus,
              )}20`,
            },
          ]}>
          <MaterialIcons
            name={
              document.verificationStatus === 'verified'
                ? 'check-circle'
                : document.verificationStatus === 'pending'
                ? 'schedule'
                : 'warning'
            }
            size={20}
            color={getStatusColor(document.verificationStatus)}
          />
          <Text
            style={[
              styles.statusText,
              {color: getStatusColor(document.verificationStatus)},
            ]}>
            {document.verificationStatus === 'verified'
              ? 'Document Verified'
              : document.verificationStatus === 'pending'
              ? 'Verification Pending'
              : 'Verification Failed'}
          </Text>
        </View>

        {/* Document Image */}
        <View style={styles.imageContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E88801" />
            </View>
          ) : (
            <Image
              source={{uri: imageUrl || undefined}}
              style={styles.documentImage}
              resizeMode="contain"
              onError={() => {
                Snackbar.show({
                  text: 'Error loading image',
                  duration: Snackbar.LENGTH_SHORT,
                });
              }}
            />
          )}
        </View>

        {/* Document Details */}
        <View style={styles.detailsContainer}>
          {document.documentNumber && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Document Number</Text>
              <Text style={styles.detailValue}>{document.documentNumber}</Text>
            </View>
          )}

          {document.documentName && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name on Document</Text>
              <Text style={styles.detailValue}>{document.documentName}</Text>
            </View>
          )}

          {document.issuedDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Issue Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(document.issuedDate)}
              </Text>
            </View>
          )}

          {document.expiryDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expiry Date</Text>
              <Text style={styles.detailValue}>
                {formatDate(document.expiryDate)}
              </Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Upload Date</Text>
            <Text style={styles.detailValue}>
              {formatDate(document.uploadDate)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: `${getStatusColor(
                    document.verificationStatus,
                  )}20`,
                },
              ]}>
              <Text
                style={[
                  styles.statusBadgeText,
                  {color: getStatusColor(document.verificationStatus)},
                ]}>
                {document.verificationStatus.charAt(0).toUpperCase() +
                  document.verificationStatus.slice(1)}
              </Text>
            </View>
          </View>

          {document.verificationStatus === 'rejected' &&
            document.rejectionReason && (
              <View style={styles.rejectionContainer}>
                <Text style={styles.rejectionLabel}>Reason for Rejection</Text>
                <Text style={styles.rejectionText}>
                  {document.rejectionReason}
                </Text>
              </View>
            )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={styles.replaceButton}
            onPress={handleReplaceDocument}>
            <MaterialIcons name="upload-file" size={20} color="#E88801" />
            <Text style={styles.replaceButtonText}>
              {document.verificationStatus === 'rejected'
                ? 'Upload New'
                : 'Replace'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteDocument}>
            <MaterialIcons name="delete" size={20} color="#F44336" />
            <Text style={styles.deleteButtonText}>Delete</Text>
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
    paddingBottom: 30,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#F5F5F5',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  documentImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  detailLabel: {
    fontSize: 16,
    color: '#757575',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rejectionContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  rejectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
  },
  rejectionText: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
  replaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  replaceButtonText: {
    marginLeft: 8,
    color: '#E88801',
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  deleteButtonText: {
    marginLeft: 8,
    color: '#F44336',
    fontWeight: '500',
  },
});

export default DocumentView;
