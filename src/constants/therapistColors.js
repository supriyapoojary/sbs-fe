// ── Gender colors — for T icon and therapist name text ────────────────
export const GENDER_COLORS = {
    female: "#EC4899",
    male: "#3B82F6",
};

export const getTherapistColor = (gender) => GENDER_COLORS[gender?.toLowerCase()] || GENDER_COLORS.female;

export const GENDER_BG = {
    female: "#fce7f3",
    male: "#dbeafe",
};

export const getTherapistBg = (gender) => GENDER_BG[gender?.toLowerCase()] || GENDER_BG.female;

// ── Per-client booking block colors ──────────────────────────────────
// Each client gets a unique soft pastel color based on their ID.
// Same client = same color across all their bookings. Matches Figma.
// In-progress bookings always use amber regardless of client.

const CLIENT_PALETTE = [
    { bg: "#dbeafe", border: "#3b82f6" }, // blue      — e.g. Victoria Baker
    { bg: "#fce7f3", border: "#ec4899" }, // pink      — e.g. Yashika Yeo
    { bg: "#dcfce7", border: "#22c55e" }, // green
    { bg: "#ede9fe", border: "#8b5cf6" }, // purple    — e.g. Gerald Tan
    { bg: "#ffedd5", border: "#f97316" }, // orange
    { bg: "#cffafe", border: "#06b6d4" }, // cyan      — e.g. Ethan Tan
    { bg: "#fdf4ff", border: "#d946ef" }, // fuchsia
    { bg: "#f0fdf4", border: "#16a34a" }, // emerald
    { bg: "#fff7ed", border: "#ea580c" }, // deep orange
    { bg: "#f0f9ff", border: "#0284c7" }, // sky blue
];

// In-progress — always amber, distinct from all client colors
export const IN_PROGRESS_COLOR = { bg: "#fef3c7", border: "#f59e0b" };

// Returns consistent color for a client based on their ID
export const getClientBlockColor = (clientId) => {
    const idx = ((clientId || 0) - 1) % CLIENT_PALETTE.length;
    return CLIENT_PALETTE[Math.abs(idx)];
};
