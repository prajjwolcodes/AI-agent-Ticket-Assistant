import mongoose from "mongoose";

export default async function Dbconnect() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Database Connected");
}
