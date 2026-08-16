import mongoose from "mongoose";
const schema=new mongoose.Schema({
 title:{type:String,required:true},description:String,date:Date,time:String,location:String,imageUrl:String,
 status:{type:String,default:"UPCOMING"},festivalYear:{type:Number,default:()=>new Date().getFullYear()}
},{timestamps:true});
export default mongoose.model("Event",schema);