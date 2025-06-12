import jwt from "jsonwebtoken";
import { inngest } from "../inngest/client.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";

export async function registerUser(req, res) {
  try {
    console.log(req.body);
    const { email, password, skills = [] } = req.body;
    if (!email || !password)
      return res.status(400).json({
        message: "Provide all the data",
      });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({
        message: "User with that email is already Registered",
      });

    const user = await User.create({
      email,
      password: bcrypt.hashSync(password, 10),
      skills: skills,
    });

    const emailDesc = await inngest.send({
      name: "user/signup",
      data: {
        email: user.email,
      },
    });

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_TOKEN
    );

    return res.status(201).json({
      message: "You are registered",
      emailDesc,
      token,
      user,
    });
  } catch (error) {
    console.log("Error in signup", error);
    return res.status(400).json({
      error: error.message,
    });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      message: "Provide all the data",
    });

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({
      message: "Not registered with that email",
    });
  }

  const passwordMatch = bcrpyt.compareSync(password, user.password);
  if (passwordMatch) {
    const token = jwt.sign(
      { id: user_id, role: user.role },
      process.env.SECRET_KEY,
      {
        expiresIn: "30d",
      }
    );
    return res.status(200).json({
      message: "You are successfully Logged in",
      token,
      user,
    });
  } else {
    return res.status(400).json({
      message: "Invalid password",
    });
  }
}

export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorzed" });
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Unauthorized" });
    });
    res.json({ message: "Logout successfully" });
  } catch (error) {
   return res.status(500).json({ error: "Login failed", details: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { role, skills = [], email } = req.body;
  if (req.user.role !== "admin")
    return res.status(500).json({ error: "Forbidden - No admin" });

  try {
    const user = await User.findOne({email})
    if(!user)   return res.status(404).json({ error: "No User found" });
  
    const updatedUser = await User.updateOne({email},{
      role, email , skills: skills.length ? skills : user.skills
    })
  
    return res.status(200).json({
        message: "Successfully Updated",
       updatedUser
      });
  } catch (error) {
         return res.status(404).json({ error: "Error in update user",message:error.message });
  }
  }

export const getUsers = async (req, res) => {
 if (req.user.role !== "admin")
   return res.status(500).json({ error: "Forbidden - No admin" });

   try {
    const users = await User.find(email)
  return  res.status(200).json({
       message: "All Users fetched",
      users
     });
   } catch (error) {    
    return res.status(400).json({ error: "Error in getUsers",message:error.message });

   }

}



