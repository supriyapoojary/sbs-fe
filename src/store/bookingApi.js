import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../api/baseQuery";
import { API } from "../config/api.config";

// Flatten booking from API shape to flat object for calendar rendering
const getFirstBookingItem = (booking_item) => {
    if (!booking_item || typeof booking_item !== "object") return {};
    const firstKey = Object.keys(booking_item)[0];
    return firstKey ? booking_item[firstKey]?.[0] || {} : {};
};

const flattenBooking = (b) => {
    const item = getFirstBookingItem(b.booking_item);
    return {
        id: b.id,
        user_id: b.user_id,
        status: b.status,
        source: b.source,
        note: b.note,
        customer_name: b.customer_name,
        mobile_number: b.mobile_number,
        outlet_id: b.outlet_id,
        created_by: b.created_by_name,
        service_date: b.service_date,
        service_time: b.service_time,
        therapist_id: item.therapist_id,
        therapist_name: item.therapist,
        service_id: item.service_id,
        service_name: item.service,
        start_time: item.start_time,
        end_time: item.end_time,
        duration: item.duration,
        room_id: item.room_id || item.room_items?.[0]?.room_id || null,
        room_name: item.room_name || item.room_items?.[0]?.room_name || null,
        requested_person: item.requested_person,
        booking_item_id: item.id,
        _raw: b,
    };
};

export const bookingApi = createApi({
    reducerPath: "bookingApi",
    baseQuery,
    tagTypes: ["Booking"],

    endpoints: (builder) => ({
        // Outlets — from outlet-timings
        // Response: { data: { list: { outlet: { id, name } } } }
        getOutlets: builder.query({
            query: ({ outlet, start_date, end_date }) => ({
                url: API.OUTLET_TIMINGS,
                params: { outlet, start_date, end_date },
            }),
            transformResponse: (res) => {
                const outlet = res?.data?.list?.outlet || res?.list?.outlet;
                return outlet ? [outlet] : [];
            },
        }),

        // Therapists
        // Response: { data: { data: { list: { staffs: [...] } } } }
        getTherapists: builder.query({
            query: (params) => ({ url: API.THERAPISTS, params }),
            transformResponse: (res) => {
                const staffs = res?.data?.data?.list?.staffs;
                if (!Array.isArray(staffs)) return [];
                return staffs.map((t) => ({ ...t, name: t.alias || t.name || "Unknown" }));
            },
        }),

        // Bookings
        // Response: { data: { data: { list: { bookings: [...] } } } }
        getBookings: builder.query({
            query: (params) => ({ url: API.BOOKING_LIST, params }),
            transformResponse: (res) => {
                const bookings = res?.data?.data?.list?.bookings;
                if (!Array.isArray(bookings)) return [];
                return bookings.map(flattenBooking);
            },
            providesTags: ["Booking"],
        }),

        // Services
        // Response: { data: { data: { list: { category: [{ services: [...] }] } } } }
        getServices: builder.query({
            query: (params) => ({ url: API.SERVICE_CATEGORY, params }),
            transformResponse: (res) => {
                const categories = res?.data?.data?.list?.category;
                if (!Array.isArray(categories)) return [];
                // Flatten categories → services
                return categories.flatMap((cat) =>
                    (cat.services || []).map((s) => ({
                        ...s,
                        category: cat.name,
                        duration: Number(s.duration) || 0,
                    }))
                );
            },
        }),

        // Rooms — outlet goes in URL path
        // Response shape varies — try all known paths
        getRooms: builder.query({
            query: ({ outlet, ...params }) => ({
                url: `${API.ROOM_BOOKINGS}/outlet/${outlet}`,
                params,
            }),
            transformResponse: (res) => {
                const d = res?.data;
                if (Array.isArray(d?.data?.data?.list)) return d.data.data.list; // same pattern as other APIs
                if (Array.isArray(d?.data?.data)) return d.data.data;
                if (Array.isArray(d?.data?.list)) return d.data.list;
                if (Array.isArray(d?.data?.rooms)) return d.data.rooms;
                if (Array.isArray(d?.data)) return d.data;
                if (Array.isArray(d?.rooms)) return d.rooms;
                if (Array.isArray(d?.list)) return d.list;
                if (Array.isArray(d)) return d;
                return [];
            },
        }),

        // Users / clients
        // Response: { data: { data: { list: { users: [...] } } } }
        getUsers: builder.query({
            query: (params) => ({ url: API.USERS, params }),
            transformResponse: (res) => {
                const users = res?.data?.data?.list?.users;
                if (Array.isArray(users)) return users;
                const list = res?.data?.data?.list;
                if (Array.isArray(list)) return list;
                if (Array.isArray(list?.data)) return list.data;
                return [];
            },
        }),

        // Mutations
        createBooking: builder.mutation({
            query: (formData) => ({ url: API.CREATE_BOOKING, method: "POST", data: formData }),
            invalidatesTags: ["Booking"],
        }),

        updateBooking: builder.mutation({
            query: ({ id, data }) => ({ url: API.UPDATE_BOOKING(id), method: "POST", data }),
            invalidatesTags: ["Booking"],
        }),

        cancelBooking: builder.mutation({
            query: (formData) => ({ url: API.CANCEL_BOOKING, method: "POST", data: formData }),
            invalidatesTags: ["Booking"],
        }),

        deleteBooking: builder.mutation({
            query: (id) => ({ url: API.DELETE_BOOKING(id), method: "DELETE" }),
            invalidatesTags: ["Booking"],
        }),

        rescheduleBooking: builder.mutation({
            query: ({ id, data }) => ({ url: API.UPDATE_BOOKING(id), method: "POST", data }),
            invalidatesTags: ["Booking"],
        }),
    }),
});

export const {
    useGetOutletsQuery,
    useGetTherapistsQuery,
    useGetBookingsQuery,
    useGetServicesQuery,
    useGetRoomsQuery,
    useGetUsersQuery,
    useCreateBookingMutation,
    useUpdateBookingMutation,
    useCancelBookingMutation,
    useDeleteBookingMutation,
    useRescheduleBookingMutation,
} = bookingApi;
