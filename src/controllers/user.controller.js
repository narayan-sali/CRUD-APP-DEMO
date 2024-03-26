import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from "../models/user.model.js"

import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from "jsonwebtoken"
import mongoose from 'mongoose'


const generateAccessAndRefreshTokens = (async (userId)=>
{
  try {
    const user = await User.findById(userId)
    if (!user) {
      throw new ApiError(404, "User not found");
  }
    const accessToken = await user.generateAccessToken()            
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return { accessToken , refreshToken }
  } catch (error){
    // console.error('Error in generateAccessAndRefreshTokens:', error);
     throw new ApiError (500,"something went wrong while generating access and refresh token")
  }

})


const registerUser = asyncHandler(async (req,res) => {
    const  {name , email , password , phoneNumber , profession } = req.body
   
    if (
     [name , email , password , phoneNumber , profession ].some((field)=>
     field?.trim() === "")
     ) {
     throw new ApiError(400 , "All fields are required")
    }
 
    const existedUser = await User.findOne  ({
     $or: [{ name } , { email }]
    });
 
    if (existedUser){
     throw new ApiError (409 , "User with email or username already exists")
    }
 
 
        //create user object  - create entry in db 
        
       const user =  await User.create({
         name,
         email,
         password,
         phoneNumber,
         profession
       })
       
 
       // remove password and refresh field from response 
      const  createdUser =   await User.findById(user._id).select(
       "-password -refreshToken"
      )
      // check user creation 
      if(!createdUser){
       throw new ApiError (500, "Something went wrong while registering the user")
      }
 
  
        return  res.status(201).json(
         new ApiResponse (200, createdUser , "User Registered Successfully ")
       )
     });

     const loginUser = asyncHandler(async (req,res)=>{

          const {email ,password } = req.body
    
            if ( !email ) {
              throw new ApiError (400, "email is required")
            }
         
            const user = await User.findOne({
              $or: [ {email}]
              
            })
            
    
            if(!user){
              throw new ApiError (404, "User does not exists")
            }
    
            const isPasswordValid = await user.isPasswordCorrect(password)
           
    
            if(!isPasswordValid){
              throw new ApiError (401, "Invalid Credentials")
            }
    
             const { accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)
             
    
             const loggedInUser =await User.findById(user._id).select("-password -refreshToken")
    
             const options = {
              httpOnly: true,
              secure: true
             }
            
             return res
             .status(200)
             .cookie("accessToken", accessToken , options)
             .cookie("refreshToken", refreshToken , options)
             .json(
              new ApiResponse(
                {
                  user: loggedInUser , accessToken , refreshToken
                },
                "User logged In Successfully"
              )
             )
        })


        const refreshAccessToken = asyncHandler(async(req,res)=>{
            const incomingRefreshtoken = req.cookies.refreshToken || req.body.refreshToken
              if(!incomingRefreshtoken) {
                throw new ApiError(401, "unauthorised request")
              }
              
              try {
                
                const decodedToken = jwt.verify(incomingRefreshtoken,process.env.REFRESH_TOKEN_SECRET)
            
                const user = await User.findById(decodedToken?._id, 'refreshToken');
                
          
                if(!user){
                  throw new ApiError(401,"Invlaid Token")
                }
                
          
                if(incomingRefreshtoken !== user?.refreshToken){
                  throw new ApiError(401 , "Refresh token is expired or used" )
                }
                
            
                const options = {
                  httpOnly:true,
                  secure: true
                }
                const  {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
            
                return res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                  new ApiResponse(
                    200,
                    {accessToken, refreshToken: newRefreshToken},
                    "Access token refreshed succesfully"
                  )
                )
              } catch (error) { 
                 throw new ApiError ("401", error?.messsage || "Invalid refresh token")
              }
          })


          const updateUserDetails = asyncHandler(async(req,res)=>{
            const { name , email ,phoneNumber,profession} = req.body
              if(!name && !email && !phoneNumber && !profession){
                throw new ApiError (400,  "Please provide atleast one filed")
              }
              const user = await User.findByIdAndUpdate(
                req.user?._id,
                {
                  $set: {
                    name: name,
                    email: email,
                    phoneNumber: phoneNumber,
                    profession: profession
                  }
                },
                {new : true}
                ).select("-password -refreshToken" )
          
                return res
                .status(200)
                .json(new ApiResponse(200, user, "Account Deatils Updated Successfully"))
          })

          const getRegisteredUsers = asyncHandler(async(req,res)=>{

            const objectId = req.body;
            if(!objectId){
              throw new ApiError(404, "inavlid id")
            }
            console.log("ObjectId:", objectId);
              const users = await User.find({  });
              
              
              if (!users) {
                  throw new ApiError(404, "NOT FOUND");
              }
            return res
            .status(200)
            .json(new ApiResponse(200, users , "Registered users fetched succesfully"))
          })


          const deleteUser = asyncHandler(async(req,res)=>{

            const objectId = req.body;
            if(!objectId){
              throw new ApiError(404, "inavlid id")
            }
            console.log("ObjectId:", objectId);
              const user = await User.findByIdAndDelete(objectId);
               if (!user) {
                  throw new ApiError(404, "NOT FOUND");
              }
            return res
            .status(200)
            .json(new ApiResponse(200, user , "Registered user deleted  succesfully"))
          })

     export { registerUser , refreshAccessToken, loginUser , getRegisteredUsers, updateUserDetails,deleteUser}