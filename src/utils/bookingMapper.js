export const mapBooking = (b) => ({
    id: b.id,
    therapist_id: b.therapist_id,
    service_id: b.service_id,
    client_id: b.client_id,
    room_id: b.room_id,

    date: b.date,
    start_time: b.start_time,
    end_time: b.end_time,

    status: b.status,

    // REQUIRED FOR UI (replaces stub data)
    service: {
        id: b.service?.id,
        name: b.service?.name,
        duration: b.service?.duration,
    },

    client: {
        id: b.client?.id,
        name: b.client?.name,
        phone: b.client?.phone,
    },
});
