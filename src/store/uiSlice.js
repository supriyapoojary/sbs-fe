import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

const initialState = {
    // Panel
    isPanelOpen: false,
    panelMode: "view", // 'view' | 'create' | 'edit'
    selectedBookingId: null,

    // Calendar
    activeDate: dayjs().format("YYYY-MM-DD"),
    activeOutletId: 1,
    displayInterval: 15, // minutes per slot: 15 | 30 | 60

    // New booking prefill (when clicking empty slot)
    newBookingPrefill: null, // { therapist_id, start_time, date }

    // Search
    searchQuery: "",

    // Filter panel
    isFilterOpen: false,
    filters: {
        status: [],
        therapist_ids: [],
    },
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        // Panel
        openPanel: (state, action) => {
            state.isPanelOpen = true;
            state.panelMode = action.payload.mode || "view";
            state.selectedBookingId = action.payload.bookingId || null;
            state.newBookingPrefill = action.payload.prefill || null;
        },
        closePanel: (state) => {
            state.isPanelOpen = false;
            state.selectedBookingId = null;
            state.newBookingPrefill = null;
        },
        setPanelMode: (state, action) => {
            state.panelMode = action.payload;
        },

        // Calendar navigation
        setActiveDate: (state, action) => {
            state.activeDate = action.payload;
        },
        goToToday: (state) => {
            state.activeDate = dayjs().format("YYYY-MM-DD");
        },
        goToPrevDay: (state) => {
            state.activeDate = dayjs(state.activeDate).subtract(1, "day").format("YYYY-MM-DD");
        },
        goToNextDay: (state) => {
            state.activeDate = dayjs(state.activeDate).add(1, "day").format("YYYY-MM-DD");
        },

        // Outlet
        setActiveOutlet: (state, action) => {
            state.activeOutletId = action.payload;
        },

        // Display
        setDisplayInterval: (state, action) => {
            state.displayInterval = action.payload;
        },

        // Search
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },

        // Filters
        toggleFilterPanel: (state) => {
            state.isFilterOpen = !state.isFilterOpen;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
    },
});

export const {
    openPanel,
    closePanel,
    setPanelMode,
    setActiveDate,
    goToToday,
    goToPrevDay,
    goToNextDay,
    setActiveOutlet,
    setDisplayInterval,
    setSearchQuery,
    toggleFilterPanel,
    setFilters,
    clearFilters,
} = uiSlice.actions;

// ─── Selectors ─────────────────────────────────────────────────────
export const selectUI = (s) => s.ui;
export const selectIsPanelOpen = (s) => s.ui.isPanelOpen;
export const selectPanelMode = (s) => s.ui.panelMode;
export const selectSelectedId = (s) => s.ui.selectedBookingId;
export const selectActiveDate = (s) => s.ui.activeDate;
export const selectActiveOutlet = (s) => s.ui.activeOutletId;
export const selectDisplayInterval = (s) => s.ui.displayInterval;
export const selectSearchQuery = (s) => s.ui.searchQuery;
export const selectFilters = (s) => s.ui.filters;
export const selectPrefill = (s) => s.ui.newBookingPrefill;

export default uiSlice.reducer;
