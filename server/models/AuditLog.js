import mongoose from "mongoose";
const schema=new mongoose.Schema({
 userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},action:String,entity:String,entityId:String,oldValue:String,newValue:String
},{timestamps:true});
export default mongoose.model("AuditLog",schema);