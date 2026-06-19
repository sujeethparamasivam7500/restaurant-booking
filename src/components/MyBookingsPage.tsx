import { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  LogOutIcon,
  XCircle,
  Home,
} from "lucide-react";

interface MyBookingsPageProps {
  onNavigate: (page: string) => void;
}

export default function MyBookingsPage({
  onNavigate,
}: MyBookingsPageProps) {
  const [bookings, setBookings] = useState<any[]>([]);

  const API_URL =
    "https://restaurant-booking-backend-1nmh.onrender.com";

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    if (!user.email) return;

    fetch(`${API_URL}/api/booking/mybookings?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error(err));
  }, []);

  const cancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      const res = await fetch(
        `${API_URL}/api/booking/cancel/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message);
        return;
      }

      setBookings((prev) => prev.filter((b) => b._id !== id));
      alert("Booking cancelled successfully!");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 relative">
      {/* HOME BUTTON */}
      <div className="absolute top-5 right-36">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md"
        >
          <Home size={18} /> Home
        </button>
      </div>

      {/* LOGOUT BUTTON */}
      <div className="absolute top-5 right-5">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            onNavigate("login");
          }}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md"
        >
          <LogOutIcon size={18} /> Logout
        </button>
      </div>

      <h1 className="text-4xl font-bold text-gray-800 mb-8">
        My Bookings
      </h1>

      {bookings.length === 0 && (
        <div className="text-center mt-20">
          <p className="text-gray-500 text-xl mb-4">
            No bookings found
          </p>

          <button
            onClick={() => onNavigate("restaurants")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Book a Table
          </button>
        </div>
      )}

      <div className="flex flex-col gap-6 max-w-3xl">
        {bookings.map((b) => (
          <div
            key={b._id}
            className="bg-white shadow-md rounded-xl p-6 border border-gray-200"
          >
            <h2 className="text-xl font-bold mb-4">
              Table {b.tableNumber}
            </h2>

            <div className="flex items-center gap-3 text-gray-700 mb-2">
              <Calendar size={18} />
              {b.date}
            </div>

            <div className="flex items-center gap-3 text-gray-700 mb-2">
              <Clock size={18} />
              {b.time} - {b.endTime}
            </div>

            <div className="flex items-center gap-3 text-gray-700 mb-4">
              <Users size={18} />
              Table {b.tableNumber}
            </div>

            <button
              onClick={() => cancelBooking(b._id)}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              <XCircle size={18} /> Cancel Booking
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
