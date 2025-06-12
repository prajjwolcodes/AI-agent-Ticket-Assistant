import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { createTicket, getTicket, getTickets } from "../controller/ticketContoller.js"

const router = express.Router()

router.route("/").post(authMiddleware,createTicket).get(authMiddleware,getTickets)
router.route("/:id").get(authMiddleware,getTicket)
export default router 

