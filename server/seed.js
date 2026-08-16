import dotenv from "dotenv";import bcrypt from "bcryptjs";import {connectDB} from "./config/db.js";import User from "./models/User.js";import CommunitySettings from "./models/CommunitySettings.js";import CommitteeMember from "./models/CommitteeMember.js";
dotenv.config();await connectDB();
const hash=await bcrypt.hash("ChangeMe123!",12);
for(const data of [{name:"President",email:"president@ganesh.local",phone:"",role:"PRESIDENT"},{name:"Vice President",email:"vicepresident@ganesh.local",phone:"",role:"VICE_PRESIDENT"}]){
 await User.updateOne({email:data.email},{$set:{...data,passwordHash:hash,status:"ACTIVE"}},{upsert:true});
}
await CommunitySettings.findOneAndUpdate({},{$set:{communityName:"Ganesh Community",description:"Welcome to our Ganesh community.",festivalYear:new Date().getFullYear()}},{upsert:true});
if(await CommitteeMember.countDocuments()===0) await CommitteeMember.insertMany([{name:"President",position:"President"},{name:"Vice President",position:"Vice President"}]);
console.log("Seed complete. Demo password: ChangeMe123!");process.exit(0);