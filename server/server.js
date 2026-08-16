import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import donationRoutes from "./routes/donationRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";

dotenv.config();

const app = express();

const port = process.env.PORT || 5000;

/* =========================================================
   CORS CONFIGURATION
========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an origin
      // such as Postman, Thunder Client, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);

/* =========================================================
   BODY PARSER
========================================================= */

app.use(express.json());

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Ganesh Community API is running"
  });
});

/* =========================================================
   API ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/member-applications", applicationRoutes);

app.use("/api/members", memberRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/donations", donationRoutes);

app.use("/api/finance", financeRoutes);

app.use("/api/content", contentRoutes);

app.use("/api/expenses", expenseRoutes);

app.use("/api/receipts", receiptRoutes);

app.use("/api/audit-logs", auditLogRoutes);

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Server error"
  });
});

/* =========================================================
   DATABASE + SERVER START
========================================================= */

connectDB()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Ganesh Community API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
