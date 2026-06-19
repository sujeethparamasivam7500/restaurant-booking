import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
} from "lucide-react";
import { restaurants, tables } from "../data";
import { Customer } from "../types";

interface BookingPageProps {
  restaurantId: string;
  onNavigate: (page: string, restaurantId?: string, bookingData?: any) => void;
}

export interface BookingData {
  restaurantId: string;
  restaurantName: string;
  tableId: string;
  tableNumber: number;
  date: string;
  time: string;
  guests: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isPriority: boolean;
}

export default function BookingPage({ restaurantId, onNavigate }: BookingPageProps) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [disabledTables, setDisabledTables] = useState<string[]>([]);
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isPriorityCustomer, setIsPriorityCustomer] = useState(false);
  const [showPriorityMessage, setShowPriorityMessage] = useState(false);

  const restaurant = useMemo(
    () => restaurants.find((r) => r.id === restaurantId),
    [restaurantId]
  );

  const restaurantTables = useMemo(
    () => tables.filter((t) => t.restaurantId === restaurantId),
    [restaurantId]
  );

  // Default date = today
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const TIME_SLOTS = [
    { label: "7:00 AM - 8:00 AM", value: "07:00" },
    { label: "8:30 AM - 9:30 AM", value: "08:30" },
    { label: "10:00 AM - 11:00 AM", value: "10:00" },
    { label: "11:30 AM - 12:30 PM", value: "11:30" },
    { label: "1:00 PM - 2:00 PM", value: "13:00" },
    { label: "2:30 PM - 3:30 PM", value: "14:30" },
    { label: "4:00 PM - 5:00 PM", value: "16:00" },
    { label: "5:30 PM - 6:30 PM", value: "17:30" },
    { label: "7:00 PM - 8:00 PM", value: "19:00" },
    { label: "8:30 PM - 9:30 PM", value: "20:30" },
    { label: "10:00 PM - 11:00 PM", value: "22:00" },
  ];

  // 🔥 Fetch disabled tables from backend (REAL LOGIC)
  useEffect(() => {
    if (!selectedDate || !selectedTime) {
      setDisabledTables([]);
      return;
    }

  const API_URL = "https://restaurant-booking-backend-1nmh.onrender.com";

fetch(
  `${API_URL}/api/booking/availability?restaurantId=${restaurantId}&date=${selectedDate}&time=${selectedTime}`
)
      .then((res) => res.json())
      .then((data) => {
        const ids = data.map((b: any) => b.tableId);
        setDisabledTables(ids);
      })
      .catch(() => setDisabledTables([]));
  }, [selectedDate, selectedTime, restaurantId]);

  // Priority customer check
  const checkReturningCustomer = () => {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]") as Customer[];
    const returning = customers.find(
      (c) => c.email === customerEmail || c.phone === customerPhone
    );
    setIsPriorityCustomer(!!returning);
    setShowPriorityMessage(!!returning);
  };

  function calculateEndTime(start: string) {
    const [h, m] = start.split(":").map(Number);
    return `${String(h + 1).padStart(2, "0")}:${m === 0 ? "00" : m}`;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId || !selectedTime || !restaurant) {
      alert("Please select time & table");
      return;
    }

    const table = restaurantTables.find((t) => t.id === selectedTableId);
    if (!table) return;

    onNavigate("payment", "", {
      restaurantId,
      restaurantName: restaurant.name,
      tableId: table.id,
      tableNumber: table.tableNumber,
      date: selectedDate,
      time: selectedTime,
      endTime: calculateEndTime(selectedTime),
      guests: numberOfGuests,
      customerName,
      customerEmail,
      customerPhone,
      isPriority: isPriorityCustomer,
    });
  };

  if (!restaurant) return <div className="text-center py-10">Restaurant not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-orange-500 text-white py-10 px-4">
        <button onClick={() => onNavigate("restaurants")} className="flex items-center gap-2 mb-4">
          <ArrowLeft /> Back
        </button>
        <h1 className="text-3xl font-bold">{restaurant.name}</h1>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white p-6 rounded shadow mb-6">
              <label className="block mb-4">
                <Calendar /> Date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label className="block mb-4">
                <Clock /> Time
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block mb-4">
                <Users /> Guests
                <select
                  value={numberOfGuests}
                  onChange={(e) => setNumberOfGuests(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                >
                  {[1,2,3,4,5,6,7,8].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="bg-white p-6 rounded shadow">
              {showPriorityMessage && (
                <p className="mb-4 text-green-700 font-semibold">
                  ⭐ Returning customer
                </p>
              )}

              <input
                placeholder="Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full mb-3 border px-3 py-2 rounded"
              />
              <input
                placeholder="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                onBlur={checkReturningCustomer}
                className="w-full mb-3 border px-3 py-2 rounded"
              />
              <input
                placeholder="Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                onBlur={checkReturningCustomer}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Select Table</h2>

            <div className="grid grid-cols-4 gap-3">
              {restaurantTables.map((table) => {
                const disabled = disabledTables.includes(table.id) && !isPriorityCustomer;
                const selected = selectedTableId === table.id;

                return (
                  <button
                    key={table.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`aspect-square rounded border-2
                      ${
                        disabled
                          ? "bg-gray-400 cursor-not-allowed"
                          : selected
                          ? "bg-orange-500 text-white"
                          : "bg-white hover:border-orange-500"
                      }`}
                  >
                    T{table.tableNumber}
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              className="w-full mt-6 bg-orange-500 text-white py-3 rounded"
            >
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
