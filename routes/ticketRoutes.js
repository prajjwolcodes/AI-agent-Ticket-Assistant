import express from "express"
import { authMiddleware } from "../middleware/authMiddleware.js"
import { createTicket, getTicket, getTickets, updateTicket } from "../controller/ticketContoller.js"

const router = express.Router()

router.route("/").get(authMiddleware,getTickets).post(authMiddleware,createTicket)
router.route("/:id").get(authMiddleware,getTicket).patch(authMiddleware,updateTicket)
export default router 

