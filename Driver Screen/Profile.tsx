import React, {useContext, useState, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {AppStackParamList} from '../routes/AppStack';
import {AppwriteContext} from '../appwrite/AuthContext';
import Snackbar from 'react-native-snackbar';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {Query} from 'appwrite';

type ProfileScreenProps = NativeStackScreenProps<AppStackParamList, 'Profile'>;
const {width} = Dimensions.get('window');

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const {appwrite, setisLoggedIn} = useContext(AppwriteContext);
  const [isLoading, setIsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    userId: '',
    status: 'offline',
    rating: 0,
    totalRides: 0,
    earnings: 0,
    distance: 0,
  });

  // Fetch user data from Appwrite
  const fetchUserData = async () => {
    try {
      setProfileLoading(true);

      // Get account information
      const accountInfo = await appwrite.getCurrentUser();

      if (!accountInfo) {
        throw new Error('No user logged in');
      }

      console.log('Account info:', accountInfo);

      // Create user profile with account data
      let userProfile = {
        name: accountInfo.name || '',
        email: accountInfo.email || '',
        phone: '',
        userId: accountInfo.$id,
        status: 'offline',
        rating: 0,
        totalRides: 0,
        earnings: 0,
        distance: 0,
      };

      try {
        // Use Query builder for proper query formatting
        const userDocs = await appwrite.database.listDocuments(
          '65fd621368673fa65790', // DATABASE_ID
          '67d041c60039b2f3c725', // COLLECTION_ID (driver collection)
          [Query.equal('userId', accountInfo.$id)],
        );

        console.log('User documents:', userDocs);

        // Add additional data if found in database
        if (userDocs && userDocs.documents && userDocs.documents.length > 0) {
          const additionalData = userDocs.documents[0];

          // Check if phone exists in the document
          if (additionalData.phone) {
            userProfile.phone = additionalData.phone;
          }

          // If name is empty in account but exists in database, use that
          if (
            (!userProfile.name || userProfile.name === '') &&
            additionalData.name
          ) {
            userProfile.name = additionalData.name;
          }

          // Get driver specific data
          if (additionalData.status) {
            userProfile.status = additionalData.status;
          }

          if (additionalData.rating) {
            userProfile.rating = additionalData.rating;
          }

          if (additionalData.totalRides) {
            userProfile.totalRides = additionalData.totalRides;
          }

          if (additionalData.earnings) {
            userProfile.earnings = additionalData.earnings;
          }

          if (additionalData.distance) {
            userProfile.distance = additionalData.distance;
          }
        }
      } catch (dbError) {
        console.error('Database query error:', dbError);
        // Continue with just the account info if database query fails
      }

      // If still no name, use email or a default
      if (!userProfile.name || userProfile.name === '') {
        userProfile.name =
          userProfile.email.split('@')[0] || 'Mithila Express Driver';
      }

      setUserData(userProfile);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Snackbar.show({
        text: 'Failed to load profile data',
        duration: Snackbar.LENGTH_SHORT,
      });
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const logout = () => {
    setIsLoading(true);
    appwrite
      .logout()
      .then(() => {
        setIsLoading(false);
        Snackbar.show({
          text: 'You have been logged out successfully',
          duration: Snackbar.LENGTH_SHORT,
        });
        setisLoggedIn(false);
      })
      .catch(error => {
        setIsLoading(false);
        Snackbar.show({
          text: 'Failed to logout. Please try again.',
          duration: Snackbar.LENGTH_SHORT,
        });
        console.error('Logout error:', error);
      });
  };

  const profileOptions = [
    {
      id: 'edit-profile',
      title: 'Driver Details',
      icon: 'person-outline',
      color: '#4A90E2',
      onPress: () => navigation.navigate('RegistrationScreen'),
    },
    {
      id: 'earnings',
      title: 'Earnings & Payout',
      icon: 'account-balance-wallet',
      color: '#E88801',
      onPress: () => navigation.navigate('Wallet'),
    },
    {
      id: 'vehicle',
      title: 'Vehicle Information',
      icon: 'directions-car',
      color: '#5ABD8C',
      onPress: () => navigation.navigate('VehicleInfo'),
    },
    {
      id: 'trips',
      title: 'Trip History',
      icon: 'history',
      color: '#FF9800',
      onPress: () => navigation.navigate('TripHistory'),
    },
    {
      id: 'docs',
      title: 'Documents (Licence, RC)',
      icon: 'description',
      color: '#9C27B0',
      onPress:() => navigation.navigate('DrivingLicense'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'headset-mic',
      color: '#03A9F4',
      onPress: () => navigation.navigate('Support'),
    },
    {
      id: 'privacy',
      title: 'Policy',
      icon: 'privacy-tip',
      color: '#FF5252',
      onPress: () => navigation.navigate('Policy'),
    },
    // {
    //   id: 'settings',
    //   title: 'Settings',
    //   icon: 'settings',
    //   color: '#607D8B',
    //   onPress: () => navigation.navigate('Settings'),
    // },
  ];

  const confirmLogout = () => {
    logout();
  };

  // Get initials from name for avatar fallback
  const getInitials = name => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Render star rating
  const renderStars = rating => {
    const stars = [];
    const ratingValue = rating || 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(
          <MaterialIcons
            key={i}
            name="star"
            size={16}
            color="#FFD700"
            style={styles.starIcon}
          />,
        );
      } else {
        stars.push(
          <MaterialIcons
            key={i}
            name="star-outline"
            size={16}
            color="#FFD700"
            style={styles.starIcon}
          />,
        );
      }
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5E4DC7" />

      {/* Profile Header */}
      <LinearGradient
        colors={['#E88801', '#E88801']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.headerGradient}>
        <View style={styles.profileHeader}>
          {profileLoading ? (
            <View style={styles.profileImageContainer}>
              <View style={styles.loadingImagePlaceholder}>
                <ActivityIndicator size="small" color="#fff" />
              </View>
            </View>
          ) : (
            <View style={styles.profileImageContainer}>
              {/* If no image is available, show initials */}
              <View style={styles.profileImage}>
                <Text style={styles.initialsText}>
                  {getInitials(userData.name)}
                </Text>
              </View>
              <TouchableOpacity style={styles.editProfileImageButton}>
                <MaterialIcons name="photo-camera" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          {profileLoading ? (
            <View style={styles.profileInfo}>
              <View style={styles.loadingPlaceholder} />
              <View style={[styles.loadingPlaceholder, {width: '70%'}]} />
              <View style={[styles.loadingPlaceholder, {width: '80%'}]} />
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userData.name || 'Mithila Driver'}
              </Text>

              {userData.phone && (
                <View style={styles.phoneContainer}>
                  <MaterialIcons name="phone" size={16} color="#E1DAFF" />
                  <Text style={styles.phoneNumber}>{userData.phone}</Text>
                </View>
              )}

              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>
                  {userData.rating ? userData.rating.toFixed(1) : '5.0'}
                </Text>
                <View style={styles.starsContainer}>
                  {renderStars(userData.rating || 5)}
                </View>
                <Text style={styles.rideCount}>
                  ({userData.totalRides || 0} rides)
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        userData.status === 'online'
                          ? 'rgba(76, 175, 80, 0.2)'
                          : 'rgba(244, 67, 54, 0.2)',
                    },
                  ]}>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor:
                          userData.status === 'online' ? '#4CAF50' : '#F44336',
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          userData.status === 'online' ? '#4CAF50' : '#F44336',
                      },
                    ]}>
                    {userData.status === 'online' ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Driver Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userData.totalRides || 0}</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        <View style={[styles.statItem, styles.statItemBorder]}>
          <Text style={styles.statValue}>
            ₹{userData.earnings ? userData.earnings.toFixed(0) : '0'}
          </Text>
          <Text style={styles.statLabel}>Earnings</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {userData.distance ? userData.distance.toFixed(0) : '0'} km
          </Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
      </View>

      {/* Menu Options */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.optionsTitle}>Driver Options</Text>
        <View style={styles.menuContainer}>
          {profileOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={styles.menuItem}
              onPress={option.onPress}
              activeOpacity={0.7}>
              <View
                style={[
                  styles.iconContainer,
                  {backgroundColor: `${option.color}15`},
                ]}>
                <MaterialIcons
                  name={option.icon}
                  size={22}
                  color={option.color}
                />
              </View>
              <Text style={styles.menuItemText}>{option.title}</Text>
              <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color="#C5CEE0"
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={confirmLogout}
          activeOpacity={0.8}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="logout" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.versionText}>Mithila Express Partner v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  loadingPlaceholder: {
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
    width: '60%',
  },
  editProfileImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#5E4DC7',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#E1DAFF',
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 5,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starIcon: {
    marginHorizontal: 1,
  },
  rideCount: {
    marginLeft: 5,
    fontSize: 12,
    color: '#E1DAFF',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: -25,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
  },
  statItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#EDF1F7',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222B45',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#8F9BB3',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  optionsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
    textAlign: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF1F7',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#222B45',
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#E88801',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginBottom: 20,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    color: '#8F9BB3',
    fontSize: 12,
    marginBottom: 10,
  },
});

export default ProfileScreen;
