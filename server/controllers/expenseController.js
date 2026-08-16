import Expense from "../models/Expense.js";
export const list=async(req,res)=>res.json(await Expense.find().populate("createdBy","name role").sort({date:-1}));
export const create=async(req,res)=>res.status(201).json(await Expense.create({...req.body,amount:Number(req.body.amount),createdBy:req.user._id}));
export const update=async(req,res)=>res.json(await Expense.findByIdAndUpdate(req.params.id,req.body,{new:true}));
export const remove=async(req,res)=>{await Expense.findByIdAndDelete(req.params.id);res.json({message:"Deleted"});};