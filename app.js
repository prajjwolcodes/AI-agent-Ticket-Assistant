import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import Dbconnect from "./database/db.js"
import authRoutes from "./routes/authRoutes.js"
import ticketRoutes from "./routes/ticketRoutes.js"
import { serve } from "inngest/express"
import { inngest } from "./inngest/client.js"
import { onSignup } from "./inngest/functions/onSignup.js"
import { onTicketCreation } from "./inngest/functions/onTicketCreation.js"


dotenv.config()
Dbconnect()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())


app.use("/auth",authRoutes)
app.use("/tickets",ticketRoutes)

app.use("/inngest",
    serve({
        client:inngest,
        functions:[onSignup,onTicketCreation]
    })
)

const PORT = 3000
app.listen(PORT,()=>{
    console.log("Server running at port", PORT)
})