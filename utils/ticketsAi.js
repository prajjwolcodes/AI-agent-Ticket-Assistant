import { createAgent, gemini } from "@inngest/agent-kit";

export async function analyzeTickets(ticket) {
  const ticketingAgent = createAgent({
    name: "Ticketing Triage System",
    system: `
You are an AI assistant in a ticket triage system. A customer has submitted a support ticket with a title and description. Your task is to analyze the issue and return the following:

1. skillsRequired: A list of relevant technical or soft skills (in array format) that are likely needed to resolve the issue.
2. lookupSummary: A short summary (2–3 sentences) of what a support engineer might need to research or look up to solve this.
3. helpfulNotes: A few helpful tips, context, or things to be aware of while resolving the ticket.
`,
    model: gemini({
      model: "gemini-1.5-flash-8b",
      apiKey: process.env.GEMINI_API,
      defaultParameters: {
        max_tokens: 1000,
      },
    }),
  });

  const response = await ticketingAgent.run(`
// Only return structured JSON with the following format:

// {
//   "skills": ["skill1", "skill2", ...],
//   "summary": "A concise summary...",
//   "helpfulNotes": "Brief useful notes for the engineer..."
// }

// Here is the ticket:

// Title: {${ticket.title}}
// Description: {${ticket.description}}`)


}

