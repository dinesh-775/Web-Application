import mongoose from "mongoose";
const schema=new mongoose.Schema({
 name:{type:String,required:true},email:{type:String,required:true,lowercase:true},phone:{type:String,required:true},
 address:String,occupation:String,status:{type:String,enum:["PENDING","APPROVED","REJECTED"],default:"PENDING"},
 reviewedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},reviewedAt:Date,rejectionReason:String
},{timestamps:true});
export default mongoose.model("MemberApplication",schema);