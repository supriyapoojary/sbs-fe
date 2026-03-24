import { createSlice } from "@reduxjs/toolkit";

// Boot-time check — read token from localStorage into Redux initial state
// This is the single source of truth for auth state
const storedToken = localStorage.getItem("spa_token");
const storedUser = (() => {
    try {
        return JSON.parse(localStorage.getItem("spa_user"));
    } catch {
        return null;
    }
})();

const authSlice = createSlice({
    name: "auth",
    initialState: {
        isAuthenticated: !!storedToken,
        token: storedToken || null,
        user: storedUser || null,
    },
    reducers: {
        loginSuccess: (state, action) => {
            state.isAuthenticated = true;
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        logoutSuccess: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            // Clear localStorage on logout
            localStorage.removeItem("spa_token");
            localStorage.removeItem("spa_user");
        },
    },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (s) => s.auth.isAuthenticated;
export const selectCurrentUser = (s) => s.auth.user;
export const selectToken = (s) => s.auth.token;

export default authSlice.reducer;
