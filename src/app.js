// =========================================
//             Lbraries Import
// =========================================
import chalk from "chalk";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import os from "os";
import { fileURLToPath } from "url";
import path from "path";
import { domain } from "./config/initialConfig.js";
// import passport from "./config/passport.js";

// =========================================
//             Code Import
// =========================================
import { nodeEnv, port } from "./config/initialConfig.js";
import { connectDB } from "./config/dbConfig.js";
import { getIPAddress } from "./utils/utils.js";
import "./models/models.js";
import authRoutes from "./routes/auth/auth.route.js";
import profileRoutes from "./routes/profile/profile.route.js";
import studentRoutes from "./routes/student/student.route.js";
import projectRoutes from "./routes/project/project.route.js";
import applicationRoutes from "./routes/application/application.route.js";
import adminRoutes from "./routes/admin/admin.route.js";

// =========================================
//            Configurations
// =========================================
// Initializing the app
const app = express();
// app.use(passport.initialize());

// If you plan to use session-based flows (optional with JWT):
import session from "express-session";
app.use(
  session({ secret: "yoursecret", resave: false, saveUninitialized: false })
);
// app.use(passport.session());

// ... your routes and rest of the code

app.use(cookieParser());

// Essential security headers with Helmet
app.use(helmet());

// Enable CORS with default settings
const crosOptions = {
  origin: nodeEnv === "production" ? domain : "*", // allow requests from all ips in development, and use array for multiple domains
  // allowedHeaders: ['Content-Type', 'Authorization', 'x-token', 'y-token'],    // allow these custom headers only
};
app.use(cors(crosOptions));

// Logger middleware for development environment
if (nodeEnv !== "production") {
  app.use(morgan("dev"));
}

// Compress all routes
app.use(compression());

// Rate limiting to prevent brute-force attacks
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Built-in middleware for parsing JSON
app.use(express.json());

// static directories
// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/static", express.static(path.join(__dirname, "../../", "static")));

// =========================================
//            Routes
// =========================================
// Route for root path
app.get("/", (req, res) => {
  res.send("Welcome to Backend API's");
});

// other routes
app.use("/api/auth", authRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/application", adminRoutes);
app.use("/api/admin", adminRoutes);

// =========================================
//            Global Error Handler
// =========================================
// Global error handler
app.use((err, req, res, next) => {
  console.error(chalk.red(err.stack));
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: {},
  });
});

// Database connection
connectDB();

// Server running
app.listen(port, () => {
  console.log(
    chalk.bgYellow.bold(
      ` Server is listening at http://${getIPAddress()}:${port} `
    )
  );
});
