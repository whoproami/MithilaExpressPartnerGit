import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';


type ActivityData = {
  location: string;
  date: string;
  time: string;
  price: string;
  status: string;
};

const activities: ActivityData[] = [
  // Add your activity data here
  {
    location: 'Bakarganj',
    date: '28 Dec',
    time: '14:59',
    price: '₹14.06',
    status: 'Cancelled',
  },
  {
    location: 'DRCC Patna',
    date: '28 Dec',
    time: '13:39',
    price: '₹26.00',
    status: 'Completed',
  },
  // More activities...
];

const History: React.FC = () => {
  const renderItem = ({ item }: { item: ActivityData }) => (
    <View style={styles.activityItem}>
      <Text style={styles.location}>{item.location}</Text>
      <Text style={styles.dateTime}>
        {item.date} - {item.time}
      </Text>
      <Text style={styles.priceStatus}>
        {item.price} - {item.status}
      </Text>
      <TouchableOpacity style={styles.rebookButton}>
        <Text> Rebook</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Activity</Text>
      <Text style={styles.subHeader}>Past</Text>
      <FlatList
        data={activities}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 50,
  },
  header: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    paddingLeft: 15,
  },
  subHeader: {
    fontSize: 20,
    color: '#fff',
    paddingLeft: 15,
    paddingBottom: 10,
  },
  activityItem: {
    backgroundColor: '#1c1c1e',
    padding: 15,
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  dateTime: {
    fontSize: 14,
    color: '#fff',
  },
  priceStatus: {
    fontSize: 14,
    color: '#fff',
  },
  rebookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
});

export default History;