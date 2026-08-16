import jwt from "jsonwebtoken";
export const tokenFor=u=>jwt.sign({id:u._id,role:u.role},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||"7d"});