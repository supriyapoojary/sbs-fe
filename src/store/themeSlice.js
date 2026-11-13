import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "spa_theme";

const savedTheme = localStorage.getItem(STORAGE_KEY) || "light";
// Apply immediately on load so no flash of wrong theme
document.documentElement.setAttribute("data-theme", savedTheme);

const themeSlice = createSlice({
    name: "theme",
    initialState: { mode: savedTheme },
    reducers: {
        toggleTheme: (state) => {
            state.mode = state.mode === "light" ? "dark" : "light";
            document.documentElement.setAttribute("data-theme", state.mode);
            localStorage.setItem(STORAGE_KEY, state.mode);
        },
        setTheme: (state, action) => {
            state.mode = action.payload;
            document.documentElement.setAttribute("data-theme", state.mode);
            localStorage.setItem(STORAGE_KEY, state.mode);
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectThemeMode = (s) => s.theme.mode;
export default themeSlice.reducer;
