import {ID, Client, Databases, Query} from 'appwrite';
import {latLngToCell, gridDisk} from 'h3-js';
import Snackbar from 'react-native-snackbar';

const appwriteClient = new Client();
const databases = new Databases(appwriteClient);

const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '65f81754567f2cdc753d';
const DATABASE_ID = '65fd621368673fa65790';
const DRIVER_LOCATION_COLLECTION_ID = '67d820bd002a2017adcc';
const DRIVER_LICENSE_COLLECTION_ID = '67e24a70003ab6023769';
const VEHICLE_COLLECTION_ID = '67e248d800109b26028c';

type DriverLocationInfo = {
  userId: string; // Unique identifier for the driver
  Phoneno: string; // Driver's phone number
  latitude: number; // Driver's latitude
  longitude: number; // Driver's longitude
  vehicleType: string; // Type of vehicle (e.g., car, bike, auto)
};
type DriverLicenseInfo = {
  Name: string;
  LicenseNumber: number;
  address: string;
  dob: number;
  issueDate?: number;
  expiration_date?: number;
};
type DriverVehicleInfo = {
  photo: string;
  model: string;
  year?: number;
  license_plate: string;
  vin?: number;
};


class DatabaseService {
  constructor() {
    console.log('DatabaseService initialized');
    appwriteClient
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
  }

  async setuserLocation({
    userId,
    phoneno,
    latitude,
    longitude,
    vehicleType,
  }: DriverLocationInfo) {
    console.log('setuserLocation called with:', {
      userId,
      phoneno,
      latitude,
      longitude,
      vehicleType,
    });

    if (!userId) {
      console.error('User ID is undefined');
      return {success: false, error: 'User ID is undefined'};
    }

    try {
      // Generate H3 index at resolution 9
      console.log('Generating H3 index for coordinates:', latitude, longitude);
      const h3Index = latLngToCell(latitude, longitude, 9);
      console.log('H3 index generated:', h3Index);

      // Current timestamp for lastUpdated field
      const timestamp = new Date().toISOString();
      console.log('Current timestamp:', timestamp);

      // Check if there's an existing document for this user
      console.log('Checking for existing driver document with userId:', userId);
      const existingDocuments = await databases.listDocuments(
        DATABASE_ID,
        DRIVER_LOCATION_COLLECTION_ID,
        [Query.equal('userId', userId)],
      );

      console.log('Found documents:', existingDocuments.total);

      let documentId;

      if (existingDocuments.total > 0) {
        // Update existing document
        documentId = existingDocuments.documents[0].$id;
        console.log('Updating existing document:', documentId);

        const updatedDoc = await databases.updateDocument(
          DATABASE_ID,
          DRIVER_LOCATION_COLLECTION_ID,
          documentId,
          {
            h3Index: h3Index,
            latitude: latitude,
            longitude: longitude,
            Phoneno: phoneno,
            status: 'online',
            lastUpdated: timestamp,
            vehicleType: vehicleType,
          },
        );

        console.log('Driver document updated successfully:', updatedDoc.$id);
        return {success: true, documentId: updatedDoc.$id};
      } else {
        // Create new document
        console.log('Creating new driver document');

        // Create data object exactly matching schema
        const documentData = {
          userId: userId,
          h3Index: h3Index,
          latitude: latitude,
          longitude: longitude,
          Phoneno: phoneno,
          status: 'online',
          lastUpdated: timestamp,
          vehicleType: vehicleType,
        };

        console.log('Document data to be created:', documentData);

        const newDoc = await databases.createDocument(
          DATABASE_ID,
          DRIVER_LOCATION_COLLECTION_ID,
          ID.unique(), // Use auto-generated ID
          documentData,
        );

        console.log('Driver document created successfully:', newDoc.$id);
        return {success: true, documentId: newDoc.$id};
      }
    } catch (err) {
      console.error('Error storing driver location:', err);
      if (err.response) {
        console.error('Response error:', err.response.message);
        console.error('Status code:', err.response.code);
      }
      return {success: false, error: err};
    }
  }

  async setDriverOffline(userId: string) {
    console.log('Setting driver offline:', userId);

    if (!userId) {
      console.error('User ID is undefined');
      return {success: false, error: 'User ID is undefined'};
    }

    try {
      // Find documents with this userId field
      console.log('Finding documents with userId:', userId);
      const documents = await databases.listDocuments(
        DATABASE_ID,
        DRIVER_LOCATION_COLLECTION_ID,
        [Query.equal('userId', userId)],
      );

      if (documents.total === 0) {
        console.log('No documents found for userId:', userId);
        return {success: false, error: 'No document found'};
      }

      // Delete the document or update its status to offline
      const documentId = documents.documents[0].$id;
      console.log('Deleting or updating document:', documentId);

      // Option 1: Delete the document
      await databases.deleteDocument(
        DATABASE_ID,
        DRIVER_LOCATION_COLLECTION_ID,
        documentId,
      );
      console.log('Driver document deleted successfully:', documentId);

      // Option 2: Update the document to set status to offline
      /*
      const updatedDoc = await databases.updateDocument(
        DATABASE_ID,
        DRIVER_LOCATION_COLLECTION_ID,
        documentId,
        {
          status: "offline",
          lastUpdated: new Date().toISOString(),
        }
      );
      console.log("Driver status set to offline:", updatedDoc.$id);
      */

      return {success: true};
    } catch (err) {
      console.error('Error setting driver offline:', err);
      if (err.response) {
        console.error('Response error:', err.response.message);
      }
      return {success: false, error: err};
    }
  }

  // Get all active drivers in a specific area using H3 hexagons
  async getNearbyDrivers(
    latitude: number,
    longitude: number,
    radius: number = 1,
  ) {
    try {
      // Generate H3 index for the given location
      const h3Index = latLngToCell(latitude, longitude, 9);
      console.log('Looking for drivers near H3:', h3Index);

      // Get all cells within k "rings" (hexagonal rings) of the center cell
      const kRing = gridDisk(h3Index, radius);
      console.log(`Searching in ${kRing.length} H3 cells`);

      const result = await databases.listDocuments(
        DATABASE_ID,
        DRIVER_LOCATION_COLLECTION_ID,
        [Query.equal('status', 'online'), Query.in('h3Index', kRing)],
      );

      console.log(`Found ${result.total} online drivers in the area`);
      return result;
    } catch (err) {
      console.error('Error fetching nearby drivers:', err);
      throw err;
    }
  }

  // Helper method to calculate distance between coordinates (Haversine formula)
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    // Implementation of the Haversine formula
    const R = 6371; // Radius of the Earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }

  async storeDriverLicense(data: DriverLicenseInfo) {
    try {
      console.log('Storing driver license:', data);

      const document = await databases.createDocument(
        DATABASE_ID,
        DRIVER_LICENSE_COLLECTION_ID,
        ID.unique(),
        data
      );

      console.log('Driver license stored successfully:', document.$id);
      return { success: true, documentId: document.$id };
    } catch (error) {
      console.error('Error storing driver license:', error);
      return { success: false, error };
    }
  }
  

  async storeVehicleInformation(data: DriverVehicleInfo) {
    try {
      console.log('Storing vehicle information:', data);

      const document = await databases.createDocument(
        DATABASE_ID,
        VEHICLE_COLLECTION_ID,
        ID.unique(),
        data
      );

      console.log('Vehicle information stored successfully:', document.$id);
      return { success: true, documentId: document.$id };
    } catch (error) {
      console.error('Error storing vehicle information:', error);
      return { success: false, error };
    }
  }

}



export default DatabaseService;
