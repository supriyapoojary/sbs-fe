import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { closePanel } from "../../../../store/uiSlice";
import { useCancelBookingMutation } from "../../../../store/bookingApi";
import logger from "../../../../utils/logger";
import toast from "react-hot-toast";
import "./CancelDialog.scss";

const CANCEL_TYPES = [
    {
        value: "normal",
        label: "Normal Cancellation",
        desc: "Standard cancellation by client or staff",
    },
    { value: "no-show", label: "No Show", desc: "Client did not show up for appointment" },
];

const CancelDialog = ({ booking, onClose }) => {
    const dispatch = useDispatch();
    const [selected, setSelected] = useState("normal");
    const [cancelBooking, { isLoading }] = useCancelBookingMutation();

    const handleConfirm = async () => {
        try {
            const fd = new FormData();
            fd.append("company", "1");
            fd.append("id", booking.id);
            fd.append("type", selected); // "normal" or "no-show"
            fd.append("panel", "outlet");

            await cancelBooking(fd).unwrap();
            toast.success("Booking cancelled");
            logger.action("Booking cancelled", { id: booking.id, type: selected });
            dispatch(closePanel());
        } catch (err) {
            toast.error(err?.message || "Cancel failed");
            logger.apiError("Cancel booking failed", err);
        }
    };

    return (
        <div className="cancel-dialog-backdrop" onClick={onClose}>
            <div className="cancel-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="cancel-dialog__progress">
                    <div className="cancel-dialog__progress-bar" style={{ width: "50%" }} />
                </div>

                <h3 className="cancel-dialog__title">Cancel Booking</h3>
                <p className="cancel-dialog__subtitle">
                    Cancelling booking #{booking.id} for {booking.customer_name}
                </p>

                <div className="cancel-dialog__options">
                    {CANCEL_TYPES.map(({ value, label, desc }) => (
                        <label
                            key={value}
                            className={`cancel-option${selected === value ? " cancel-option--selected" : ""}`}
                            onClick={() => setSelected(value)}
                        >
                            <span className="cancel-option__radio">{selected === value && "●"}</span>
                            <span className="cancel-option__content">
                                <span className="cancel-option__label">{label}</span>
                                <span className="cancel-option__desc">{desc}</span>
                            </span>
                        </label>
                    ))}
                </div>

                <div className="cancel-dialog__actions">
                    <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
                        Keep Booking
                    </button>
                    <button className="btn btn-danger" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="spinner" /> Cancelling…
                            </>
                        ) : (
                            "Confirm Cancel"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelDialog;
