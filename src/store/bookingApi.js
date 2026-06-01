import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../api/baseQuery";
import { API } from "../config/api.config";
import { MOCK_BOOKINGS, MOCK_DATE } from "../api/mockBookings";
import { MOCK_OUTLET_LIST, MOCK_THERAPISTS, MOCK_SERVICES, MOCK_ROOMS, MOCK_USERS } from "../api/mockData";

// ─────────────────────────────────────────────────────────────────────────────
// FULL MOCK MODE — zero network/API calls across all endpoints.
// Every query and mutation uses queryFn, bypassing baseQuery + httpClient
// entirely, so no auth interceptors fire and no auto-logout occurs.
//
// Side panel safe: getServices, getRooms, getUsers return empty arrays.
// Add real mock data to mockData.js when available.
//
// To restore live API → see commented "Live API" block at the bottom.
// ─────────────────────────────────────────────────────────────────────────────

// Data Helpers

const getFirstBookingItem = (booking_item) => {
    if (!booking_item || typeof booking_item !== "object") return {};
    const key = Object.keys(booking_item)[0];
    return key ? booking_item[key]?.[0] || {} : {};
};

export const flattenBooking = (b) => {
    const item = getFirstBookingItem(b.booking_item);
    return {
        id: b.id,
        user_id: b.user_id,
        status: b.status,
        source: b.source,
        note: b.note,
        customer_name: b.customer_name || b.user?.name || "",
        mobile_number: b.mobile_number || b.user?.contact_number || "",
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
        room_id: item.room_items?.[0]?.room_id || item.room_id || null,
        room_name: item.room_items?.[0]?.room_name || item.room_name || null,
        requested_person: item.requested_person,
        booking_item_id: item.id,
        _raw: b,
    };
};

// Cache Helpers

const patchAllCaches = (dispatch, getState, patchFn) =>
    bookingApi.util
        .selectInvalidatedBy(getState(), [{ type: "Booking" }])
        .filter(({ endpointName }) => endpointName === "getBookings")
        .map(({ originalArgs }) => dispatch(bookingApi.util.updateQueryData("getBookings", originalArgs, patchFn)));

const applyOptimistic = async (patches, queryFulfilled) => {
    try {
        await queryFulfilled;
    } catch {
        patches.forEach((p) => p.undo());
    }
};

const MOCK_SUCCESS = { data: { success: true } };

// API

export const bookingApi = createApi({
    reducerPath: "bookingApi",
    baseQuery,
    tagTypes: ["Booking"],

    endpoints: (builder) => ({
        // ── Queries ─────────────────────────────────────────────────────────────

        getOutlets: builder.query({
            queryFn: () => ({ data: MOCK_OUTLET_LIST }),
        }),

        getTherapists: builder.query({
            queryFn: () => ({ data: MOCK_THERAPISTS }),
        }),

        getBookings: builder.query({
            // Dynamically remaps all bookings to the requested date so mock data
            // appears on whatever date the calendar is viewing (today, past, future).
            // params.daterange is "DD-MM-YYYY" or "DD-MM-YYYY,DD-MM-YYYY"
            queryFn: (params) => {
                const requestedDate = params?.daterange?.split(",")[0] || MOCK_DATE;
                const bookings = MOCK_BOOKINGS.map((b) => ({
                    ...b,
                    service_date: requestedDate,
                }));
                return { data: bookings };
            },
            providesTags: ["Booking"],
        }),

        getServices: builder.query({
            queryFn: () => ({ data: MOCK_SERVICES }),
        }),

        getRooms: builder.query({
            queryFn: () => ({ data: MOCK_ROOMS }),
        }),

        getUsers: builder.query({
            queryFn: () => ({ data: MOCK_USERS }),
        }),

        // ── Mutations ───────────────────────────────────────────────────────────

        // Adds a temp booking into the cache — won't survive page refresh
        createBooking: builder.mutation({
            queryFn: (fd) => {
                const tempBooking = {
                    id: Date.now(),
                    status: "Pending",
                    source: fd.get("source") || "",
                    note: fd.get("note") || "",
                    customer_name: fd.get("customer_name") || "",
                    mobile_number: fd.get("mobile_number") || "",
                    outlet_id: fd.get("outlet_id") || null,
                    created_by: "Mock User",
                    service_date: fd.get("service_at")?.split(" ")[0] || "",
                    service_time: fd.get("service_at")?.split(" ")[1] || "",
                    therapist_id: null,
                    therapist_name: "",
                    service_id: null,
                    service_name: "",
                    start_time: null,
                    end_time: null,
                    duration: null,
                    room_id: null,
                    room_name: null,
                    requested_person: null,
                    booking_item_id: null,
                    _raw: {},
                };
                return { data: tempBooking };
            },
            async onQueryStarted(fd, { dispatch, queryFulfilled, getState }) {
                try {
                    const { data: tempBooking } = await queryFulfilled;
                    const date = fd.get("service_at")?.split(" ")[0];
                    bookingApi.util
                        .selectInvalidatedBy(getState(), [{ type: "Booking" }])
                        .filter(({ endpointName, originalArgs }) => endpointName === "getBookings" && originalArgs?.daterange?.startsWith(date))
                        .forEach(({ originalArgs }) =>
                            dispatch(
                                bookingApi.util.updateQueryData("getBookings", originalArgs, (d) => {
                                    d.push(tempBooking);
                                })
                            )
                        );
                } catch {
                    /* no-op */
                }
            },
        }),

        // Optimistic: patches fields instantly in cache
        updateBooking: builder.mutation({
            queryFn: () => MOCK_SUCCESS,
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled, getState }) {
                let item = null;
                try {
                    item = JSON.parse(data.get("items"))?.[0];
                } catch {
                    /* partial patch */
                }

                const newRoomId = item?.room_segments?.[0]?.room_id || null;
                const hasRoomChange = item && "room_segments" in item;
                const cachedRooms =
                    Object.values(getState().bookingApi.queries).find((q) => q.endpointName === "getRooms" && q.status === "fulfilled")?.data || [];
                const newRoomName = cachedRooms.find((r) => r.id === newRoomId)?.name || null;

                const patches = patchAllCaches(dispatch, getState, (draft) => {
                    const b = draft.find((x) => Number(x.id) === Number(id));
                    if (!b) return;
                    if (item?.therapist) b.therapist_id = Number(item.therapist);
                    if (item?.start_time) b.start_time = `${item.start_time}:00`;
                    if (item?.end_time) b.end_time = `${item.end_time}:00`;
                    if (item?.duration) b.duration = item.duration;
                    if (item?.service) b.service_id = Number(item.service);
                    if (hasRoomChange) {
                        b.room_id = newRoomId;
                        b.room_name = newRoomName;
                    }
                    const note = data.get("note");
                    if (note !== null) b.note = note;
                    const src = data.get("source");
                    if (src) b.source = src;
                });
                await applyOptimistic(patches, queryFulfilled);
            },
        }),

        // Optimistic: marks as Cancelled in cache instantly
        cancelBooking: builder.mutation({
            queryFn: () => MOCK_SUCCESS,
            async onQueryStarted(fd, { dispatch, queryFulfilled, getState }) {
                const id = Number(fd.get("id"));
                const patches = patchAllCaches(dispatch, getState, (draft) => {
                    const b = draft.find((x) => Number(x.id) === id);
                    if (b) b.status = "Cancelled";
                });
                await applyOptimistic(patches, queryFulfilled);
            },
        }),

        // Optimistic: updates status in cache instantly
        updateBookingStatus: builder.mutation({
            queryFn: () => MOCK_SUCCESS,
            async onQueryStarted(fd, { dispatch, queryFulfilled, getState }) {
                const id = Number(fd.get("id"));
                const status = fd.get("status");
                const patches = patchAllCaches(dispatch, getState, (draft) => {
                    const b = draft.find((x) => Number(x.id) === id);
                    if (b) b.status = status;
                });
                await applyOptimistic(patches, queryFulfilled);
            },
        }),

        // Optimistic: removes booking from cache instantly
        deleteBooking: builder.mutation({
            queryFn: () => MOCK_SUCCESS,
            async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
                const patches = patchAllCaches(dispatch, getState, (draft) => {
                    const idx = draft.findIndex((x) => Number(x.id) === Number(id));
                    if (idx !== -1) draft.splice(idx, 1);
                });
                await applyOptimistic(patches, queryFulfilled);
            },
        }),

        // Drag-drop reschedule — cache patch handled in useBookingDrag.js
        rescheduleBooking: builder.mutation({
            queryFn: () => MOCK_SUCCESS,
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
    useUpdateBookingStatusMutation,
    useDeleteBookingMutation,
    useRescheduleBookingMutation,
} = bookingApi;

// ─── Live API (restore when backend is ready) ─────────────────────────────────
// Replace queryFn with query + transformResponse for each endpoint:
//
// getOutlets:    query: ({ outlet, start_date, end_date }) => ({ url: API.OUTLET_TIMINGS, params: { outlet, start_date, end_date } })
//                transformResponse: (res) => { const outlet = res?.data?.list?.outlet || res?.list?.outlet; return outlet ? [outlet] : []; }
//
// getTherapists: query: (params) => ({ url: API.THERAPISTS, params })
//                transformResponse: (res) => { const staffs = res?.data?.data?.list?.staffs; if (!Array.isArray(staffs)) return []; return staffs.map((t) => ({ ...t, name: t.alias || t.name || "Unknown" })); }
//
// getBookings:   query: (params) => ({ url: API.BOOKING_LIST, params })
//                transformResponse: (res) => { const bookings = res?.data?.data?.list?.bookings; return Array.isArray(bookings) ? bookings.map(flattenBooking) : []; }
//                providesTags: ["Booking"]
//
// getServices:   query: (params) => ({ url: API.SERVICE_CATEGORY, params })
//                transformResponse: (res) => { const cats = res?.data?.data?.list?.category; if (!Array.isArray(cats)) return []; return cats.flatMap((cat) => (cat.services || []).map((s) => ({ ...s, category: cat.name, duration: Number(s.duration) || 0 }))); }
//
// getRooms:      query: ({ outlet, ...params }) => ({ url: `${API.ROOM_BOOKINGS}/outlet/${outlet}`, params })
//                transformResponse: (res) => { ... }
//
// getUsers:      query: (params) => ({ url: API.USERS, params })
//                transformResponse: (res) => { const list = res?.data?.data?.list; return Array.isArray(list?.users) ? list.users : Array.isArray(list) ? list : Array.isArray(list?.data) ? list.data : []; }
//
// Mutations: replace queryFn with query: (fd) => ({ url: API.XXX, method: "POST", data: fd })
//            and restore original onQueryStarted logic
// ─────────────────────────────────────────────────────────────────────────────

//Actual API integration - Uncomment and replace HARDCODED_CREDENTIALS with real API calls when backend is ready

// import { createApi } from "@reduxjs/toolkit/query/react";
// import baseQuery from "../api/baseQuery";
// import { API } from "../config/api.config";
// import { MOCK_BOOKINGS } from "../api/mockBookings";

// const LOAD_TEST = false; // set to true to load mock bookings for MOCK_DATE_OVERRIDE
// const MOCK_DATE = "28-05-2026"; // date for which mock bookings will be loaded when LOAD_TEST=true (format: "DD-MM-YYYY")
// // Example: to test with mock data for April 3, 2026, set MOCK_DATE to "03-04-2026"

// // Data Helpers
// const getFirstBookingItem = (booking_item) => {
//     if (!booking_item || typeof booking_item !== "object") return {};
//     const key = Object.keys(booking_item)[0];
//     return key ? booking_item[key]?.[0] || {} : {};
// };

// // Flattens nested API booking shape → flat calendar object
// // Handles both list response (customer_name at root) and
// // create response (customer_name inside user{})
// export const flattenBooking = (b) => {
//     const item = getFirstBookingItem(b.booking_item);
//     return {
//         id: b.id,
//         user_id: b.user_id,
//         status: b.status,
//         source: b.source,
//         note: b.note,
//         customer_name: b.customer_name || b.user?.name || "",
//         mobile_number: b.mobile_number || b.user?.contact_number || "",
//         outlet_id: b.outlet_id,
//         created_by: b.created_by_name,
//         service_date: b.service_date,
//         service_time: b.service_time,
//         therapist_id: item.therapist_id,
//         therapist_name: item.therapist,
//         service_id: item.service_id,
//         service_name: item.service,
//         start_time: item.start_time,
//         end_time: item.end_time,
//         duration: item.duration,
//         room_id: item.room_items?.[0]?.room_id || item.room_id || null,
//         room_name: item.room_items?.[0]?.room_name || item.room_name || null,
//         requested_person: item.requested_person,
//         booking_item_id: item.id,
//         _raw: b,
//     };
// };

// // Cache Helpers

// // Patches ALL cached getBookings entries across any date.
// // Returns patches array — call patches.forEach(p => p.undo()) on failure.
// const patchAllCaches = (dispatch, getState, patchFn) =>
//     bookingApi.util
//         .selectInvalidatedBy(getState(), [{ type: "Booking" }])
//         .filter(({ endpointName }) => endpointName === "getBookings")
//         .map(({ originalArgs }) => dispatch(bookingApi.util.updateQueryData("getBookings", originalArgs, patchFn)));

// // Awaits API call — undoes cache patches on failure
// const applyOptimistic = async (patches, queryFulfilled) => {
//     try {
//         await queryFulfilled;
//     } catch {
//         patches.forEach((p) => p.undo());
//     }
// };

// // Factory: builds a FormData-based status mutation with optimistic cache update
// // getStatus(formData) must return { id: Number, status: String }
// const statusMutation = (url, getStatus) => ({
//     query: (fd) => ({ url, method: "POST", data: fd }),
//     async onQueryStarted(fd, { dispatch, queryFulfilled, getState }) {
//         const { id, status } = getStatus(fd);
//         const patches = patchAllCaches(dispatch, getState, (draft) => {
//             const b = draft.find((x) => Number(x.id) === id);
//             if (b) b.status = status;
//         });
//         await applyOptimistic(patches, queryFulfilled);
//     },
// });

// // API

// export const bookingApi = createApi({
//     reducerPath: "bookingApi",
//     baseQuery,
//     tagTypes: ["Booking"],

//     endpoints: (builder) => ({
//         getOutlets: builder.query({
//             query: ({ outlet, start_date, end_date }) => ({
//                 url: API.OUTLET_TIMINGS,
//                 params: { outlet, start_date, end_date },
//             }),
//             // Response: { data: { list: { outlet: { id, name } } } }
//             transformResponse: (res) => {
//                 const outlet = res?.data?.list?.outlet || res?.list?.outlet;
//                 return outlet ? [outlet] : [];
//             },
//         }),

//         getTherapists: builder.query({
//             query: (params) => ({ url: API.THERAPISTS, params }),
//             // Response: { data: { data: { list: { staffs: [...] } } } }
//             transformResponse: (res) => {
//                 const staffs = res?.data?.data?.list?.staffs;
//                 if (!Array.isArray(staffs)) return [];
//                 return staffs.map((t) => ({ ...t, name: t.alias || t.name || "Unknown" }));
//             },
//         }),

//         getBookings: builder.query({
//             query: (params) => ({ url: API.BOOKING_LIST, params }),
//             // Response: { data: { data: { list: { bookings: [...] } } } }
//             transformResponse: (res, _meta, params) => {
//                 if (LOAD_TEST && params?.daterange?.startsWith(MOCK_DATE)) {
//                     return MOCK_BOOKINGS;
//                 }
//                 const bookings = res?.data?.data?.list?.bookings;
//                 return Array.isArray(bookings) ? bookings.map(flattenBooking) : [];
//             },
//             providesTags: ["Booking"],
//         }),

//         getServices: builder.query({
//             query: (params) => ({ url: API.SERVICE_CATEGORY, params }),
//             // Response: { data: { data: { list: { category: [{ services: [...] }] } } } }
//             transformResponse: (res) => {
//                 const cats = res?.data?.data?.list?.category;
//                 if (!Array.isArray(cats)) return [];
//                 return cats.flatMap((cat) =>
//                     (cat.services || []).map((s) => ({
//                         ...s,
//                         category: cat.name,
//                         duration: Number(s.duration) || 0,
//                     }))
//                 );
//             },
//         }),

//         getRooms: builder.query({
//             query: ({ outlet, ...params }) => ({
//                 url: `${API.ROOM_BOOKINGS}/outlet/${outlet}`,
//                 params,
//             }),
//             // Fallback chain handles all known API response shape variants
//             transformResponse: (res) => {
//                 const d = res?.data;
//                 const list =
//                     [d?.data?.data?.list, d?.data?.data, d?.data?.list, d?.data?.rooms, d?.data, d?.rooms, d?.list, d].find(Array.isArray) || [];
//                 return list.flatMap((r) =>
//                     (r.items || []).map((item) => ({
//                         id: item.item_id,
//                         name: item.item_name || r.room_name,
//                         room_id: r.room_id,
//                         room_name: r.room_name,
//                     }))
//                 );
//             },
//         }),

//         getUsers: builder.query({
//             query: (params) => ({ url: API.USERS, params }),
//             // Response: { data: { data: { list: { users: [...] } } } }
//             transformResponse: (res) => {
//                 const list = res?.data?.data?.list;
//                 return Array.isArray(list?.users) ? list.users : Array.isArray(list) ? list : Array.isArray(list?.data) ? list.data : [];
//             },
//         }),

//         // Mutations

//         // Pessimistic: waits for response, pushes flattened booking into date cache
//         createBooking: builder.mutation({
//             query: (fd) => ({ url: API.CREATE_BOOKING, method: "POST", data: fd }),
//             async onQueryStarted(fd, { dispatch, queryFulfilled, getState }) {
//                 try {
//                     const { data: res } = await queryFulfilled;
//                     const newBooking = res?.data?.data?.booking;
//                     if (!newBooking?.id) {
//                         dispatch(bookingApi.util.invalidateTags(["Booking"]));
//                         return;
//                     }
//                     const flat = flattenBooking(newBooking);
//                     const date = fd.get("service_at")?.split(" ")[0]; // "DD-MM-YYYY"
//                     bookingApi.util
//                         .selectInvalidatedBy(getState(), [{ type: "Booking" }])
//                         .filter(({ endpointName, originalArgs }) => endpointName === "getBookings" && originalArgs?.daterange?.startsWith(date))
//                         .forEach(({ originalArgs }) =>
//                             dispatch(
//                                 bookingApi.util.updateQueryData("getBookings", originalArgs, (d) => {
//                                     d.push(flat);
//                                 })
//                             )
//                         );
//                 } catch {
//                     /* API failed — nothing was added to cache */
//                 }
//             },
//         }),

//         // Optimistic: patches therapist, times, service, room, note, source instantly
//         updateBooking: builder.mutation({
//             query: ({ id, data }) => ({ url: API.UPDATE_BOOKING(id), method: "POST", data }),
//             async onQueryStarted({ id, data }, { dispatch, queryFulfilled, getState }) {
//                 let item = null;
//                 try {
//                     item = JSON.parse(data.get("items"))?.[0];
//                 } catch {
//                     /* partial patch */
//                 }

//                 // Resolve room_name from cached getRooms data — avoids extra API call
//                 const newRoomId = item?.room_segments?.[0]?.room_id || null;
//                 const hasRoomChange = item && "room_segments" in item;
//                 const cachedRooms =
//                     Object.values(getState().bookingApi.queries).find((q) => q.endpointName === "getRooms" && q.status === "fulfilled")?.data || [];
//                 const newRoomName = cachedRooms.find((r) => r.id === newRoomId)?.name || null;

//                 const patches = patchAllCaches(dispatch, getState, (draft) => {
//                     const b = draft.find((x) => Number(x.id) === Number(id));
//                     if (!b) return;
//                     if (item?.therapist) b.therapist_id = Number(item.therapist);
//                     if (item?.start_time) b.start_time = `${item.start_time}:00`;
//                     if (item?.end_time) b.end_time = `${item.end_time}:00`;
//                     if (item?.duration) b.duration = item.duration;
//                     if (item?.service) b.service_id = Number(item.service);
//                     // room_segments key present = room was explicitly set (including "no room")
//                     if (hasRoomChange) {
//                         b.room_id = newRoomId;
//                         b.room_name = newRoomName;
//                     }
//                     const note = data.get("note");
//                     if (note !== null) b.note = note;
//                     const src = data.get("source");
//                     if (src) b.source = src;
//                 });
//                 await applyOptimistic(patches, queryFulfilled);
//             },
//         }),

//         // Optimistic status mutations — built via factory
//         cancelBooking: builder.mutation(
//             statusMutation(API.CANCEL_BOOKING, (fd) => ({
//                 id: Number(fd.get("id")),
//                 status: "Cancelled",
//             }))
//         ),

//         updateBookingStatus: builder.mutation(
//             statusMutation(API.UPDATE_BOOKING_STATUS, (fd) => ({
//                 id: Number(fd.get("id")),
//                 status: fd.get("status"),
//             }))
//         ),

//         // Optimistic: removes booking from cache instantly
//         deleteBooking: builder.mutation({
//             query: (id) => ({ url: API.DELETE_BOOKING(id), method: "DELETE" }),
//             async onQueryStarted(id, { dispatch, queryFulfilled, getState }) {
//                 const patches = patchAllCaches(dispatch, getState, (draft) => {
//                     const idx = draft.findIndex((x) => Number(x.id) === Number(id));
//                     if (idx !== -1) draft.splice(idx, 1);
//                 });
//                 await applyOptimistic(patches, queryFulfilled);
//             },
//         }),

//         // Drag-drop reschedule — optimistic update handled in useBookingDrag.js
//         rescheduleBooking: builder.mutation({
//             query: ({ id, data }) => ({ url: API.UPDATE_BOOKING(id), method: "POST", data }),
//         }),
//     }),
// });

// export const {
//     useGetOutletsQuery,
//     useGetTherapistsQuery,
//     useGetBookingsQuery,
//     useGetServicesQuery,
//     useGetRoomsQuery,
//     useGetUsersQuery,
//     useCreateBookingMutation,
//     useUpdateBookingMutation,
//     useCancelBookingMutation,
//     useUpdateBookingStatusMutation,
//     useDeleteBookingMutation,
//     useRescheduleBookingMutation,
// } = bookingApi;
