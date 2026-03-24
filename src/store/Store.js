import { configureStore } from "@reduxjs/toolkit";
import { bookingApi } from "./bookingApi";
import uiReducer from "./uiSlice";
import themeReducer from "./themeSlice";
import authReducer from "./authSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        theme: themeReducer,
        [bookingApi.reducerPath]: bookingApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(bookingApi.middleware),
});

export default store;
