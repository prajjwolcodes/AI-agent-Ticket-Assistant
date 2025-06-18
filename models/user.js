import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    role:{type:String, enum:["user","admin","moderator"], default:"user"},
    skills:[String],
    createdAt:{type:Date, default:Date.now},
    
},
{timeStamps:true}
)

const User = mongoose.model("User",userSchema)
export default User