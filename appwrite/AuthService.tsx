import {ID, Account, Client, Databases} from "appwrite"
import Snackbar from "react-native-snackbar"

const appwriteClient = new Client();

const APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "65f81754567f2cdc753d";
const DATABASE_ID = "65fd621368673fa65790";
const COLLECTION_ID = "67d041c60039b2f3c725";

type CreateUserAccount = {
    email: string,
    password: string,
    name?: string,
    phone?: string
}

type LoginuserAccount = {
    email: string,
    password: string
}

class AppwriteService {
    account;
    database;
    
    constructor() {
        appwriteClient
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID);
        
        this.account = new Account(appwriteClient);
        this.database = new Databases(appwriteClient);
    }
   
    async createAccount({email, password, name, phone}: CreateUserAccount) {
        try {
            const newAccount = await this.account.create(
                ID.unique(),
                email,
                password
            );

            if (newAccount) {
                try {
                    await this.database.createDocument(
                        DATABASE_ID,
                        COLLECTION_ID,
                        ID.unique(),
                        {
                            userId: newAccount.$id,
                            name: name || '',
                            email: email,
                            phone: phone || '',
                            // userType: 'driver',
                            // status: 'offline',
                            // createdAt: new Date().toISOString()
                        }
                    );
                    console.log("Driver information stored successfully");
                } catch (dbError) {
                    console.error("Failed to store driver information:", dbError);
                }
                
                return newAccount;
            } else {
                return "Error";
            }
        } catch (e) {
            Snackbar.show({
                text: String(e),
                duration: Snackbar.LENGTH_LONG
            });
            console.log(e);
            throw e;
        }
    }

    async login({email, password}: LoginuserAccount) {
        try {
            const session = await this.account.createEmailPasswordSession(
                email,
                password
            );
            return session;
        } catch (e) {
            Snackbar.show({
                text: String(e),
                duration: Snackbar.LENGTH_LONG
            });
            console.log("Appwrite Service :: Login() errr" + e);
            throw e;
        }
    }

    // Function to get user profile with phone number for future use
    async getUserProfile() {
        try {
            const currentUser = await this.getCurrentUser();
            if (!currentUser) return null;
            
            // Find documents where userId matches the current userId
            const response = await this.database.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    { key: "userId", value: currentUser.$id }
                ]
            );
            
            if (response.documents.length > 0) {
                return response.documents[0];
            }
            return null;
        } catch (error) {
            console.log("Error fetching user profile:", error);
            return null;
        }
    }
    
    async setuserloc(latitude, longitude) {
        try {
            const currentUser = await this.getCurrentUser();
            if (!currentUser) return null;
            
            // Find user document to update
            const profile = await this.getUserProfile();
            if (profile) {
                // Update the document with location data
                return await this.database.updateDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    profile.$id,
                    {
                        currentLocation: { latitude, longitude },
                        status: 'online',
                        lastUpdated: new Date().toISOString()
                    }
                );
            }
        } catch (err) {
            console.log("Appwrite Service :: setuserloc() error:", err);
            throw err;
        }
    }
    
    async getCurrentUser() {
        try {
            return await this.account.get();
        } catch (e) {
            console.log("Appwrite Service ::getuser() Error " + e);
            return null;
        }
    }
    
    async logout() {
        try {
            return await this.account.deleteSession('current');
        } catch (e) {
            console.log("Appwrite Service ::logout()");
            throw e;
        }
    }
}

export default AppwriteService;
