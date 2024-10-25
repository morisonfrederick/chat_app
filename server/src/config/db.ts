import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()


const URI = process.env.MONGO_URI
const connectDb = async ()=>{
    if(!URI){
        throw new Error('uri undefined')
    }
    try{
        await mongoose.connect(URI)
        console.log(`connected to mongodb `);
        

    }
    catch(err){
        console.log(err);
        process.exit(1)
        
    }
}

export {connectDb}