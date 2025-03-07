import {ID,Account,Client,Databases, Permission,Role} from "appwrite"
import { useContext } from "react";

import Snackbar from "react-native-snackbar"
import { AppwriteContext } from "./AuthContext";



const appwriteClient = new Client();
const databases = new Databases(appwriteClient);


const APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "65f81754567f2cdc753d";


type CreateLoc_info = {
    phoneno:string | undefined, 
Geohash:string | undefined, 
userId:string | undefined,
}

class DatabaseService {
    account;
    constructor(){
        appwriteClient
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
       this.account = new Account(appwriteClient);
    }


    async setuserLocation({phoneno,Geohash,userId}:CreateLoc_info){
        let userdbexit = false;
         if(userId){
            try {
                // Attempt to read the document
                try{
                    const document = await databases.getDocument('65fd621368673fa65790','65fd621e4cd1b556e682', userId);
                    if(document){
                        userdbexit=true;
                    }
                }catch(err){
                    console.log(err);
                }
                if (!userdbexit) {
                    await databases.createDocument('65fd621368673fa65790', '65fd621e4cd1b556e682', userId,{
                        Phoneno: phoneno,
                        Geohash: Geohash,
                    },
                    [
                        Permission.write(Role.any())
                    ]
                );
                    console.log("Document created successfully!");
                } else {
                    // If the document exists, update it
                    await databases.updateDocument('65fd621368673fa65790','65fd621e4cd1b556e682', userId, {
                        Phoneno: phoneno,
                        Geohash: Geohash,
                    },[
                        Permission.update(Role.users())
                    ]
                );
                    console.log("Document updated successfully!");
                }
            } catch (err) {
                console.log("Error:", err);
            }
        }else{
            console.log("User Id undefined");
        }
    }
}
export default DatabaseService;