import React, { useState } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useUpdateBookingStatusMutation } from "../../../../store/bookingApi";
import toast from "react-hot-toast";
import logger from "../../../../utils/logger";
import "./BookingViewMode.scss";

dayjs.extend(customParseFormat);

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const d = dayjs(dateStr, "DD-MM-YYYY");
    return d.isValid() ? d.format("ddd, MMM D YYYY") : dateStr;
};

const BookingViewMode = ({ booking }) => {
    const [updateStatus, { isLoading }] = useUpdateBookingStatusMutation();

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
    const isConfirmed = status === "confirmed";
    const isCheckedIn = status === "check-in (in progress)" || status === "in_progress";
    const startTime = booking.start_time?.slice(0, 5) || "";

    const statusLabel =
        {
            confirmed: "Confirmed",
            "check-in (in progress)": "Checked In",
            in_progress: "In Progress",
            completed: "Completed",
            cancelled: "Cancelled",
            "no-show": "No-show",
        }[status] || booking.status;

    const handleStatusUpdate = async (newStatus) => {
        try {
            const fd = new FormData();
            fd.append("company", "1");
            fd.append("id", booking.id);
            fd.append("status", newStatus);
            fd.append("panel", "outlet");
            await updateStatus(fd).unwrap();
            toast.success("Status updated");
            logger.action("Booking status updated", { id: booking.id, status: newStatus });
        } catch (err) {
            toast.error(err?.message || "Status update failed");
            logger.apiError("Status update failed", err);
        }
    };

    return (
        <div className="view-mode">
            <div className="view-mode__status-row">
                <span className={`status-badge status-badge--${status.replace(/\s|\(|\)/g, "_")}`}>
                    <span className="status-badge__dot" />
                    {statusLabel}
                </span>
                {isConfirmed && (
                    <button className="btn btn-primary btn-sm" disabled={isLoading} onClick={() => handleStatusUpdate("Check-in (In Progress)")}>
                        Check-in
                    </button>
                )}
                {isCheckedIn && (
                    <button className="btn btn-primary btn-sm" disabled={isLoading} onClick={() => handleStatusUpdate("Completed")}>
                        Checkout
                    </button>
                )}
            </div>

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

            {booking.note && <div className="view-mode__notes">{booking.note}</div>}

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
        </div>
    );
};

export default BookingViewMode;
