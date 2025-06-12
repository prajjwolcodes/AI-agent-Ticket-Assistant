import { NonRetriableError } from "inngest";
import User from "../../models/user.js";
import { inngest } from "../client.js";
import { sendMail } from "../../utils/mailer.js";

export const onSignup = inngest.createFunction({
    id: "onSignup",
    retries:2
  },
  // A Function is triggered by events
  { event: "user/signup" },
  async ({event, step }) => {
   try {
     const {email} = event.data
     // step is retried if it throws an error
     const user = await step.run("get-user",async()=>{
        const userExists = await User.findOne({email})
        if(!userExists){
            throw new NonRetriableError("User doesnot exist")
        }
        return userExists
     })

    await step.run("send-mail", async () => {
        const subject = "WELCOME TO TICKETING SYSTEM"
        const message =  `Hi,
            \n\n
            Thanks for signing up. We're glad to have you onboard!
            `;
       await sendMail(user.email,subject,message)
     });

      return { success: true };
   } catch (error) {
     console.error("❌ Error running step", error.message);
      return { success: false };
   }
  }
);
