// Stub data — replace with real API responses once available
// Mirrors the expected API response shape so swapping is a one-line change

export const STUB_THERAPISTS = [
    { id: 1, name: "Chacha", gender: "female", avatar: "CH", color: "#EC4899", outlet_id: 1 },
    { id: 2, name: "James", gender: "male", avatar: "JA", color: "#3B82F6", outlet_id: 1 },
    { id: 3, name: "Laksa", gender: "female", avatar: "LA", color: "#EC4899", outlet_id: 1 },
    { id: 4, name: "Lily", gender: "female", avatar: "LI", color: "#EC4899", outlet_id: 1 },
    { id: 5, name: "Mozza", gender: "female", avatar: "MO", color: "#EC4899", outlet_id: 1 },
    { id: 6, name: "Nina", gender: "female", avatar: "NI", color: "#EC4899", outlet_id: 1 },
    { id: 7, name: "Philip", gender: "male", avatar: "PH", color: "#3B82F6", outlet_id: 1 },
    { id: 8, name: "Sakura", gender: "female", avatar: "SA", color: "#EC4899", outlet_id: 1 },
    { id: 9, name: "Summer", gender: "female", avatar: "SU", color: "#EC4899", outlet_id: 1 },
    { id: 10, name: "Yashika", gender: "female", avatar: "YA", color: "#EC4899", outlet_id: 1 },
    { id: 11, name: "Glory", gender: "female", avatar: "GL", color: "#EC4899", outlet_id: 1 },
    { id: 12, name: "Marco", gender: "male", avatar: "MA", color: "#3B82F6", outlet_id: 1 },
    { id: 13, name: "Alice", gender: "male", avatar: "MA", color: "#3B82F6", outlet_id: 1 },
];

export const STUB_OUTLETS = [
    { id: 1, name: "Liat Towers" },
    { id: 2, name: "Orchard Central" },
    { id: 3, name: "Bugis Junction" },
];

export const STUB_SERVICES = [
    { id: 1, name: "60 Min Slimming Massage", duration: 60, price: 88 },
    { id: 2, name: "90 Min Tui Na / Acupressure", duration: 90, price: 120 },
    { id: 3, name: "60 Min Tui Na for Kids", duration: 60, price: 78 },
    { id: 4, name: "90 Min Swedish Relaxing Massage", duration: 90, price: 110 },
    { id: 5, name: "120 Min Body Therapy", duration: 120, price: 168 },
    { id: 6, name: "30 Min Foot Reflexology", duration: 30, price: 48 },
    { id: 7, name: "60 Mins Body Therapy", duration: 60, price: 98 },
];

export const STUB_ROOMS = [
    { id: 1, name: "806 Couples Room" },
    { id: 2, name: "807 Single Room" },
    { id: 3, name: "808 VIP Suite" },
    { id: 4, name: "809 Relaxation Room" },
];

export const STUB_REQUEST_TYPES = [
    { id: 1, name: "Soft" },
    { id: 2, name: "China" },
    { id: 3, name: "Deep Tissue" },
    { id: 4, name: "Aromatherapy" },
];

export const STUB_CLIENTS = [
    {
        id: 1,
        name: "Victoria Baker",
        phone: "92214868",
        member_since: "December 2023",
        member_id: "#9221",
    },
    { id: 2, name: "Ethan Tan", phone: "93369589", member_since: "March 2023", member_id: "#8834" },
    {
        id: 3,
        name: "Yashika Yeo",
        phone: "93369589",
        member_since: "June 2022",
        member_id: "#7712",
    },
    {
        id: 4,
        name: "Gerald Tan",
        phone: "93369589",
        member_since: "January 2024",
        member_id: "#9845",
    },
];

// Helper to generate a booking at a given time
const makeBooking = (id, therapistId, clientId, serviceId, startHour, startMin, status = "confirmed") => ({
    id,
    therapist_id: therapistId,
    client_id: clientId,
    service_id: serviceId,
    outlet_id: 1,
    date: "2024-08-08",
    start_time: `${String(startHour).padStart(2, "0")}:${String(startMin).padStart(2, "0")}`,
    duration: STUB_SERVICES.find((s) => s.id === serviceId)?.duration || 60,
    status, // confirmed | in_progress | completed | cancelled
    room_id: 1,
    request_type_ids: [1, 2],
    is_requested_therapist: true,
    notes: "",
    source: "By Phone",
    booked_by: "Victoria Baker",
    booked_on: "2024-05-22T17:34:00",
    cancelled_on: null,
    cancelled_by: null,
});

export const STUB_BOOKINGS = [
    makeBooking(1, 1, 1, 2, 9, 0),
    makeBooking(2, 1, 1, 2, 11, 0),
    makeBooking(3, 1, 1, 1, 13, 0),
    makeBooking(4, 1, 1, 5, 14, 0),
    makeBooking(5, 2, 3, 1, 10, 0),
    makeBooking(6, 2, 3, 3, 11, 0),
    makeBooking(7, 2, 3, 1, 12, 0),
    makeBooking(8, 2, 3, 2, 13, 0),
    makeBooking(9, 3, 3, 3, 11, 0),
    makeBooking(10, 3, 4, 3, 12, 0),
    makeBooking(11, 4, 2, 4, 9, 30),
    makeBooking(12, 5, 3, 1, 10, 0),
    makeBooking(13, 5, 3, 3, 11, 0),
    makeBooking(14, 6, 1, 5, 9, 0, "in_progress"),
    makeBooking(15, 7, 2, 2, 14, 0),
    makeBooking(16, 7, 2, 4, 13, 30, "completed"),
    makeBooking(17, 8, 2, 4, 13, 30),
    makeBooking(18, 3, 2, 5, 13, 30),
];
