import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";
import Header from "../components/common/header/Header";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import FilterBar from "../components/features/booking/filterBar/FilterBar";
import CalendarView from "../components/features/calendar/calendarView/calendarView";

const Login = lazy(() => import("../components/common/login/Login"));
const NotFound = lazy(() => import("../components/common/notFound/NotFound"));
const Admin = lazy(() => import("../components/features/admin/Admin"));
const BookingPanel = lazy(() => import("../components/features/booking/bookingPanel/BookingPanel"));

const PageLoader = () => (
    <div
        style={{
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-muted)",
            gap: 12,
            color: "var(--text-muted)",
            fontSize: 13,
        }}
    >
        <div className="spinner" />
        Loading…
    </div>
);

const RootRedirect = () => {
    const auth = useSelector(selectIsAuthenticated);
    return <Navigate to={auth ? "/booking" : "/login"} replace />;
};

// Protected shell — renders Header once, shared across all protected routes
const ProtectedShell = () => {
    const auth = useSelector(selectIsAuthenticated);
    if (!auth) return <Navigate to="/login" replace />;
    return (
        <div className="app-shell">
            <ErrorBoundary>
                <Header />
            </ErrorBoundary>
            <main className="app-main">
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </main>
            <Suspense fallback={null}>
                <BookingPanel />
            </Suspense>
        </div>
    );
};

// Booking page — FilterBar + Calendar (DnD context lives inside CalendarView)
const BookingLayout = () => (
    <>
        <FilterBar />
        <CalendarView />
    </>
);

const AppRoutes = () => (
    <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
            <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/404" element={<NotFound />} />
                <Route element={<ProtectedShell />}>
                    <Route path="/booking" element={<BookingLayout />} />
                    <Route path="/admin" element={<Admin />} />
                </Route>
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Suspense>

        <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 3500,
                style: { background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", fontSize: "13px" },
                success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
        />
    </BrowserRouter>
);

export default AppRoutes;
