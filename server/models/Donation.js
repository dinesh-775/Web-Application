import mongoose from "mongoose";
import crypto from "crypto";

function generatePublicReference() {
  return "DON-" + crypto.randomBytes(5).toString("hex").toUpperCase();
}

const schema=new mongoose.Schema({
 donorName:{type:String,required:true},email:String,phone:String,amount:{type:Number,required:true,min:1},
 paymentMethod:{type:String,default:"UPI"},transactionId:String,
 status:{type:String,enum:["PENDING","SUCCESS","REJECTED","FAILED"],default:"PENDING"},
 // Cryptographically random public token used for donor-side status lookup, UTR submission and
 // receipt access. Never expose the MongoDB _id as a public/guessable access token.
 publicReference:{type:String,unique:true,index:true},
 rejectionReason:String,
 reviewedBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},reviewedAt:Date,
 receiptId:{type:mongoose.Schema.Types.ObjectId,ref:"Receipt"},festivalYear:{type:Number,default:()=>new Date().getFullYear()}
},{timestamps:true});

schema.pre("validate", function(next){
  if(!this.publicReference){
    this.publicReference = generatePublicReference();
  }
  next();
});

export default mongoose.model("Donation",schema);
