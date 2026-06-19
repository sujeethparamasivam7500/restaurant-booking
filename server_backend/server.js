import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import bookingRoutes from "./routes/booking.js";

dotenv.config();

const app = express();

// ===============================
// Middlewares
// ===============================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());
app.use(express.json());

// ===============================
// MongoDB Connection
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// ===============================
// Routes
// ===============================
app.use("/api", authRoutes);
app.use("/api/booking", bookingRoutes);

// ===============================
// Default Route
// ===============================
app.get("/", (req, res) => {
  res.send("Restaurant Booking Backend is Running...");
});

// ===============================
// Start Server
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
