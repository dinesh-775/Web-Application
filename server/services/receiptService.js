import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import Receipt from "../models/Receipt.js";

export async function createReceipt({type,memberId,donationId,amount,paymentMethod,transactionId,email,festivalYear,recipientName}){
 const count=await Receipt.countDocuments({festivalYear})+1;
 const receiptNumber=`GC-${festivalYear}-${String(count).padStart(6,"0")}`;
 const dir=path.resolve("receipts");fs.mkdirSync(dir,{recursive:true});
 const file=path.join(dir,`${receiptNumber}.pdf`);
 const istDate=new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata",dateStyle:"medium",timeStyle:"short"});
 await new Promise((resolve,reject)=>{const doc=new PDFDocument();const out=fs.createWriteStream(file);out.on("finish",resolve);out.on("error",reject);
 doc.pipe(out);doc.fontSize(20).text("GANESH COMMUNITY",{align:"center"});doc.moveDown();doc.fontSize(16).text("PAYMENT RECEIPT",{align:"center"});
 doc.moveDown();doc.fontSize(11).text(`Receipt No: ${receiptNumber}`);doc.text(`Festival Year: ${festivalYear}`);
 if(recipientName)doc.text(`Name: ${recipientName}`);
 doc.text(`Amount: ₹${amount}`);doc.text(`Payment Method: ${paymentMethod}`);
 doc.text(`Transaction/Reference: ${transactionId||"N/A"}`);doc.text(`Date (IST): ${istDate}`);doc.moveDown();doc.text("Thank you for supporting the Ganesh community.");doc.end();});
 return Receipt.create({receiptNumber,type,memberId,donationId,amount,paymentMethod,transactionId,pdfPath:file,email,emailSent:false,festivalYear});
}
