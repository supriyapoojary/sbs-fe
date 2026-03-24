import React, { useState } from "react";
import { useDispatch } from "react-redux";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { setPanelMode } from "../../../../store/uiSlice";
import { useCancelBookingMutation } from "../../../../store/bookingApi";
import CancelDialog from "../cancelDialog/CancelDialog";
import logger from "../../../../utils/logger";
import "./BookingViewMode.scss";

dayjs.extend(customParseFormat);

// service_date comes as "DD-MM-YYYY" from API — needs customParseFormat
const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = dayjs(dateStr, "DD-MM-YYYY");
    return d.isValid() ? d.format("ddd, MMM D YYYY") : dateStr;
};

const BookingViewMode = ({ booking }) => {
    const dispatch = useDispatch();
    const [showCancelDialog, setShowCancelDialog] = useState(false);

    if (!booking) {
        return (
            <div className="view-mode__empty">
                <p>No booking selected.</p>
            </div>
        );
    }

    const status = (booking.status || "").toLowerCase();
    const isCancelled = status === "cancelled";
    const isCompleted = status === "completed";

    const statusLabel =
        {
            confirmed: "Confirmed",
            in_progress: "In Progress",
            completed: "Completed",
            cancelled: "Cancelled",
            "no-show": "No-show",
        }[status] || booking.status;

    const startTime = booking.start_time?.slice(0, 5) || "";

    return (
        <div className="view-mode">
            {/* Status */}
            <div className="view-mode__status-row">
                <span className={`status-badge status-badge--${status}`}>
                    <span className="status-badge__dot" />
                    {statusLabel}
                </span>
                {isCompleted && <button className="btn btn-secondary btn-sm">View Sale</button>}
            </div>

            {/* Date + Time */}
            <div className="view-mode__datetime">
                <div className="view-mode__field">
                    <span className="view-mode__field-label">ON</span>
                    <span className="view-mode__field-value">{formatDate(booking.service_date)}</span>
                </div>
                <div className="view-mode__field">
                    <span className="view-mode__field-label">AT</span>
                    <span className="view-mode__field-value">{startTime}</span>
                </div>
            </div>

            {/* Client */}
            <div className="view-mode__client">
                <div className="client-avatar" style={{ background: "#f97316", color: "#fff" }}>
                    {(booking.customer_name?.[0] || "?").toUpperCase()}
                </div>
                <div className="client-info">
                    <div className="client-info__name">{booking.mobile_number}</div>
                    <div className="client-info__sub">{booking.customer_name}</div>
                    <div className="client-info__since">Created by: {booking.created_by}</div>
                </div>
            </div>

            {/* Service */}
            <div className="view-mode__service-block">
                <div className="service-block__header">
                    <span className="service-block__name">{booking.service_name}</span>
                </div>
                <div className="service-block__row">
                    <span className="service-block__label">With:</span>
                    <span className="service-block__value">{booking.therapist_name}</span>
                </div>
                <div className="service-block__row">
                    <span className="service-block__label">For:</span>
                    <span className="service-block__value">{booking.duration} min</span>
                    <span className="service-block__label ml-8">At:</span>
                    <span className="service-block__value">{startTime}</span>
                </div>
                {booking.room_name && (
                    <div className="service-block__row">
                        <span className="service-block__label">Room:</span>
                        <span className="service-block__value">{booking.room_name}</span>
                    </div>
                )}
                {booking.source && (
                    <div className="service-block__row">
                        <span className="service-block__label">Source:</span>
                        <span className="service-block__value">{booking.source}</span>
                    </div>
                )}
            </div>

            {/* Notes */}
            {booking.note && <div className="view-mode__notes">{booking.note}</div>}

            {/* Booking details */}
            <div className="view-mode__booking-details">
                <div className="booking-details__title">Booking Details</div>
                <div className="booking-details__row">
                    <span>Created:</span>
                    <span>{booking._raw?.created_at || "—"}</span>
                </div>
                <div className="booking-details__row">
                    <span>Created by:</span>
                    <span>{booking.created_by}</span>
                </div>
                {isCancelled && booking._raw?.cancel_reason && (
                    <div className="booking-details__row">
                        <span>Cancel reason:</span>
                        <span>{booking._raw.cancel_reason}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            {!isCancelled && !isCompleted && (
                <div className="view-mode__actions">
                    <button className="btn btn-ghost btn-sm btn-danger-ghost" onClick={() => setShowCancelDialog(true)}>
                        Cancel Booking
                    </button>
                </div>
            )}

            {showCancelDialog && <CancelDialog booking={booking} onClose={() => setShowCancelDialog(false)} />}
        </div>
    );
};

export default BookingViewMode;
