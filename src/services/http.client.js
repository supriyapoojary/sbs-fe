import axios from "axios";

const httpClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    timeout: 15000,
});

// Attach token automatically
httpClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("spa_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle response + errors
httpClient.interceptors.response.use(
    (res) => res.data,
    (err) => {
        const status = err.response?.status;
        const message = err.response?.data?.message || err.message || "Something went wrong";

        if (status === 401) {
            localStorage.clear();
            window.location.href = "/login";
        }

        return Promise.reject({ status, message });
    }
);

export default httpClient;
