// ─── Logger ───────────────────────────────────────────────────────
// Structured console logging for API errors, UI exceptions, user actions.
// In production swap console.* with your logging service (Sentry, Datadog, etc.)

const isDev = process.env.NODE_ENV === "development";

const format = (level, category, message, data) => ({
    level,
    category,
    message,
    data,
    timestamp: new Date().toISOString(),
});

export const logger = {
    // User actions — booking created, edited, cancelled
    action: (message, data = {}) => {
        const log = format("ACTION", "USER", message, data);
        if (isDev) console.log(`%c[ACTION] ${message}`, "color:#3b82f6;font-weight:600", data);
        return log;
    },

    // API errors
    apiError: (message, error = {}) => {
        const log = format("ERROR", "API", message, error);
        console.error(`%c[API ERROR] ${message}`, "color:#ef4444;font-weight:600", error);
        return log;
    },

    // UI / component exceptions
    uiError: (message, error = {}) => {
        const log = format("ERROR", "UI", message, error);
        console.error(`%c[UI ERROR] ${message}`, "color:#f59e0b;font-weight:600", error);
        return log;
    },

    // Info / debug
    info: (message, data = {}) => {
        if (!isDev) return;
        console.info(`%c[INFO] ${message}`, "color:#22c55e", data);
    },
};

export default logger;
