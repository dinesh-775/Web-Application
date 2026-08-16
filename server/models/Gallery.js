import mongoose from "mongoose";
const schema=new mongoose.Schema({
 imageUrl:{type:String,required:true},title:String,description:String,year:Number,eventId:mongoose.Schema.Types.ObjectId,
 displayOrder:{type:Number,default:0}
},{timestamps:true});
export default mongoose.model("Gallery",schema);