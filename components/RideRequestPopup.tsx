import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Vibration,
  Dimensions,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Sound from 'react-native-sound';

// Enable playback in silence mode (iOS only)
Sound.setCategory('Playback');

// Load sound file
let notificationSound: Sound | null = null;
const loadSound = () => {
  notificationSound = new Sound(
    'notification.mp3', // Make sure to add this file to your android/app/src/main/res/raw and ios/Resources folders
    Sound.MAIN_BUNDLE,
    error => {
      if (error) {
        console.log('Failed to load sound', error);
      }
    },
  );
};

type RideRequestPopupProps = {
  visible: boolean;
  rideData: {
    id: string;
    customerName: string;
    pickupLocation: {
      address: string;
      distance: string; // e.g. "2.5 km away"
      eta: string; // e.g. "5 min"
    };
    dropLocation: {
      address: string;
      distance: string; // e.g. "7.2 km"
    };
    fare: string; // e.g. "₹250"
    paymentMethod: string; // e.g. "Cash", "Online"
    rideType: string; // e.g. "Regular", "Premium"
  } | null;
  onAccept: (rideId: string, rideData: any) => void;
  onReject: (rideId: string) => void;
  onTimeout: () => void;
  timeoutDuration?: number; // in seconds
};

const {width} = Dimensions.get('window');

const RideRequestPopup: React.FC<RideRequestPopupProps> = ({
  visible,
  rideData,
  onAccept,
  onReject,
  onTimeout,
  timeoutDuration = 30,
}) => {
  const [timeLeft, setTimeLeft] = useState(timeoutDuration);
  const [isLoading, setIsLoading] = useState(false);
  const progressAnim = useState(new Animated.Value(1))[0];

  // Start animation and timer when modal becomes visible
  useEffect(() => {
    if (visible && rideData) {
      // Reset timer and animation
      setTimeLeft(timeoutDuration);
      progressAnim.setValue(1);
      setIsLoading(false);

      // // Play sound and vibrate
      // if (Platform.OS === 'android') {
      //   Vibration.vibrate([0, 500, 200, 500]);
      // } else {
      //   Vibration.vibrate([0, 1000]);
      // }

      if (notificationSound) {
        notificationSound.play();
      }

      // Start countdown animation
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: timeoutDuration * 1000,
        useNativeDriver: false,
      }).start();

      // Set up the countdown timer
      const intervalId = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalId);
            onTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(intervalId);
        if (notificationSound) {
          notificationSound.stop();
        }
      };
    }
  }, [visible, rideData, timeoutDuration, progressAnim, onTimeout]);

  // Load sound on component mount
  useEffect(() => {
    loadSound();

    return () => {
      if (notificationSound) {
        notificationSound.release();
        notificationSound = null;
      }
    };
  }, []);

  if (!visible || !rideData) return null;

  const handleAccept = () => {
    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      setIsLoading(false);

      // Create ride data from request data to pass to RideInProgress screen
      const rideDataToPass = {
        rideId: rideData!.id,
        status: 'pickup', // Start with pickup status
        customer: {
          name: rideData!.customerName,
          phone: '+917890123456',
          rating: 4.7,
          photo: 'https://randomuser.me/api/portraits/men/32.jpg',
        },
        pickup: {
          address: rideData!.pickupLocation.address,
          latitude: 12.9716,
          longitude: 77.5946,
          instructions: 'Waiting outside',
        },
        dropoff: {
          address: rideData!.dropLocation.address,
          latitude: 12.9352,
          longitude: 77.6245,
        },
        fare: rideData!.fare,
        distance: rideData!.dropLocation.distance,
        duration: '28 min',
        paymentMethod: rideData!.paymentMethod,
      };

      // Pass ride data to Home's handleAcceptRide
      onAccept(rideData!.id, rideDataToPass);
    }, 1500);
  };

  const handleReject = () => {
    onReject(rideData.id);
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.popupContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>New Ride Request</Text>
            <Animated.View
              style={[styles.progressBar, {width: progressWidth}]}
            />
            <Text style={styles.timer}>{timeLeft}s</Text>
          </View>

          <View style={styles.customerInfo}>
            <View style={styles.customerDetails}>
              <Text style={styles.customerName}>{rideData.customerName}</Text>
              <View style={styles.paymentMethod}>
                <MaterialIcons
                  name={
                    rideData.paymentMethod === 'Cash' ? 'money' : 'credit-card'
                  }
                  size={18}
                  color="#555"
                />
                <Text style={styles.paymentMethodText}>
                  {rideData.paymentMethod}
                </Text>
              </View>
            </View>
            <View style={styles.fareContainer}>
              <Text style={styles.fareLabel}>Estimated Fare</Text>
              <Text style={styles.fareAmount}>{rideData.fare}</Text>
            </View>
          </View>

          <View style={styles.rideDetails}>
            <View style={styles.locationContainer}>
              <View style={styles.iconColumn}>
                <View style={styles.pickupDot} />
                <View style={styles.dashedLine} />
                <View style={styles.dropoffDot} />
              </View>

              <View style={styles.addressColumn}>
                <View style={styles.addressBlock}>
                  <Text style={styles.addressLabel}>PICKUP</Text>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {rideData.pickupLocation.address}
                  </Text>
                  <View style={styles.distanceRow}>
                    <MaterialIcons name="near-me" size={14} color="#E88801" />
                    <Text style={styles.distanceText}>
                      {rideData.pickupLocation.distance} •{' '}
                      {rideData.pickupLocation.eta} away
                    </Text>
                  </View>
                </View>

                <View style={styles.addressBlock}>
                  <Text style={styles.addressLabel}>DROP-OFF</Text>
                  <Text style={styles.addressText} numberOfLines={2}>
                    {rideData.dropLocation.address}
                  </Text>
                  <View style={styles.distanceRow}>
                    <MaterialIcons
                      name="straighten"
                      size={14}
                      color="#E88801"
                    />
                    <Text style={styles.distanceText}>
                      {rideData.dropLocation.distance} total trip distance
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleReject}
              disabled={isLoading}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAccept}
              disabled={isLoading}>
              {isLoading ? (
                <Text style={styles.acceptButtonText}>Accepting...</Text>
              ) : (
                <Text style={styles.acceptButtonText}>Accept</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  popupContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    backgroundColor: '#E88801',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
    width: '100%',
    marginBottom: 4,
  },
  timer: {
    color: 'white',
    fontSize: 14,
  },
  customerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 4,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareLabel: {
    fontSize: 12,
    color: '#777',
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E88801',
  },
  rideDetails: {
    padding: 16,
  },
  locationContainer: {
    flexDirection: 'row',
  },
  iconColumn: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginTop: 6,
  },
  dashedLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#ddd',
    marginVertical: 4,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
    marginBottom: 6,
  },
  addressColumn: {
    flex: 1,
  },
  addressBlock: {
    marginBottom: 12,
  },
  addressLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 12,
    color: '#777',
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rejectButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  rejectButtonText: {
    color: '#777',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RideRequestPopup;
