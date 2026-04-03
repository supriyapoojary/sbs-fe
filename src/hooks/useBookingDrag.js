import { useState, useCallback, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useUpdateBookingMutation, bookingApi } from "store/bookingApi";
import { selectActiveDate, selectActiveOutlet } from "store/uiSlice";
import { SLOT_HEIGHT_PX, THERAPIST_COL_WIDTH, TIME_COL_WIDTH, slotIndexToTime } from "constants/calendarConstants";
import dayjs from "dayjs";
import logger from "../utils/logger";
import toast from "react-hot-toast";

const useBookingDrag = ({ therapists, gridRef, timeColWidth = TIME_COL_WIDTH }) => {
    const dispatch = useDispatch();
    const activeDate = useSelector(selectActiveDate);
    const outletId = useSelector(selectActiveOutlet);
    const [reschedule] = useUpdateBookingMutation();

    const [activeBooking, setActiveBooking] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const rafRef = useRef(null);

    const getCoordsFromPointer = useCallback(
        (clientX, clientY) => {
            if (!gridRef?.current) return null;
            const rect = gridRef.current.getBoundingClientRect();
            const scrollLeft = gridRef.current.scrollLeft;
            const scrollTop = gridRef.current.scrollTop;
            const localX = clientX - rect.left + scrollLeft - timeColWidth;
            const localY = clientY - rect.top + scrollTop;
            if (localX < 0 || localY < 0) return null;
            const colIndex = Math.floor(localX / THERAPIST_COL_WIDTH);
            const slotIndex = Math.max(0, Math.floor(localY / SLOT_HEIGHT_PX));
            if (colIndex < 0 || colIndex >= therapists.length) return null;
            return { colIndex, slotIndex, therapistId: therapists[colIndex]?.id };
        },
        [gridRef, timeColWidth, therapists]
    );

    useEffect(() => {
        if (!activeBooking) {
            setDropTarget(null);
            return;
        }

        const handleMove = (e) => {
            const clientX = e.touches?.[0]?.clientX ?? e.clientX;
            const clientY = e.touches?.[0]?.clientY ?? e.clientY;
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            rafRef.current = requestAnimationFrame(() => {
                const coords = getCoordsFromPointer(clientX, clientY);
                if (!coords) {
                    setDropTarget(null);
                    return;
                }
                setDropTarget({ therapistId: coords.therapistId, slotIndex: coords.slotIndex });
            });
        };

        window.addEventListener("pointermove", handleMove, { passive: true });
        window.addEventListener("touchmove", handleMove, { passive: true });
        return () => {
            window.removeEventListener("pointermove", handleMove);
            window.removeEventListener("touchmove", handleMove);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [activeBooking, getCoordsFromPointer]);

    const onDragStart = useCallback((booking) => {
        setActiveBooking(booking ?? null);
    }, []);

    const onDragEnd = useCallback(
        async (event) => {
            const booking = activeBooking;
            const target = dropTarget;
            setActiveBooking(null);
            setDropTarget(null);
            if (!booking || !target) return;

            const newTherapist = therapists.find((t) => t.id === target.therapistId);
            const newTime = slotIndexToTime(target.slotIndex);
            if (!newTherapist || !newTime) return;

            if (booking.therapist_id === newTherapist.id && booking.start_time?.slice(0, 5) === newTime) return;

            const apiDate = dayjs(activeDate).format("DD-MM-YYYY");
            const dropDateTime = dayjs(`${activeDate} ${newTime}`, "YYYY-MM-DD HH:mm");
            if (dropDateTime.isBefore(dayjs())) {
                toast.error("Cannot move booking to a past time.");
                return;
            }

            const duration = booking.duration || 60;
            const [h, m] = newTime.split(":");
            const endTime = dayjs().hour(Number(h)).minute(Number(m)).add(duration, "minute").format("HH:mm");

            const queryArgs = {
                daterange: `${apiDate} / ${apiDate}`,
                outlet: outletId,
                panel: "outlet",
                view_type: "calendar",
                pagination: 0,
            };

            const patchResult = dispatch(
                bookingApi.util.updateQueryData("getBookings", queryArgs, (draft) => {
                    const b = draft.find((x) => x.id === booking.id);
                    if (b) {
                        b.therapist_id = newTherapist.id;
                        b.start_time = `${newTime}:00`;
                    }
                })
            );

            try {
                const rawItem = booking._raw?.booking_item ? Object.values(booking._raw.booking_item)[0]?.[0] : null;

                const items = JSON.stringify([
                    {
                        id: booking.booking_item_id,
                        service: booking.service_id,
                        customer_name: booking.customer_name,
                        start_time: newTime,
                        end_time: endTime,
                        duration,
                        therapist: newTherapist.id,
                        requested_person: booking.requested_person || 0,
                        requested_room: 0,
                        price: String(rawItem?.price || "0.00"),
                        quantity: "1",
                        primary: 1,
                        item_number: 1,
                        start_date: apiDate,
                        end_date: apiDate,
                    },
                ]);

                const fd = new FormData();
                fd.append("company", "1");
                fd.append("outlet", outletId);
                fd.append("outlet_type", "2");
                fd.append("booking_type", "1");
                fd.append("customer", booking.user_id);
                fd.append("items", items);
                fd.append("currency", "SGD");
                fd.append("source", booking.source || "Walk-in");
                fd.append("payment_type", "payatstore");
                fd.append("service_at", `${apiDate} ${newTime}`);
                fd.append("panel", "outlet");
                fd.append("membership", "0");
                fd.append("updated_by", String(booking._raw?.updated_by || booking._raw?.created_by || ""));

                await reschedule({ id: booking.id, data: fd }).unwrap();
                toast.success(`Moved to ${newTherapist.name} at ${newTime}`);
                logger.action("Booking rescheduled", { bookingId: booking.id, therapist: newTherapist.name, time: newTime });
            } catch (err) {
                patchResult.undo();
                toast.error("Could not reschedule. Booking moved back.");
                logger.apiError("Reschedule failed", err);
            }
        },
        [activeBooking, dropTarget, therapists, reschedule, activeDate, outletId, dispatch]
    );

    return { activeBooking, dropTarget, onDragStart, onDragEnd };
};

export default useBookingDrag;
