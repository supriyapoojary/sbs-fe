import httpClient from "./http.client";
import { API } from "../config/api.config";

const BookingService = {
    // Therapists
    getTherapists(params) {
        return httpClient.get(API.THERAPISTS, { params });
    },

    getTherapistTimings(params) {
        return httpClient.get(API.THERAPIST_TIMINGS, { params });
    },

    // Services
    getServiceCategories(params) {
        return httpClient.get(API.SERVICE_CATEGORY, { params });
    },

    // Clients / Users
    getUsers(params) {
        return httpClient.get(API.USERS, { params });
    },

    // Rooms
    getRoomBookings(params) {
        return httpClient.get(API.ROOM_BOOKINGS, { params });
    },

    // Outlet
    getOutletTimings: builder.query({
        query: ({ outlet_id }) => ({
            url: API.OUTLET_TIMINGS,
            params: { outlet_id }, // ✅ REQUIRED
        }),
    }),

    // Bookings
    getBookings(params) {
        return httpClient.get(API.BOOKING_LIST, { params });
    },

    getBookingDetails(id) {
        return httpClient.get(API.BOOKING_DETAILS(id));
    },

    createBooking(formData) {
        return httpClient.post(API.CREATE_BOOKING, formData);
    },

    updateBooking(id, formData) {
        return httpClient.post(API.UPDATE_BOOKING(id), formData);
    },

    cancelBooking(formData) {
        return httpClient.post(API.CANCEL_BOOKING, formData);
    },
};

export default BookingService;
