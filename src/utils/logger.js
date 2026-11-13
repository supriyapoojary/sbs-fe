const isDev = process.env.NODE_ENV === "development";

const logger = {
    action: (message, data = {}) => {
        if (isDev) console.log(`%c[ACTION] ${message}`, "color:#3b82f6;font-weight:600", data);
    },
    apiError: (message, error = {}) => {
        console.error(`%c[API ERROR] ${message}`, "color:#ef4444;font-weight:600", error);
    },
    uiError: (message, error = {}) => {
        console.error(`%c[UI ERROR] ${message}`, "color:#f59e0b;font-weight:600", error);
    },
    info: (message, data = {}) => {
        if (isDev) console.info(`%c[INFO] ${message}`, "color:#22c55e", data);
    },
};

export default logger;
