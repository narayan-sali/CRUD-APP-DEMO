import  jwt  from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
 import { ApiError } from '../utils/ApiError.js';
import { User } from "../models/user.model.js";

// res if it is not used just replace with _
export const  verifyJWT = asyncHandler(async(req, _, next)=>{
   try {
    const token = req.cookies?.accessToken || req.header
    ("Authorization")?.replace("Bearer ", "")
      
    if(!token){
     throw new ApiError (401, "Unauthorized request. Authentication token not found or expired.")
    }
 
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if (!user){
     throw new ApiError(401, "Invalid  Access Token ")
    }
 
    req.user = user ;
    next()
   } catch (error) {

        throw new ApiError (401, error?.message || "Invalid Access Token")
    
   }
})