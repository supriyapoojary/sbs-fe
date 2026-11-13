import httpClient from "../services/http.client";

// RTK Query base — all API calls go through httpClient
// httpClient interceptors handle auth token + error normalization
const baseQuery = async ({ url, method = "GET", data, params }) => {
    try {
        const res = await httpClient({ url, method, data, params });
        return { data: res };
    } catch (err) {
        return { error: { status: err.status || 500, message: err.message || "Request failed" } };
    }
};

export default baseQuery;
