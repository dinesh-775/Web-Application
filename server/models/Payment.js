import mongoose from "mongoose";
const schema=new mongoose.Schema({
 memberId:{type:mongoose.Schema.Types.ObjectId,ref:"Member",required:true},amount:{type:Number,required:true,min:1},
 paymentMethod:{type:String,enum:["UPI","CASH"],required:true},status:{type:String,enum:["PENDING","SUCCESS","FAILED","REJECTED"],default:"PENDING"},
 transactionId:String,referenceNumber:String,verifiedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},verifiedAt:Date,
 festivalYear:{type:Number,default:()=>new Date().getFullYear()}
},{timestamps:true});
export default mongoose.model("Payment",schema);