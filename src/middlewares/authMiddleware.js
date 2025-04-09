import jwt from "jsonwebtoken";
import {
  UnauthorizedError,
  catchError,
  forbiddenError,
  frontError,
} from "../utils/responses.js";
import { jwtSecret } from "../config/initialConfig.js";
import EmployerProfile from "../models/user/user.model.js"; // Updated model import
import BlacklistToken from "../models/user/blackListToken.model.js"; // Keep BlacklistToken as is, assuming it's used for token blacklisting
import { check31DaysExpiry } from "../utils/utils.js";

// Middleware to validate JWT tokens
export default async function verifyToken(req, res, next) {
  try {
    // Extract the token from the Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return UnauthorizedError(res, "No token, authorization denied");

    const decoded = jwt.verify(token, jwtSecret);
    if (decoded.token !== "access")
      return UnauthorizedError(res, "Invalid token");

    // Check if the token is blacklisted
    const blacklistedToken = await BlacklistToken.findOne({ where: { token } });
    if (blacklistedToken) {
      return UnauthorizedError(res, "Access token is blacklisted");
    }

    // Check if the user exists
    const user = await EmployerProfile.findByPk(decoded.userUid, {
      attributes: ["uuid", "email"], // Only fetching basic user data (can be extended based on your needs)
    });
    if (!user) return UnauthorizedError(res, "User not found");

    req.userUid = decoded.userUid;
    req.user = user.dataValues; // Attaching the user data to the request object

    next();
  } catch (error) {
    console.error("Token Verification Error:", error.message);
    return UnauthorizedError(res, "Invalid token");
  }
}
