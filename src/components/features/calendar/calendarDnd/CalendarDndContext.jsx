import React, { memo } from "react";
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

// Memoized — never re-renders during drag
const DragGhost = memo(({ booking, service, client }) => (
    <div
        style={{
            width: 155,
            padding: "5px 8px",
            background: "var(--bg-primary)",
            border: "1px solid var(--border-color)",
            borderLeft: "3px solid var(--booking-blue-border)",
            borderRadius: 6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            pointerEvents: "none",
            fontSize: 11,
            color: "var(--text-primary)",
            transform: "rotate(1.5deg)",
            userSelect: "none",
        }}
    >
        <div
            style={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}
        >
            {service?.name || "Booking"}
        </div>
        <div style={{ color: "var(--text-secondary)", fontSize: 10, marginTop: 2 }}>
            {client?.name} · {booking?.start_time}
        </div>
    </div>
));
DragGhost.displayName = "DragGhost";

const CalendarDndContext = ({ children, activeBooking, activeService, activeClient, onDragStart, onDragEnd }) => {
    const sensors = useSensors(
        // Mouse — 8px threshold prevents mis-fires on click
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        // Touch — delay prevents conflict with scroll
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } })
    );

    return (
        <DndContext
            sensors={sensors}
            // No collision detection — drop target computed from coords in useBookingDrag
            collisionDetection={() => []}
            modifiers={[restrictToWindowEdges]}
            onDragStart={(e) => {
                // e.active.data.current.booking is set in bookingBlock via data prop
                onDragStart(e.active.data.current?.booking);
            }}
            onDragEnd={onDragEnd}
        >
            {children}

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
                {activeBooking ? <DragGhost booking={activeBooking} service={activeService} client={activeClient} /> : null}
            </DragOverlay>
        </DndContext>
    );
};

export default CalendarDndContext;
