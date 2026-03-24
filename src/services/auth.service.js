import httpClient from "./http.client";
import { API } from "../config/api.config";

const AuthService = {
    async login({ email, password }) {
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);
            formData.append("key_pass", "07ba959153fe7eec778361bf42079439");

            const res = await httpClient.post(API.LOGIN, formData);

            // correct response parsing
            const token = res?.data?.data?.token?.token;
            const user = res?.data?.data?.user;

            if (!token || !user) {
                throw new Error("Invalid login response");
            }

            localStorage.setItem("spa_token", token);
            localStorage.setItem("spa_user", JSON.stringify(user));

            return { token, user };
        } catch (err) {
            throw new Error(err.message || "Login failed");
        }
    },

    logout() {
        localStorage.clear();
    },

    isAuthenticated() {
        return !!localStorage.getItem("spa_token");
    },
};

export default AuthService;
