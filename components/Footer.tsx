import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // FontAwesome 4
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {AppStackParamList} from '../routes/AppStack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type FooterNavigationProp = NativeStackNavigationProp<AppStackParamList>;

const Footer: React.FC = () => {
  const navigation = useNavigation<FooterNavigationProp>();

  return (
    <SafeAreaView style={styles.bigContainer}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={32} color="#E88801" />
          <Text style={styles.footerText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('History')}>
          <Icon name="history" size={32} color="#E88801" />
          <Text style={styles.footerText}>History</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('DriverProfile')}>
          <Icon name="user-circle" size={32} color="#E88801" />
          <Text style={styles.footerText}>Profile</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('Profile')}>
          <Icon name="user" size={32} color="#E88801" />
          <Text style={styles.footerText}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.footerItem}
          onPress={() => navigation.navigate('Wallet')}>
          <MaterialIcons
                          name="account-balance-wallet"
                          size={32}
                          color="#E88801"
                        />
          <Text style={[styles.footerText]}>Wallet</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bigContainer: {
    height: '10%',
    backgroundColor: 'white', // Ensure background contrasts with icon color
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  footerItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default Footer;
