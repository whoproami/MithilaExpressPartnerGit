import {ID,Account,Client} from "appwrite"

import Snackbar from "react-native-snackbar"

const appwriteClient = new Client();

const APPWRITE_ENDPOINT = "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = "65f81754567f2cdc753d";


type CreateUserAccount = {
    email: string,
    password: string
}

type LoginuserAccount = {
    email:string
    password:string
}

class AppwriteService {
    account;
    constructor(){
        appwriteClient
        .setEndpoint(APPWRITE_ENDPOINT)
        .setProject(APPWRITE_PROJECT_ID)
       this.account = new Account(appwriteClient);

       
    }
   
    async createAccount({email,password}:CreateUserAccount) {
        try{
           const sessionToken= await this.account.create(
              ID.unique(),
            email,
            password
                );
            const userId = sessionToken;
            if(userId){
               return userId
            }else{
                return "Error";
            }
    
    
        }catch(e){
        Snackbar.show({
            text:String(e),
            duration:Snackbar.LENGTH_LONG
        })
        console.log(e)
        }
    }
    async login({email,password}:LoginuserAccount){
       try{
        const session = await this.account.createEmailPasswordSession(
              email,
              password
        )
        return session;
        console.log("Login hogya Guruji ");
       }catch(e){
        Snackbar.show({
            text:String(e),
            duration:Snackbar.LENGTH_LONG
        })
        console.log("Appwrite Service :: Login() errr"+e)
    
       }
    }
    async setuserloc(){
        try{
        
        }catch(err){
            console.log("Appwrite Service ::"+err);
        }
    }
     async getCurrentUser() {
        try{
          return  await this.account.get();
        }catch(e){
          console.log("Appwrite Service ::getuser() Error "+e);   
        }
     }
     async logout(){
       try{
       return await this.account.deleteSession('current');
       }catch(e){
        console.log("Appwrite Service ::logout()");
       }
       
     }
}
//Create a new Record into appwrite

export default AppwriteService;