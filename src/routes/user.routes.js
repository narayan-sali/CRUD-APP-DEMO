import { Router } from "express";
import { 
   
    // getCurrentUser,
    loginUser,
    registerUser, 
    getRegisteredUsers,
    updateUserDetails,
    deleteUser,
    getUser
    //  deleteUser
     } from "../controllers/user.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";


const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/cuurent-user").get(verifyJWT,getUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/registered-users").get(verifyJWT,getRegisteredUsers)
router.route("/update-account").patch(verifyJWT,updateUserDetails)
router.route("/delete-account").delete(verifyJWT,deleteUser)

export default router