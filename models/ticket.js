import mongoose from "mongoose";
import User from "./user.js";

const ticketSchema = mongoose.Schema(
  {
    title: { type: String },
    description: { type: String, required: true },
    status: { type: String, default: "TODO" },
    helpfulNotes:String,
    priority:String,
    deadline:Date,
    relatedSkills: [String],
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:User,default:null },
    assignedTo:{type:mongoose.Schema.Types.ObjectId,ref:User,default:null },
      createdAt: { type: Date, default: Date.now },

  },
  { timeStamps: true }
);

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
