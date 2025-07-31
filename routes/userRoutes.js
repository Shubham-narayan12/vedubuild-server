import express from "express"
import { createUserController, userLoginController, userLogoutController } from "../controllers/userController.js";



//router object
const router = express.Router();


//==============Routers Objects ============


//REGISTER USER
router.post("/create-user",createUserController)

//USER LOGIN
router.post("/login",userLoginController)

//USER LOGOUT
router.get("/logout",userLogoutController)



export default router;