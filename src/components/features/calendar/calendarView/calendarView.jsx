import React, { useRef, useMemo, useCallback, useState, useEffect, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useVirtualizer } from "@tanstack/react-virtual";
import dayjs from "dayjs";
import { useGetBookingsQuery, useGetTherapistsQuery } from "../../../../store/bookingApi";
import { selectActiveDate, selectActiveOutlet, selectSearchQuery, selectDisplayInterval, selectFilters, openPanel } from "../../../../store/uiSlice";
import {
    TIME_SLOTS,
    SLOT_HEIGHT_PX,
    THERAPIST_COL_WIDTH,
    TIME_COL_WIDTH,
    TOTAL_SLOTS,
    HOUR_HEIGHT_PX,
    timeToSlotIndex,
} from "../../../../constants/calendarConstants";
import { getTherapistColor, getTherapistBg } from "../../../../constants/therapistColors";
import BookingBlock from "../bookingBlock/bookingBlock";
import CalendarDndContext from "../calendarDnd/CalendarDndContext";
import useBookingDrag from "../../../../hooks/useBookingDrag";
import "./calendarView.scss";

const isMobile = () => window.innerWidth <= 767;

// Therapist column — memoized, only re-renders when its bookings change
const TherapistColumn = memo(
    ({ therapist, colBookings, left, width, totalHeight, onSlotClick, isSource, sourceSlotIndex, dropSlotIndex, dropDuration, interval }) => {
        const step = interval / 15; // slots to skip: 1 for 15min, 2 for 30min, 4 for 60min
        return (
            <div className="therapist-column" style={{ position: "absolute", left, width, height: totalHeight }}>
                {TIME_SLOTS.filter((_, i) => i % step === 0).map((slot) => {
                    const realIdx = TIME_SLOTS.indexOf(slot);
                    return (
                        <div
                            key={slot.key}
                            className={[
                                "time-slot",
                                isSource && sourceSlotIndex === realIdx ? "time-slot--source" : "",
                                dropSlotIndex != null && dropSlotIndex === realIdx ? "time-slot--drop" : "",
                            ].join(" ")}
                            style={{ height: SLOT_HEIGHT_PX * step }}
                            onClick={() => onSlotClick(therapist.id, slot.key)}
                        />
                    );
                })}
                {dropSlotIndex != null && (
                    <div
                        className="drop-preview"
                        style={{
                            top: dropSlotIndex * SLOT_HEIGHT_PX,
                            height: Math.max((dropDuration / 15) * SLOT_HEIGHT_PX, SLOT_HEIGHT_PX * 4),
                        }}
                    />
                )}
                {colBookings.map((booking) => (
                    <BookingBlock key={booking.id} booking={booking} therapist={therapist} />
                ))}
            </div>
        );
    }
);
TherapistColumn.displayName = "TherapistColumn";

const CalendarView = () => {
    const dispatch = useDispatch();
    const activeDate = useSelector(selectActiveDate);
    const outletId = useSelector(selectActiveOutlet);
    const searchQuery = useSelector(selectSearchQuery);
    const interval = useSelector(selectDisplayInterval);
    const filters = useSelector(selectFilters); // FIX 1: read filters

    const bodyRef = useRef(null);
    const headerRef = useRef(null);
    const [mobile, setMobile] = useState(isMobile());
    const [mobileColIndex, setMobileColIndex] = useState(0);

    useEffect(() => {
        const fn = () => setMobile(isMobile());
        window.addEventListener("resize", fn);
        return () => window.removeEventListener("resize", fn);
    }, []);

    const apiDate = dayjs(activeDate).format("DD-MM-YYYY");

    const { data: therapistsRaw = [], isLoading: tLoading } = useGetTherapistsQuery({
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

    const { data: bookingsRaw = [], isLoading: bLoading } = useGetBookingsQuery({
        daterange: `${apiDate} / ${apiDate}`,
        outlet: outletId,
        panel: "outlet",
        view_type: "calendar",
        pagination: 1,
    });

    const therapists = Array.isArray(therapistsRaw) ? therapistsRaw : [];
    const bookings = Array.isArray(bookingsRaw) ? bookingsRaw : [];

    // FIX 2: correct flattened field names for search
    const filtered = useMemo(() => {
        if (!searchQuery) return bookings;
        const q = searchQuery.toLowerCase();
        return bookings.filter(
            (b) => b?.customer_name?.toLowerCase().includes(q) || b?.mobile_number?.includes(q) || b?.service_name?.toLowerCase().includes(q)
        );
    }, [bookings, searchQuery]);

    const byTherapist = useMemo(() => {
        const map = {};
        filtered.forEach((b) => {
            if (!b?.therapist_id) return;
            (map[b.therapist_id] ??= []).push(b);
        });
        return map;
    }, [filtered]);

    // FIX 3: apply gender group filter from FilterPanel
    const filteredTherapists = useMemo(() => {
        if (!filters.group || filters.group === "all") return therapists;
        return therapists.filter((t) => t.gender === filters.group);
    }, [therapists, filters.group]);

    const cols = useMemo(
        () => (mobile ? [filteredTherapists[mobileColIndex]].filter(Boolean) : filteredTherapists),
        [mobile, filteredTherapists, mobileColIndex]
    );
    const timeColWidth = mobile ? 52 : TIME_COL_WIDTH;
    const colWidth = mobile ? window.innerWidth - timeColWidth : THERAPIST_COL_WIDTH;

    const virtualizer = useVirtualizer({
        count: cols.length,
        getScrollElement: () => bodyRef.current,
        estimateSize: () => colWidth,
        horizontal: true,
        overscan: 2,
    });

    const { activeBooking, dropTarget, onDragStart, onDragEnd } = useBookingDrag({
        therapists: cols,
        gridRef: bodyRef,
        timeColWidth,
    });

    const handleSlotClick = useCallback(
        (therapistId, slotTime) => {
            const [h, m] = slotTime.split(":");
            const padded = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
            dispatch(openPanel({ mode: "create", prefill: { therapist_id: therapistId, start_time: padded, date: activeDate } }));
        },
        [dispatch, activeDate]
    );

    const totalHeight = TOTAL_SLOTS * SLOT_HEIGHT_PX;

    if (bLoading || tLoading)
        return (
            <div className="calendar-loading">
                <div className="spinner" />
                <span>Loading schedule…</span>
            </div>
        );

    return (
        <CalendarDndContext
            activeBooking={activeBooking}
            activeService={activeBooking?.service_name} // FIX 4: correct field names
            activeClient={activeBooking?.customer_name}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        >
            <div className="calendar-view">
                {/* Mobile nav */}
                {mobile && therapists.length > 0 && (
                    <div className="mobile-therapist-nav">
                        <button onClick={() => setMobileColIndex((i) => Math.max(0, i - 1))} disabled={mobileColIndex === 0}>
                            ‹
                        </button>
                        <span>
                            {therapists[mobileColIndex]?.name} ({mobileColIndex + 1}/{therapists.length})
                        </span>
                        <button
                            onClick={() => setMobileColIndex((i) => Math.min(therapists.length - 1, i + 1))}
                            disabled={mobileColIndex === therapists.length - 1}
                        >
                            ›
                        </button>
                    </div>
                )}

                {/* Therapist header */}
                <div className="calendar-header">
                    <div className="calendar-header__time-spacer" style={{ width: timeColWidth }}>
                        <span className="time-col-header">Time</span>
                    </div>
                    <div ref={headerRef} className="calendar-header__therapists" style={{ overflow: "hidden" }}>
                        <div style={{ width: virtualizer.getTotalSize(), position: "relative", height: "100%" }}>
                            {virtualizer.getVirtualItems().map((vCol) => {
                                const t = cols[vCol.index];
                                if (!t) return null;
                                return (
                                    <div
                                        key={t.id}
                                        className="therapist-header-cell"
                                        style={{ position: "absolute", left: vCol.start, width: vCol.size }}
                                    >
                                        <div
                                            className="therapist-avatar"
                                            style={{ background: getTherapistBg(t.gender), color: getTherapistColor(t.gender) }}
                                        >
                                            {cols.indexOf(t) + 1} {/* FIX 4: use cols not therapists */}
                                        </div>
                                        <div className="therapist-info">
                                            <span className="therapist-name">{t.name}</span>
                                            <span className="therapist-gender" style={{ color: getTherapistColor(t.gender) }}>
                                                {t.gender}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Calendar body */}
                <div
                    className="calendar-body"
                    ref={bodyRef}
                    onScroll={(e) => {
                        if (headerRef.current) headerRef.current.scrollLeft = e.currentTarget.scrollLeft;
                    }}
                >
                    {/* Time column */}
                    <div className="time-column" style={{ width: timeColWidth, height: totalHeight }}>
                        {TIME_SLOTS.filter((s) => s.minute === 0).map((slot) => {
                            const ampm = slot.hour < 12 ? "AM" : "PM";
                            return (
                                <div key={slot.key} className="time-label" style={{ height: HOUR_HEIGHT_PX }}>
                                    <span>
                                        {`${String(slot.hour).padStart(2, "0")}:00`}
                                        <br />
                                        {ampm}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid */}
                    <div className="calendar-grid" style={{ width: virtualizer.getTotalSize(), height: totalHeight, position: "relative" }}>
                        {virtualizer.getVirtualItems().map((vCol) => {
                            const t = cols[vCol.index];
                            if (!t) return null;
                            const isSource = activeBooking?.therapist_id === t.id;
                            const isDropCol = dropTarget?.therapistId === t.id;
                            return (
                                <TherapistColumn
                                    key={t.id}
                                    therapist={t}
                                    colBookings={byTherapist[t.id] || []}
                                    left={vCol.start}
                                    width={vCol.size}
                                    totalHeight={totalHeight}
                                    onSlotClick={handleSlotClick}
                                    isSource={isSource}
                                    sourceSlotIndex={isSource ? timeToSlotIndex(activeBooking.start_time) : null}
                                    dropSlotIndex={isDropCol ? dropTarget.slotIndex : null}
                                    dropDuration={isDropCol ? activeBooking?.duration || 60 : 0}
                                    interval={interval}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </CalendarDndContext>
    );
};

export default CalendarView;
