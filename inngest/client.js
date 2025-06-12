import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "on-signup",eventKey:process.env.INNGEST_EVENT_KEY }); // Use your app's ID
