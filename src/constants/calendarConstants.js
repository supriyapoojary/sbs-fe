export const CALENDAR_START_HOUR = 9;
export const CALENDAR_END_HOUR = 24;
export const SLOT_HEIGHT_PX = 18;
export const HOUR_HEIGHT_PX = SLOT_HEIGHT_PX * 4;
export const THERAPIST_COL_WIDTH = 160;
export const TIME_COL_WIDTH = 80;
export const TOTAL_SLOTS = (CALENDAR_END_HOUR - CALENDAR_START_HOUR) * 4;

export const generateTimeSlots = () => {
    const slots = [];
    for (let h = CALENDAR_START_HOUR; h < CALENDAR_END_HOUR; h++) {
        for (let m = 0; m < 60; m += 15) {
            slots.push({
                hour: h,
                minute: m,
                label: m === 0 ? `${String(h).padStart(2, "0")}:00` : "",
                key: `${h}:${m}`,
            });
        }
    }
    return slots;
};

export const TIME_SLOTS = generateTimeSlots();

export const timeToSlotIndex = (timeStr) => {
    const [h, m] = timeStr.split(":").map(Number);
    return (h - CALENDAR_START_HOUR) * 4 + Math.floor(m / 15);
};

export const slotIndexToTime = (index) => {
    const totalMinutes = CALENDAR_START_HOUR * 60 + index * 15;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export const durationToHeight = (minutes) => (minutes / 15) * SLOT_HEIGHT_PX;

// ── Booking block colors — updated to match new CSS variable names ──
// Variables defined in _light-theme.scss and _dark-theme.scss
export const STATUS_COLORS = {
    confirmed: { bg: "var(--block-blue)", border: "var(--block-blue-bd)" },
    in_progress: { bg: "var(--block-amber)", border: "var(--block-amber-bd)" },
    completed: { bg: "var(--block-green)", border: "var(--block-green-bd)" },
    cancelled: { bg: "var(--block-yellow)", border: "var(--block-yellow-bd)" },
};

export const getStatusColor = (status) => STATUS_COLORS[status] || STATUS_COLORS.confirmed;
