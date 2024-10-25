import mongoose,{Document} from "mongoose";

interface Iuser extends Document {
    username:string,
    email:string,
    password:string,
    createdAt:Date,
    updatedAt:Date
}

const userSchema = new mongoose.Schema<Iuser>({
        username:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        createdAt:{
            type: Date,
            default: Date.now
        },
        updatedAt:{
            type: Date,
            default:Date.now
        }
})

const User = mongoose.model<Iuser>('User',userSchema)

export {User};