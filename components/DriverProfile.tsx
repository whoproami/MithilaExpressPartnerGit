import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'

const DriverProfile = ({ navigation }) => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerText}>Driver Profile</Text>
            </View> 

            {/* Scrollable Content */}
            <ScrollView style={styles.content}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileHeader}>
                        {/* You can replace this with your own profile image component */}
                        <View style={styles.profileIconPlaceholder}>
                            <Text style={styles.profileIconText}>JD</Text>
                        </View>
                        <View>
                            <Text style={styles.name}>John Doe</Text>
                            <Text style={styles.driverId}>Driver ID: DR123456</Text>
                        </View>
                    </View>

                    {/* Profile Options */}
                    <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate('VehicleInfo')}>
                        <Text style={styles.optionIcon}>🚗</Text>
                        <Text style={styles.optionText}>Vehicle Information</Text>
                        <Text style={styles.arrow}>></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard} onPress={() => navigation.navigate('DrivingLicense')}>
                        <Text style={styles.optionIcon}>📝</Text>
                        <Text style={styles.optionText}>Driving License</Text>
                        <Text style={styles.arrow}>></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard}>
                        <Text style={styles.optionIcon}>💳</Text>
                        <Text style={styles.optionText}>Payment Details</Text>
                        <Text style={styles.arrow}>></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard}>
                        <Text style={styles.optionIcon}>⭐</Text>
                        <Text style={styles.optionText}>Ratings & Reviews</Text>
                        <Text style={styles.arrow}>></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard}>
                        <Text style={styles.optionIcon}>📅</Text>
                        <Text style={styles.optionText}>Trip History</Text>
                        <Text style={styles.arrow}>></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionCard}>
                        <Text style={styles.optionIcon}>⚙️</Text>
                        <Text style={styles.optionText}>Account Settings</Text>
                        <Text style={styles.arrow}>></Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default DriverProfile

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        backgroundColor: '#ffcc80', // Light orange header
        padding: 20,
        paddingTop: 18,
        alignItems: 'center',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    profileSection: {
        padding: 20,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    profileIconPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ff9500',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    profileIconText: {
        fontSize: 24,
        color: '#ffffff',
        fontWeight: 'bold',
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    driverId: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionIcon: {
        fontSize: 24,
        marginRight: 15,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    arrow: {
        fontSize: 20,
        color: '#666',
    },
})