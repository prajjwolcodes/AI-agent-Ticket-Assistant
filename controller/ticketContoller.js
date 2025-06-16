import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description)
    return res.status(400).json({
      message: "Provide all the data",
    });
  try {
    const ticket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id,
    });
    const ticketAiDesc = await inngest.send({
      name: "ticket/creation",
      data: { ticketId: ticket._id },
    });

    return res.status(201).json({
      message: "Ticket Created",
      ticketAiDesc,
      ticket,
    });
  } catch (error) {
    console.log("Error in creating ticket", error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getTickets = async (req, res) => {
  try {
    let tickets = [];
    if (req.user.role == "user") {
      tickets = await Ticket.find({ createdBy: req.user._id })
        .select("title description status createdAt")
        .sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find()
        .populate("assignedTo", ["email", "skills", "_id"])
        .sort({ createdAt: -1 });
    }

    if (!tickets)
      return res.status(404).json({
        message: "No tickets found",
      });

    return res.status(201).json({
      message: "All Tickets Fetched",
      tickets,
    });
  } catch (error) {
    console.log("Error in getting all ticket", error);
    return res.status(400).json({
      error: error.message,
    });
  }
};

export const getTicket = async (req, res) => {
  const { id } = req.params.id;
  let ticket;

  try {
    if (req.user.role == "user") {
      ticket = await Ticket.findOne({ createdBy: req.user._id, _id: id });
    } else {
      ticket = await Ticket.findById(id);
    }

    if (!ticket)
      return res.status(404).json({
        message: "No ticket found",
      });

    return res.status(201).json({
      message: "Single Ticket Fetched",
      ticket,
    });
  } catch (error) {
    console.log("Error in getting single ticket", error);
    return res.status(400).json({
      error: error.message,
    });
  }
};
