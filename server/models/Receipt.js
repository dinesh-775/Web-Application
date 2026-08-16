import mongoose from "mongoose";
const schema=new mongoose.Schema({
 receiptNumber:{type:String,unique:true},type:{type:String,enum:["DONATION","MEMBER_PAYMENT"]},
 memberId:{type:mongoose.Schema.Types.ObjectId,ref:"Member"},donationId:{type:mongoose.Schema.Types.ObjectId,ref:"Donation"},
 amount:Number,paymentMethod:String,transactionId:String,pdfPath:String,email:String,emailSent:{type:Boolean,default:false},
 festivalYear:Number
},{timestamps:true});
export default mongoose.model("Receipt",schema);