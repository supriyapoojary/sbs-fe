import React, { memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDispatch } from "react-redux";
import { openPanel } from "../../../../store/uiSlice";
import { durationToHeight, timeToSlotIndex, SLOT_HEIGHT_PX } from "../../../../constants/calendarConstants";
import { getTherapistColor, getClientBlockColor, IN_PROGRESS_COLOR } from "../../../../constants/therapistColors";
import "./bookingBlock.scss";

const normalizeTime = (t) => (t ? t.slice(0, 5) : "09:00");
const normalizeStatus = (s) => (s || "").toLowerCase().replace(/[- ]/g, "_");

// Minimum height so content is always visible — at least 4 slots (60px)
const MIN_HEIGHT = SLOT_HEIGHT_PX * 4;

const BookingBlock = memo(({ booking, therapist }) => {
    const dispatch = useDispatch();
    const status = normalizeStatus(booking.status);

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: booking.id,
        disabled: status === "cancelled",
        data: { booking },
    });

    const startTime = normalizeTime(booking.start_time);
    const top = timeToSlotIndex(startTime) * SLOT_HEIGHT_PX;
    // Use actual duration height but enforce minimum so content always fits
    const height = Math.max(durationToHeight(booking.duration || 60), MIN_HEIGHT);
    const isSmall = height < MIN_HEIGHT;

    const blockColor =
        status === "in_progress"
            ? IN_PROGRESS_COLOR
            : status === "cancelled"
              ? { bg: "#fef9c3", border: "#eab308" }
              : getClientBlockColor(booking.user_id || booking.id);

    const handleClick = (e) => {
        if (isDragging) return;
        e.stopPropagation();
        dispatch(openPanel({ mode: "view", bookingId: booking.id }));
    };

    return (
        <div
            ref={setNodeRef}
            className={`booking-block booking-block--${status}${isSmall ? " booking-block--small" : ""}`}
            style={{
                top,
                height,
                background: blockColor.bg,
                borderLeftColor: blockColor.border,
                opacity: isDragging ? 0.3 : 1,
                transform: CSS.Translate.toString(transform),
                cursor: status === "cancelled" ? "default" : "grab",
                touchAction: "none",
                zIndex: isDragging ? 999 : 2,
                willChange: "transform",
            }}
            onClick={handleClick}
            title={`${booking.service_name} — ${booking.customer_name}`}
            {...listeners}
            {...attributes}
        >
            <div className="booking-block__content">
                {/* Service name */}
                <div className="booking-block__service">{booking.service_name}</div>

                {/* Phone + name */}
                <div className="booking-block__client">
                    {status === "in_progress" ? (
                        <span className="booking-block__in-progress">In progress</span>
                    ) : (
                        <>
                            <span className="booking-block__phone">{booking.mobile_number}</span>
                            <span className="booking-block__name">{booking.customer_name}</span>
                        </>
                    )}
                </div>

                {/* Icons row */}
                <div className="booking-block__icons">
                    <span className={`booking-block__icon booking-block__icon--${status}`} title={booking.status}>
                        {status === "confirmed"
                            ? "C"
                            : status === "completed"
                              ? "D"
                              : status === "cancelled"
                                ? "X"
                                : status === "in_progress"
                                  ? "I"
                                  : "C"}
                    </span>

                    {booking.requested_person === 1 && (
                        <span
                            className="booking-block__icon"
                            style={{ background: getTherapistColor(therapist?.gender) }}
                            title="Requested Therapist"
                        >
                            T
                        </span>
                    )}

                    {booking.source && (
                        <span className="booking-block__icon booking-block__icon--source" title={booking.source}>
                            {booking.source === "Walk-in" ? "W" : booking.source === "WhatsApp" ? "A" : "P"}
                        </span>
                    )}

                    {booking.room_id && (
                        <span className="booking-block__icon booking-block__icon--room" title={booking.room_name}>
                            R
                        </span>
                    )}

                    {booking.note && (
                        <span className="booking-block__icon booking-block__icon--note" title={booking.note}>
                            N
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

BookingBlock.displayName = "BookingBlock";
export default BookingBlock;
