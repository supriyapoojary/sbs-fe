// services/auth.service.js
// NOTE: Hardcoded credentials for local/dev use — replace with real API when backend is ready

const HARDCODED_CREDENTIALS = {
    email: "admin@spa.com",
    password: "spa123",
};

const MOCK_USER = {
    id: 1,
    name: "Admin User",
    email: "admin@spa.com",
    role: "admin",
};

const MOCK_TOKEN = "mock-spa-token-hardcoded-2024";

const AuthService = {
    async login({ email, password }) {
        // Simulates a small network delay so the loading spinner shows
        await new Promise((res) => setTimeout(res, 500));

        if (email === HARDCODED_CREDENTIALS.email && password === HARDCODED_CREDENTIALS.password) {
            localStorage.setItem("spa_token", MOCK_TOKEN);
            localStorage.setItem("spa_user", JSON.stringify(MOCK_USER));
            return { token: MOCK_TOKEN, user: MOCK_USER };
        }

        throw new Error("Credentials didn't match.");
    },

    logout() {
        localStorage.clear();
    },

    isAuthenticated() {
        return !!localStorage.getItem("spa_token");
    },
};

export default AuthService;

//Actual API integration - Uncomment and replace HARDCODED_CREDENTIALS with real API calls when backend is ready

// import httpClient from "./http.client";
// import { API } from "../config/api.config";

// const AuthService = {
//     async login({ email, password }) {
//         try {
//             const formData = new FormData();
//             formData.append("email", email);
//             formData.append("password", password);
//             formData.append("key_pass", "07ba959153fe7eec778361bf42079439");

//             const res = await httpClient.post(API.LOGIN, formData);

//             // correct response parsing
//             const token = res?.data?.data?.token?.token;
//             const user = res?.data?.data?.user;

//             if (!token || !user) {
//                 throw new Error("Invalid login response");
//             }

//             localStorage.setItem("spa_token", token);
//             localStorage.setItem("spa_user", JSON.stringify(user));

//             return { token, user };
//         } catch (err) {
//             throw new Error(err.message || "Login failed");
//         }
//     },

//     logout() {
//         localStorage.clear();
//     },

//     isAuthenticated() {
//         return !!localStorage.getItem("spa_token");
//     },
// };

// export default AuthService;
