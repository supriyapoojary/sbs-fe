import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
    useCreateBookingMutation,
    useUpdateBookingMutation,
    useGetServicesQuery,
    useGetRoomsQuery,
    useGetTherapistsQuery,
    useGetUsersQuery,
    useGetOutletsQuery,
} from "../../../../store/bookingApi";
import { closePanel, selectActiveDate, selectActiveOutlet, selectPrefill } from "../../../../store/uiSlice";
import { selectCurrentUser } from "../../../../store/authSlice";
import logger from "../../../../utils/logger";
import toast from "react-hot-toast";
import "./BookingFormMode.scss";

// Extract first item from raw nested booking_item: { "CustomerName": [{...}] }
const getRawItem = (booking) => {
    if (!booking?._raw?.booking_item) return null;
    const key = Object.keys(booking._raw.booking_item)[0];
    return key ? booking._raw.booking_item[key]?.[0] || null : null;
};

const MASSAGE_TYPES = [
    { value: "", label: "None" },
    { value: "Oil", label: "Oil" },
    { value: "No Oil", label: "No Oil" },
    { value: "Hard", label: "Hard Pressure" },
    { value: "Medium", label: "Medium Pressure" },
    { value: "Soft", label: "Soft Pressure" },
];

const BookingFormMode = ({ booking, mode }) => {
    const dispatch = useDispatch();
    const activeDate = useSelector(selectActiveDate);
    const outletId = useSelector(selectActiveOutlet);
    const prefill = useSelector(selectPrefill);
    const currentUser = useSelector(selectCurrentUser);

    const apiDate = dayjs(activeDate).format("DD-MM-YYYY");
    const start_date = dayjs(activeDate).startOf("month").format("DD-MM-YYYY");
    const end_date = dayjs(activeDate).endOf("month").format("DD-MM-YYYY");

    const { data: outlets = [] } = useGetOutletsQuery({ outlet: outletId, start_date, end_date });
    const outletName = outlets.find((o) => o.id === outletId)?.name || `Outlet ${outletId}`;

    const { data: services = [] } = useGetServicesQuery({
        outlet_type: 2,
        outlet: outletId,
        pagination: 0,
        panel: "outlet",
    });

    const { data: therapists = [] } = useGetTherapistsQuery({
        availability: 1,
        outlet: outletId,
        service_at: `${apiDate} 09:00:00`,
        services: 1,
        status: 1,
        pagination: 0,
        panel: "outlet",
        outlet_type: 2,
        leave: 0,
    });

    // Use booking's own date for rooms in edit mode — activeDate may differ
    const roomsDate = mode === "edit" && booking?.service_date ? dayjs(booking.service_date, "DD-MM-YYYY").format("DD-MM-YYYY") : apiDate;

    const { data: rooms = [] } = useGetRoomsQuery({
        outlet: outletId,
        date: roomsDate,
        panel: "outlet",
        duration: 60,
    });

    // DD-MM-YYYY format required by API
    const { data: users = [] } = useGetUsersQuery({
        pagination: 1,
        daterange: `${dayjs().subtract(3, "year").format("DD-MM-YYYY")} / ${dayjs().add(1, "year").format("DD-MM-YYYY")}`,
    });

    const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
    const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();
    const isLoading = isCreating || isUpdating;

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues:
            mode === "edit" && booking
                ? {
                      date: booking.service_date ? dayjs(booking.service_date, "DD-MM-YYYY").format("YYYY-MM-DD") : activeDate,
                      start_time: booking.start_time?.slice(0, 5) || "",
                      customer: String(booking.user_id || ""),
                      service: String(booking.service_id || ""),
                      therapist: String(booking.therapist_id || ""),
                      room_id: String(booking.room_id || ""),
                      service_request: getRawItem(booking)?.service_request || "",
                      source: booking.source || "Walk-in",
                      note: booking.note || "",
                  }
                : {
                      date: prefill?.date || activeDate,
                      start_time: prefill?.start_time || "",
                      therapist: String(prefill?.therapist_id || ""),
                      source: "Walk-in",
                      service_request: "",
                  },
    });

    // Reset ALL fields whenever booking data updates (after save + refetch)
    // Also fires when lists load — guarantees selects always show correct value
    React.useEffect(() => {
        if (mode !== "edit" || !booking) return;
        reset({
            date: booking.service_date ? dayjs(booking.service_date, "DD-MM-YYYY").format("YYYY-MM-DD") : activeDate,
            start_time: booking.start_time?.slice(0, 5) || "",
            customer: String(booking.user_id || ""),
            service: String(booking.service_id || ""),
            therapist: String(booking.therapist_id || ""),
            room_id: String(booking.room_id || ""),
            service_request: getRawItem(booking)?.service_request || "",
            source: booking.source || "Walk-in",
            note: booking.note || "",
        });
        // Only reset when switching to a different booking — not when lists load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [booking?.id]);

    // Set select values when async lists load — only if user hasn't changed them yet
    React.useEffect(() => {
        if (mode === "edit" && booking?.room_id && rooms.length > 0) setValue("room_id", String(booking.room_id), { shouldDirty: false });
    }, [rooms.length]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (mode === "edit" && booking?.service_id && services.length > 0) setValue("service", String(booking.service_id), { shouldDirty: false });
    }, [services.length]); // eslint-disable-line react-hooks/exhaustive-deps

    React.useEffect(() => {
        if (mode === "edit" && booking?.user_id && users.length > 0) setValue("customer", String(booking.user_id), { shouldDirty: false });
    }, [users.length]); // eslint-disable-line react-hooks/exhaustive-deps

    const selectedService = services.find((s) => s.id === Number(watch("service")));
    const selectedCustomer = users.find((u) => u.id === Number(watch("customer")));

    const onSubmit = async (data) => {
        const bookingDateTime = dayjs(`${data.date} ${data.start_time}`, "YYYY-MM-DD HH:mm");
        if (bookingDateTime.isBefore(dayjs())) {
            toast.error("Cannot save a booking in the past.");
            return;
        }
        try {
            const dateStr = dayjs(data.date).format("DD-MM-YYYY");
            const duration = Number(selectedService?.duration) || 60;
            const [h, m] = (data.start_time || "09:00").split(":");
            const endTime = dayjs().hour(Number(h)).minute(Number(m)).add(duration, "minute").format("HH:mm");

            // Build item — room_segments only added when a valid room is selected
            const roomId = data.room_id ? Number(data.room_id) : null;
            const item = {
                service: Number(data.service),
                start_time: data.start_time,
                end_time: endTime,
                duration,
                therapist: Number(data.therapist) || undefined,
                requested_person: 0,
                requested_room: 0,
                price: String(selectedService?.price || getRawItem(booking)?.price || "0.00"),
                quantity: "1",
                service_request: data.service_request || "",
                commission: null,
                customer_name: selectedCustomer?.name || booking?.customer_name || "",
                primary: 1,
                item_number: 1,
            };
            if (mode === "edit" && booking?.booking_item_id) {
                item.id = booking.booking_item_id;
                item.start_date = dateStr;
                item.end_date = dateStr;
            }
            if (roomId) {
                item.room_segments = [
                    {
                        room_id: roomId,
                        item_type: "single-bed",
                        meta_service: null,
                        start_time: data.start_time,
                        end_time: endTime,
                        duration,
                        priority: 1,
                    },
                ];
            }

            const fd = new FormData();
            fd.append("company", "1");
            fd.append("outlet", outletId);
            fd.append("outlet_type", "2");
            fd.append("booking_type", "1");
            fd.append("customer", data.customer);
            fd.append("items", JSON.stringify([item]));
            fd.append("currency", "SGD");
            fd.append("source", data.source || "Walk-in");
            fd.append("payment_type", "payatstore");
            fd.append("service_at", `${dateStr} ${data.start_time}`);
            fd.append("panel", "outlet");
            fd.append("membership", "0");
            if (data.note) fd.append("note", data.note);

            if (mode === "edit") {
                fd.append("updated_by", currentUser?.id || ""); // edit requires updated_by
                await updateBooking({ id: booking.id, data: fd }).unwrap();
                toast.success("Booking updated");
                logger.action("Booking updated", { id: booking.id });
            } else {
                fd.append("type", "manual");
                fd.append("created_by", currentUser?.id || ""); // create requires created_by
                await createBooking(fd).unwrap();
                toast.success("Booking created");
                logger.action("Booking created", { outlet: outletId, date: dateStr });
            }

            dispatch(closePanel());
        } catch (err) {
            logger.apiError("Booking save failed", err);
            toast.error(err?.message || "Something went wrong.");
        }
    };

    return (
        <form className="booking-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Outlet — read-only */}
            <div className="booking-form__section">
                <div className="form-row">
                    <span className="form-label">Outlet</span>
                    <span className="form-value">{outletName}</span>
                </div>
            </div>

            {/* Date + Time */}
            <div className="booking-form__section">
                <div className="form-row-pair">
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input type="date" className={`input${errors.date ? " input--error" : ""}`} {...register("date", { required: "Required" })} />
                        {errors.date && <span className="error-msg">{errors.date.message}</span>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Time</label>
                        <input
                            type="time"
                            className={`input${errors.start_time ? " input--error" : ""}`}
                            {...register("start_time", { required: "Required" })}
                        />
                        {errors.start_time && <span className="error-msg">{errors.start_time.message}</span>}
                    </div>
                </div>
            </div>

            {/* Client */}
            <div className="booking-form__section">
                <div className="form-group">
                    <label className="form-label">Client</label>
                    <select
                        className={`input${errors.customer ? " input--error" : ""}`}
                        {...register("customer", { required: "Client is required" })}
                    >
                        <option value="">{users.length === 0 ? "Loading clients…" : "Select client…"}</option>
                        {users.length === 0 && booking?.user_id && (
                            <option value={String(booking.user_id)}>
                                {booking.mobile_number} — {booking.customer_name}
                            </option>
                        )}
                        {users.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.contact_number} — {u.name} {u.last_name || u.lastname || ""}
                            </option>
                        ))}
                    </select>
                    {errors.customer && <span className="error-msg">{errors.customer.message}</span>}
                </div>
                {selectedCustomer && (
                    <div className="client-preview">
                        <div className="client-preview__avatar">
                            {selectedCustomer.name?.[0] || "?"}
                            {selectedCustomer.last_name?.[0] || selectedCustomer.lastname?.[0] || ""}
                        </div>
                        <div>
                            <div className="client-preview__name">
                                {selectedCustomer.name} {selectedCustomer.last_name || selectedCustomer.lastname}
                            </div>
                            <div className="client-preview__since">{selectedCustomer.contact_number}</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Service */}
            <div className="booking-form__section">
                <div className="form-group">
                    <label className="form-label">Service</label>
                    <select className={`input${errors.service ? " input--error" : ""}`} {...register("service", { required: "Service is required" })}>
                        <option value="">{services.length === 0 ? "Loading services…" : "Select service…"}</option>
                        {/* Fallback: keep current service visible while list loads */}
                        {services.length === 0 && booking?.service_id && <option value={String(booking.service_id)}>{booking.service_name}</option>}
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.duration} min)
                            </option>
                        ))}
                    </select>
                    {errors.service && <span className="error-msg">{errors.service.message}</span>}
                </div>
                {selectedService && (
                    <div className="form-row">
                        <span className="form-label">Duration:</span>
                        <span className="form-value">{selectedService.duration} min</span>
                    </div>
                )}
            </div>

            {/* Massage Type */}
            <div className="booking-form__section">
                <div className="form-group">
                    <label className="form-label">Massage Type</label>
                    <select className="input" {...register("service_request")}>
                        {MASSAGE_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Therapist */}
            <div className="booking-form__section">
                <div className="form-group">
                    <label className="form-label">Therapist</label>
                    <select className="input" {...register("therapist")}>
                        <option value="">Any available</option>
                        {therapists.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name} ({t.gender})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Room */}
            <div className="booking-form__section">
                <div className="form-group">
                    <label className="form-label">Room (optional)</label>
                    <select className="input" {...register("room_id")}>
                        <option value="">No room</option>
                        {/* Always include current room — availability list may exclude already-booked rooms */}
                        {booking?.room_id && !rooms.find((r) => String(r.id) === String(booking.room_id)) && (
                            <option value={String(booking.room_id)}>{booking.room_name}</option>
                        )}
                        {rooms.map((r) => (
                            <option key={r.id} value={String(r.id)}>
                                {r.name || r.room_name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Source */}
            <div className="booking-form__section">
                <div className="form-group">
                    <label className="form-label">Source</label>
                    <select className="input" {...register("source")}>
                        <option value="Walk-in">Walk-in</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="By Phone">By Phone</option>
                    </select>
                </div>
            </div>

            {/* Notes */}
            <div className="booking-form__section">
                <div className="form-group">
                    <label className="form-label">Notes (optional)</label>
                    <textarea className="input input--textarea" placeholder="Any special notes…" rows={3} {...register("note")} />
                </div>
            </div>

            <div className="booking-form__footer">
                <button type="submit" className="btn-submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="spinner" /> Saving…
                        </>
                    ) : mode === "edit" ? (
                        "Save Changes"
                    ) : (
                        "Create Booking"
                    )}
                </button>
            </div>
        </form>
    );
};

export default BookingFormMode;
