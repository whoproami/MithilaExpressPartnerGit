import { ID, Client, Databases, Query } from "appwrite";
import { latLngToCell, gridDisk } from "h3-js"; 
import Snackbar from "react-native-snackbar";

const appwriteClient = new Client();
const databases = new Databases(appwriteClient);

const APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "65f81754567f2cdc753d";
const DATABASE_ID = "65fd621368673fa65790";
const DRIVER_LOCATION_COLLECTION_ID = "67d820bd002a2017adcc";

type DriverLocationInfo = {
  userId: string; // Unique identifier for the driver
  Phoneno: string; // Driver's phone number
  latitude: number; // Driver's latitude
  longitude: number; // Driver's longitude
  vehicleType: string; // Type of vehicle (e.g., car, bike, auto)
};

class DatabaseService {
  constructor() {
    console.log("DatabaseService initialized");
    appwriteClient
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);
  }

  async setuserLocation({ userId, phoneno, latitude, longitude, vehicleType }: DriverLocationInfo) {
    console.log("setuserLocation called with:", { userId, phoneno, latitude, longitude, vehicleType });

    if (!userId) {
      console.error("User ID is undefined");
      return { success: false, error: "User ID is undefined" };
    }

    try {
      // Generate H3 index at resolution 9
      console.log("Generating H3 index for coordinates:", latitude, longitude);
      const h3Index = latLngToCell(latitude, longitude, 9);
      console.log("H3 index generated:", h3Index);

      // Current timestamp for lastUpdated field
      const timestamp = new Date().toISOString();
      console.log("Current timestamp:", timestamp);

      // Check if there's an existing document for this user
      console.log("Checking for existing driver document with userId:", userId);
      const existingDocuments = await databases.listDocuments(
        DATABASE_ID,
        DRIVER_LOCATION_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      console.log("Found documents:", existingDocuments.total);

      let documentId;

      if (existingDocuments.total > 0) {
        // Update existing document
        documentId = existingDocuments.documents[0].$id;
        console.log("Updating existing document:", documentId);

        const updatedDoc = await databases.updateDocument(
          DATABASE_ID,
          DRIVER_LOCATION_COLLECTION_ID,
          documentId,
          {
            h3Index: h3Index,
            latitude: latitude,
            longitude: longitude,
            Phoneno: phoneno,
            status: "online",
            lastUpdated: timestamp,
            vehicleType: vehicleType,
          }
        );

        console.log("Driver document updated successfully:", updatedDoc.$id);
        return { success: true, documentId: updatedDoc.$id };
      } else {
        // Create new document
        console.log("Creating new driver document");

        // Create data object exactly matching schema
        const documentData = {
          userId: userId,
          h3Index: h3Index,
          latitude: latitude,
          longitude: longitude,
          Phoneno: phoneno,
          status: "online",
          lastUpdated: timestamp,
          vehicleType: vehicleType,
        };

        console.log("Document data to be created:", documentData);

        const newDoc = await databases.createDocument(
          DATABASE_ID,
          DRIVER_LOCATION_COLLECTION_ID,
          ID.unique(), // Use auto-generated ID
          documentData
        );

        console.log("Driver document created successfully:", newDoc.$id);
        return { success: true, documentId: newDoc.$id };
      }
    } catch (err) {
      console.error("Error storing driver location:", err);
      if (err.response) {
        console.error("Response error:", err.response.message);
        console.error("Status code:", err.response.code);
      }
      return { success: false, error: err };
    }
  }
  
  async setDriverOffline(userId: string) {
    console.log("Setting driver offline:", userId);

    if (!userId) {
      console.error("User ID is undefined");
      return { success: false, error: "User ID is undefined" };
    }

    try {
      // Find documents with this userId field
      console.log("Finding documents with userId:", userId);
      const documents = await databases.listDocuments(
        DATABASE_ID,
        DRIVER_LOCATION_COLLECTION_ID,
        [Query.equal("userId", userId)]
      );

      if (documents.total === 0) {
        console.log("No documents found for userId:", userId);
        return { success: false, error: "No document found" };
      }

      // Delete the document or update its status to offline
      const documentId = documents.documents[0].$id;
      console.log("Deleting or updating document:", documentId);

      // Option 1: Delete the document
      await databases.deleteDocument(DATABASE_ID, DRIVER_LOCATION_COLLECTION_ID, documentId);
      console.log("Driver document deleted successfully:", documentId);

      return { success: true };
    } catch (err) {
      console.error("Error setting driver offline:", err);
      if (err.response) {
        console.error("Response error:", err.response.message);
      }
      return { success: false, error: err };
    }
  }
  
  deg2rad(deg: number) {
    return deg * (Math.PI/180);
  }
}

export default DatabaseService;