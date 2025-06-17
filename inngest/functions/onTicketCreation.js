import { NonRetriableError } from "inngest";
import { inngest } from "../client.js";
import User from "../../models/user.js";
import { analyzeTickets } from "../../utils/ticketsAi.js";
import Ticket from "../../models/ticket.js";
import { sendMail } from "../../utils/mailer.js";

export const onTicketCreation = inngest.createFunction(
  {
    id: "onTicketCreation",
    retries: 2
  },
  // A Function is triggered by events
  { event: "ticket/creation" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;
      
      // step is retried if it throws an error
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketExists = await Ticket.findById(ticketId);
        if (!ticketExists) {
          throw new NonRetriableError("Ticket does not exist");
        }
        return ticketExists;
      });

      await step.run("change-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "AI_PROCESSED" });
      });

      const output = await analyzeTickets(ticket);
      const aiResponseRaw = output.output[0].content;
      
      // Parse the AI response if it's a string
      let aiResponse;
      try {
        let jsonString = aiResponseRaw;
        
        // If it's a string, check if it's wrapped in markdown code blocks
        if (typeof aiResponseRaw === 'string') {
          // Remove markdown code blocks if present
          jsonString = aiResponseRaw.replace(/```json\s*|\s*```/g, '').trim();
        }
        
        aiResponse = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        console.error("Raw AI response:", aiResponseRaw);
        throw new NonRetriableError("Invalid AI response format");
      }

      const relatedSkills = await step.run("ai-processing", async () => {
        if (aiResponse) {
          const updateData = {
            priority: !["low", "medium", "high"].includes(aiResponse.priority?.toLowerCase())
              ? "medium"
              : aiResponse.priority.toLowerCase(),
            helpfulNotes: aiResponse.helpfulNotes || "",
            summary: aiResponse.summary || "", // Add summary field
            status: "AI-PROCESSED",
            relatedSkills: aiResponse.relatedSkills || [],
          };

          const response = await Ticket.findByIdAndUpdate(
            ticket._id, 
            updateData,
            { new: true } // Return the updated document
          );
          
          return aiResponse.relatedSkills || [];
        }
        return [];
      });

      const moderator = await step.run("assign-moderator", async () => {
        let user = null;
        
        // Only search for moderator if we have related skills
        if (relatedSkills && relatedSkills.length > 0) {
          user = await User.findOne({
            role: "moderator",
            skills: {
              $elemMatch: {
                $regex: relatedSkills.join("|"),
                $options: "i",
              },
            },
          });
        }
        
        // Fallback to admin if no moderator found
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
        const finalTicket = await Ticket.findById(ticket._id);
        
        if (moderator && finalTicket) {
          const subject = "INCOMING TICKET!!!";
          const message = `Hi,

You have been assigned a ticket, please try to solve it as soon as possible.

Ticket Title: ${finalTicket.title}
Priority: ${finalTicket.priority || 'Not specified'}

Description: 
${finalTicket.description || 'No description provided'}

${finalTicket.helpfulNotes ? `\nHelpful Notes:\n${finalTicket.helpfulNotes}` : ''}

Please check the system for more details.`;
          
          await sendMail(moderator.email, subject, message);
        }
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Error running step", error.message);
      return { success: false, error: error.message };
    }
  }
);