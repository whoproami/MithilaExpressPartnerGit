import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';

const RegistrationScreen: React.FC = () => {
  const handleTermsPress = () => {
    Linking.openURL('https://example.com/terms'); // Replace with your terms and conditions URL
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Registration</Text>
      <View style={styles.listContainer}>
        <ListItem  title="Basic Info" path='' />
        <ListItem title="Driving License" />
        <ListItem title="Vehicle Info" />
        <ListItem title="Aadhaar Card" />
        {/* Add additional list items here */}
        <ListItem title="Agent Referral Code" optional />
        <ListItem title="Emergency Number" />
      </View>

      <TouchableOpacity style={styles.button} onPress={() => console.log('Registration submitted')}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleTermsPress}>
        <Text style={styles.termsText}>
          By tapping "Submit," you agree to the{' '}
          <Text style={styles.termsLink}>Terms and Conditions</Text>. By acknowledging and agreeing to our Terms and
          Conditions, you also consent to the processing and transfer of your personal data according to our Privacy
          Policy.
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ListItem: React.FC<{ title: string; optional?: boolean ;path:string}> = ({ title, optional,path }) => (
  <TouchableOpacity onPress={path} style={styles.listItem}>
    <Text style={styles.listItemText}>{title}</Text>
    {optional && <Text style={styles.optionalText}>Optional</Text>}
    <Text style={styles.arrow}>➔</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 30,
  },
  header: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  listContainer: {
    width: '100%',
    marginBottom: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  listItemText: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  optionalText: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  arrow: {
    fontSize: 20,
    color: '#009688',
  },
  button: {
    backgroundColor: '#009688',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 22,
  },
  termsLink: {
    color: '#009688',
    textDecorationLine: 'underline',
  },
});

export default RegistrationScreen;