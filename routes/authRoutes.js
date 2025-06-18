import express from "express"
import { getUsers, login, logout, registerUser, updateUser } from "../controller/auth.js"
import { authMiddleware } from "../middleware/authMiddleware.js"

const router = express.Router()

router.route("/signup").post(registerUser)
router.route("/login").post(login)
router.route("/logout").post(logout)


router.route("/updateuser").patch(authMiddleware, updateUser)
router.route("/getusers").get(authMiddleware,getUsers)



export default router 

