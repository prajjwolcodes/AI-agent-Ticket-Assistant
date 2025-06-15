import nodemailer from "nodemailer"


export async function sendMail(to,message,subject){
const transporter = nodemailer.createTransport({
  host: process.env.TEMP_MAIL_HOST,
  port: process.env.TEMP_MAIL_PORT,
  auth: {
    user: process.env.TEMP_MAIL_USERNAME,
    pass: process.env.TEMP_MAIL_PASSWORD,
  },
});

// Wrap in an async IIFE so we can use await.
(async () => {
  const info = await transporter.sendMail({
    from:"My TICKETING SYSTEM",
    to,
    subject,
    text:message
  });

  console.log("Message sent:", info.messageId);
  return info
})();
}
