import React from "react";
import FilterBar from "../components/features/booking/filterBar/FilterBar";
import CalendarView from "../components/features/calendar/calendarView/calendarView";
import CalendarDndContext from "../components/features/calendar/calendarDnd/CalendarDndContext";

// Booking page content only — Header comes from ProtectedLayout
const BookingLayout = () => (
    <>
        <FilterBar />
        <CalendarDndContext>
            <CalendarView />
        </CalendarDndContext>
    </>
);

export default BookingLayout;
