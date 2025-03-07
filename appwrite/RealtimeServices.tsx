import { Client, Databases, ID, RealtimeResponseEvent } from 'appwrite';


export interface sendingMessage {
  sender: string;
  content: string;
  timestamp: Date;
}


const APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "65e03ad04f3f140da80d";

const COLLECTION_ID="65fc362ce2eaaf147a10"
const DATABASE_ID="65fc360e90f6e1397ae3"

const client = new Client();
client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const database = new Databases(client);

export const sendMessage = async (messageContent: string) => {
  const idr = ID.unique();
  const newMessage: sendingMessage = {
    sender: 'You', // Assuming you want to display the sender as "You"
    content: messageContent,
    timestamp: new Date(),
  };

  try {
    // Save message to database (replace with actual collection name)
    const response = await database.createDocument(DATABASE_ID, COLLECTION_ID, idr, newMessage);
    console.log('Message sent:', response); // Log success message and response (optional)
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    return error;
  }

};

export const subscribeToMessages = async (callback: (message: sendingMessage) => void) => {
  let unsubscribe: () => void; // Declare unsubscribe function with proper type

  try {
    // Subscribe to the real-time channel for messages
    unsubscribe = client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`,
      (response) => {
        if (response.payload) {
          const message: {} = response.payload;
          console.log('New message received:', message); // Log received message (optional)
        }
      }
    );

    // Return the unsubscribe function for cleanup
    return unsubscribe;
  } catch (error) {
    console.error('Error subscribing to messages:', error);
  }
};