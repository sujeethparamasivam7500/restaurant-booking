import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";        // Register + Login Routes
import bookingRoutes from "./routes/booking.js";  // Booking Routes

const app = express();

// ============================
// 🔥 Middlewares
// ============================
app.use(cors());
app.use(express.json());

// ============================
// 🔥 MongoDB Connection (Atlas)
// ============================
mongoose
  .connect(
    "mongodb+srv://sujeethparamasivam_db_user:sujeeth7500@table.irsiw2i.mongodb.net/restaurant_booking"
  )
  .then(() => console.log("✅ MongoDB Atlas Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ============================
// 🔥 API Routes
// ============================
app.use("/api", authRoutes);            // → /api/register, /api/login
app.use("/api/booking", bookingRoutes); // → /api/booking/create, /api/booking/availability

// ============================
// 🔥 Start Server
// ============================
app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
