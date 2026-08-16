import mongoose from "mongoose";
const schema=new mongoose.Schema({
 name:{type:String,required:true},position:{type:String,required:true},photoUrl:String,description:String,
 contact:String,displayOrder:{type:Number,default:0},active:{type:Boolean,default:true}
},{timestamps:true});
export default mongoose.model("CommitteeMember",schema);