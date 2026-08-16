import mongoose from "mongoose";
const schema=new mongoose.Schema({
 name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},
 phone:String,passwordHash:{type:String,required:true},role:{type:String,enum:["MEMBER","PRESIDENT","VICE_PRESIDENT"],default:"MEMBER"},
 status:{type:String,enum:["ACTIVE","INACTIVE"],default:"ACTIVE"}
},{timestamps:true});
export default mongoose.model("User",schema);