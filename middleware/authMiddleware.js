import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorzed",message:error.message });

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" ,message:error.message} );
  }
};
