import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { closePanel } from "store/uiSlice";
import { useCancelBookingMutation, useDeleteBookingMutation, useUpdateBookingStatusMutation } from "store/bookingApi";
import logger from "utils/logger";
import toast from "react-hot-toast";
import "./CancelDialog.scss";

const CANCEL_TYPES = [
    { id: "normal", label: "Normal Cancellation", desc: "" },
    { id: "no_show", label: "No Show", desc: "" },
    { id: "delete", label: "Just Delete It", desc: "Bookings with a deposit cannot be deleted. Please cancel instead to retain a proper record." },
];

const CancelDialog = ({ booking, onClose }) => {
    const dispatch = useDispatch();
    const [selected, setSelected] = useState("normal");

    const [cancelBooking, { isLoading: cancelling }] = useCancelBookingMutation();
    const [deleteBooking, { isLoading: deleting }] = useDeleteBookingMutation();
    const [updateStatus, { isLoading: updating }] = useUpdateBookingStatusMutation();
    const isLoading = cancelling || deleting || updating;

    const handleNext = async () => {
        try {
            if (selected === "delete") {
                await deleteBooking(booking.id).unwrap();
                toast.success("Booking deleted");
            } else if (selected === "no_show") {
                const fd = new FormData();
                fd.append("company", "1");
                fd.append("id", booking.id);
                fd.append("status", "No-show");
                fd.append("panel", "outlet");
                await updateStatus(fd).unwrap();
                toast.success("Booking marked as No Show");
            } else {
                const fd = new FormData();
                fd.append("id", booking.id);
                fd.append("booking_item", booking.booking_item_id);
                fd.append("cancel_type", "normal");
                fd.append("panel", "outlet");
                await cancelBooking(fd).unwrap();
                toast.success("Booking cancelled");
            }
            logger.action("Booking cancel/delete", { id: booking.id, type: selected });
            dispatch(closePanel());
            onClose();
        } catch (err) {
            toast.error("Failed. Please try again.");
            logger.apiError("Cancel/delete failed", err);
        }
    };

    return (
        <div className="cancel-dialog-backdrop">
            <div className="cancel-dialog">
                <div className="cancel-dialog__progress">
                    <div className="cancel-dialog__progress-bar" />
                </div>

                <h3 className="cancel-dialog__title">Cancel / Delete Booking</h3>
                <p className="cancel-dialog__subtitle">Please select the cancellation type.</p>

                <div className="cancel-dialog__options">
                    {CANCEL_TYPES.map(({ id, label, desc }) => (
                        <label key={id} className={`cancel-option ${selected === id ? "cancel-option--selected" : ""}`}>
                            <input
                                type="radio"
                                name="cancel_type"
                                value={id}
                                checked={selected === id}
                                onChange={() => setSelected(id)}
                                className="cancel-option__radio"
                            />
                            <div className="cancel-option__content">
                                <span className="cancel-option__label">{label}</span>
                                {desc && <span className="cancel-option__desc">{desc}</span>}
                            </div>
                        </label>
                    ))}
                </div>

                <div className="cancel-dialog__actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </button>
                    <button className="btn btn-primary" onClick={handleNext} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner" /> Processing…
                            </>
                        ) : (
                            "Next"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelDialog;
