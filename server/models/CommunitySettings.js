import mongoose from "mongoose";
const schema=new mongoose.Schema({
 communityName:{type:String,default:"Ganesh Community"},logoUrl:String,heroImageUrl:String,description:String,
 // festivalDate is stored as a plain "YYYY-MM-DD" string (not a JS Date) so that the admin-selected
 // calendar date is never re-interpreted as UTC midnight. It is always combined with festivalTime and
 // festivalTimezone (fixed to Asia/Kolkata) to compute the real countdown target.
 festivalDate:String,
 festivalTime:{type:String,default:"00:00"},
 festivalTimezone:{type:String,default:"Asia/Kolkata"},
 festivalYear:{type:Number,default:()=>new Date().getFullYear()},address:String,email:String,phone:String,
 upiId:String,upiName:String,upiEnabled:{type:Boolean,default:false}
},{timestamps:true});
export default mongoose.model("CommunitySettings",schema);
