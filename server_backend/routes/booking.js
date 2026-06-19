import express from "express";
import Booking from "../models/Booking.js";

const router = express.Router();

/* =========================================================
   🔍 TIME OVERLAP CHECK
   start1 < end2 && start2 < end1
========================================================= */
function overlaps(start1, end1, start2, end2) {
  return start1 < end2 && start2 < end1;
}

/* =========================================================
   🚀 CREATE BOOKING
========================================================= */
router.post("/create", async (req, res) => {
  try {
    const {
      restaurantId,
      tableId,
      tableNumber,
      date,
      time,
      endTime,
      customerName,
      customerEmail,
      customerPhone,
    } = req.body;

    if (!restaurantId || !tableId || !date || !time || !endTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingBookings = await Booking.find({
      restaurantId,
      tableId,
      date,
      status: "confirmed",
    });

    const conflict = existingBookings.find((b) =>
      overlaps(time, endTime, b.time, b.endTime)
    );

    if (conflict) {
      return res.status(409).json({
        message: "Table already booked for this time slot",
      });
    }

    const booking = new Booking({
      restaurantId,
      tableId,
      tableNumber,
      date,
      time,
      endTime,
      customerName,
      customerEmail,
      customerPhone,
      status: "confirmed",
    });

    await booking.save();

    res.json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("❌ Booking Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
   📅 TABLE AVAILABILITY  (🔥 FIXED)
========================================================= */
router.get("/availability", async (req, res) => {
  try {
    const { restaurantId, date, time } = req.query;

    if (!restaurantId || !date || !time) {
      return res.status(400).json({
        message: "restaurantId, date and time are required",
      });
    }

    // 🔥 CALCULATE END TIME OF SELECTED SLOT (+1 hour)
    const [h, m] = time.split(":").map(Number);
    const endTime = `${String(h + 1).padStart(2, "0")}:${m === 0 ? "00" : m}`;

    const bookings = await Booking.find({
      restaurantId,
      date,
      status: "confirmed",
    });

    // 🔥 CORRECT overlap check
    const blocked = bookings.filter((b) =>
      overlaps(time, endTime, b.time, b.endTime)
    );

    // ✅ Return ONLY tableIds
    res.json(
      blocked.map((b) => ({
        tableId: b.tableId,
      }))
    );
  } catch (error) {
    console.error("❌ Availability Error:", error);
    res.status(500).json([]);
  }
});

/* =========================================================
   📌 GET MY BOOKINGS
========================================================= */
router.get("/mybookings", async (req, res) => {
  try {
    const { email, phone } = req.query;

    if (!email && !phone) {
      return res.status(400).json({
        message: "Email or Phone required",
      });
    }

    const bookings = await Booking.find({
      $or: [{ customerEmail: email }, { customerPhone: phone }],
    }).sort({ date: 1, time: 1 });

    res.json(bookings);
  } catch (error) {
    console.error("❌ MyBookings Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
   ❌ CANCEL BOOKING
========================================================= */
router.delete("/cancel/:id", async (req, res) => {
  try {
    const deleted = await Booking.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("❌ Cancel Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
