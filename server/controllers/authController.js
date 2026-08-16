import bcrypt from "bcryptjs";import User from "../models/User.js";import Member from "../models/Member.js";import {tokenFor} from "../utils/token.js";
export async function login(req,res){const {email,password}=req.body;const u=await User.findOne({email:email?.toLowerCase()});if(!u||u.status!=="ACTIVE"||!(await bcrypt.compare(password||"",u.passwordHash)))return res.status(401).json({message:"Invalid credentials"});const member=await Member.findOne({userId:u._id});res.json({token:tokenFor(u),user:{id:u._id,name:u.name,email:u.email,role:u.role,memberId:member?.memberId||null}});}
export async function me(req,res){const member=await Member.findOne({userId:req.user._id});res.json({user:req.user,member});}
export async function changePassword(req,res){
  try {
    const {currentPassword,newPassword}=req.body;
    if(!currentPassword||!newPassword) return res.status(400).json({message:"Current password and new password are required"});
    const user=await User.findById(req.user._id);
    if(!user) return res.status(404).json({message:"User not found"});
    const isMatch=await bcrypt.compare(currentPassword,user.passwordHash);
    if(!isMatch) return res.status(400).json({message:"Incorrect current password"});
    user.passwordHash=await bcrypt.hash(newPassword,12);
    await user.save();
    res.json({success:true,message:"Password changed successfully"});
  } catch(e) {
    res.status(500).json({message:e.message||"Server error"});
  }
}