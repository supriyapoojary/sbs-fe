import React, { lazy, Suspense, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectIsPanelOpen, selectPanelMode, selectSelectedId, closePanel, setPanelMode } from "../../../../store/uiSlice";
import { selectActiveDate, selectActiveOutlet } from "../../../../store/uiSlice";
import { useGetBookingsQuery } from "../../../../store/bookingApi";
import dayjs from "dayjs";
import "./BookingPanel.scss";

const BookingViewMode = lazy(() => import("../bookingViewMode/BookingViewMode"));
const BookingFormMode = lazy(() => import("../bookingFormMode/BookingFormMode"));

const BookingPanel = () => {
    const dispatch = useDispatch();
    const isOpen = useSelector(selectIsPanelOpen);
    const panelMode = useSelector(selectPanelMode);
    const selectedId = useSelector(selectSelectedId);
    const activeDate = useSelector(selectActiveDate);
    const outletId = useSelector(selectActiveOutlet);

    // Track the booking date — stays on the booking's own date even when calendar navigates away
    const [bookingDate, setBookingDate] = useState(activeDate);

    const apiDate = dayjs(bookingDate).format("DD-MM-YYYY");

    const { data: bookings } = useGetBookingsQuery({
        daterange: `${apiDate} / ${apiDate}`,
        outlet: outletId,
        panel: "outlet",
        view_type: "calendar",
        pagination: 1,
    });

    const booking = Array.isArray(bookings) ? bookings.find((b) => b.id === selectedId) : undefined;

    // When booking is found, lock its date so query stays correct after edits
    useEffect(() => {
        if (booking?.service_date) {
            const d = dayjs(booking.service_date, "DD-MM-YYYY");
            if (d.isValid()) setBookingDate(d.format("YYYY-MM-DD"));
        }
    }, [booking?.service_date]);

    // When panel opens for a new booking, use active calendar date
    useEffect(() => {
        if (isOpen) setBookingDate(activeDate);
    }, [isOpen, selectedId]); // reset when opening a different booking

    if (!isOpen) return null;

    const title = panelMode === "create" ? "New Booking" : panelMode === "edit" ? "Update Booking" : "Appointment";

    return (
        <>
            <div className="overlay" onClick={() => dispatch(closePanel())} />
            <aside className="booking-panel animate-slide-in">
                <div className="booking-panel__header">
                    <h3 className="booking-panel__title">{title}</h3>
                    <div className="booking-panel__header-actions">
                        {panelMode === "view" && booking && (
                            <>
                                <button className="panel-icon-btn" title="More options">
                                    <DotsIcon />
                                </button>
                                <button className="panel-icon-btn" title="Edit" onClick={() => dispatch(setPanelMode("edit"))}>
                                    <EditIcon />
                                </button>
                            </>
                        )}
                        <button className="panel-cancel-btn" onClick={() => dispatch(closePanel())}>
                            Cancel
                        </button>
                    </div>
                </div>

                <div className="booking-panel__body">
                    <Suspense fallback={<PanelSkeleton />}>
                        {panelMode === "view" && <BookingViewMode booking={booking} />}
                        {(panelMode === "create" || panelMode === "edit") && (
                            <BookingFormMode key={`${booking?.id}-${panelMode}`} booking={booking} mode={panelMode} />
                        )}
                    </Suspense>
                </div>
            </aside>
        </>
    );
};

const PanelSkeleton = () => (
    <div className="panel-skeleton">
        {[80, 90, 70, 60].map((w, i) => (
            <div key={i} className="panel-skeleton__row" style={{ width: `${w}%` }} />
        ))}
    </div>
);

const DotsIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
    </svg>
);
const EditIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

export default BookingPanel;
