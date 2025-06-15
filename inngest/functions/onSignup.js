// import { NonRetriableError } from "inngest";
// import User from "../../models/user.js";
// import { inngest } from "../client.js";
// import { sendMail } from "../../utils/mailer.js";

import { inngest } from "../client.js";

// export const onSignup = inngest.createFunction({
//     id: "user-signup",
//   },
//   // A Function is triggered by events
//   { event: "user/signup" },
//   async ({event, step }) => {
//    try {
//      console.log("Running onSignup function for email:", email);
//      const {email} = event.data
//      // step is retried if it throws an error
//      const user = await step.run("get-user",async()=>{
//         const userExists = await User.findOne({email})
//         if(!userExists){
//             throw new NonRetriableError("User does not exist")
//         }
//         return userExists
//      })

//     await step.run("send-mail", async () => {
//         const subject = "WELCOME TO TICKETING SYSTEM"
//         const message =  `Hi,
//             \n\n
//             Thanks for signing up. We're glad to have you onboard!
//             `;
//        await sendMail(user.email,subject,message)
//      });

//       return { success: true };
//   } catch (error) {
//    console.error("❌ Error running step", error && error.message ? error.message : error);
//     return { success: false };
//   }
//   }
// );


export const userSignup = inngest.createFunction(
  { id: "user-signup" },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      console.log("Function triggered! Processing signup for:", event.data.email);
      
      const result = await step.run("get-user", async () => {
        console.log("Step executed successfully");
        return { processed: true };
      });
      
      return { success: true, result };
    } catch (error) {
      console.error("Function error:", error);
      throw error;
    }
  }
);