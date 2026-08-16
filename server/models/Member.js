import mongoose from "mongoose";
const schema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},memberId:{type:String,unique:true},
 name:String,email:String,phone:String,address:String,occupation:String,status:{type:String,default:"ACTIVE"},
 contributionAmount:{type:Number,default:0},festivalYear:{type:Number,default:()=>new Date().getFullYear()}
},{timestamps:true});
export default mongoose.model("Member",schema);