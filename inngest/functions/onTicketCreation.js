import { NonRetriableError } from "inngest";
import { inngest } from "../client.js";
import User from "../../models/user.js";
import { analyzeTickets } from "../../utils/ticketsAi.js";
import Ticket from "../../models/ticket.js";
import {sendMail} from "../../utils/mailer.js"

export const onTicketCreation = inngest.createFunction(
  {
    id: "onTicketCreation",
    retries: 2,
  },
  // A Function is triggered by events
  { event: "ticket/creation" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;
      // step is retried if it throws an error
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketExists = await User.findById(ticketId);
        if (!ticketExists) {
          throw new NonRetriableError("Ticket doesnot exist");
        }
        return ticketExists;
      });

      await step.run("change-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      const aiResponse = await analyzeTickets(ticket);

     const relatedskills =  await step.run("ai-processing", async () => {
      let skills= [];
        if(aiResponse){
        await Ticket.findByIdAndUpdate(ticket._id, {
          priority: !["low", "medium", "high"].includes(aiResponse.priority)
            ? "medium"
            : aiResponse.priority,
          helpfulNotes: aiResponse.helpfulNotes,
          status: "IN_PROGRESS",
          relatedSkills: aiResponse.relatedSkills,
        });
      }

      return skills
      });

        const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedskills.join("|"),
              $options: "i",
            },
          },
        });
        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });
        return user;
    });

      await step.run("send-notification-mail", async () => {
        const finalTicket = await Ticket.findById(ticket.id)
        if(moderator){
        const subject = "INCOMING TICKET!!!";
        const message = `Hi,
            \n\n
            You have been assigned a ticket, please try to solve them asap.
            Your ticket - ${finalTicket.title} \n \n
            ${ticket.description} 
            `;
        await sendMail(moderator.email, subject, message);
        }
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error running step", error.message);
      return { success: false };
    }
  }
);
