import mongoose from "mongoose";
const schema=new mongoose.Schema({
 title:{type:String,required:true},category:String,description:String,amount:{type:Number,required:true,min:0},
 date:{type:Date,default:Date.now},vendor:String,paymentMethod:String,referenceNumber:String,
 createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},festivalYear:{type:Number,default:()=>new Date().getFullYear()}
},{timestamps:true});
export default mongoose.model("Expense",schema);