import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";
import Header from "../components/common/header/Header";
import ErrorBoundary from "../components/ui/ErrorBoundary";

const Login = lazy(() => import("../components/common/login/Login"));
const NotFound = lazy(() => import("../components/common/notFound/NotFound"));
const BookingLayout = lazy(() => import("./BookingLayout"));
const Admin = lazy(() => import("../components/features/admin/Admin"));
const BookingPanel = lazy(() => import("../components/features/booking/bookingPanel/BookingPanel"));

// ── Loaders ──────────────────────────────────────────────────────────
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
        <div className="spinner" /> Loading…
    </div>
);

// ── Root redirect — auth-aware ────────────────────────────────────────
const RootRedirect = () => {
    const auth = useSelector(selectIsAuthenticated);
    return <Navigate to={auth ? "/booking" : "/login"} replace />;
};

// ── Protected layout — Header shared across all protected pages ───────
// Uses <Outlet /> — React Router fills this with the active child route
// No separate file needed — inline here keeps everything in one place
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

// ── Routes ────────────────────────────────────────────────────────────
const AppRoutes = () => (
    <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Root */}
                <Route path="/" element={<RootRedirect />} />

                {/* Public — no header */}
                <Route path="/login" element={<Login />} />
                <Route path="/404" element={<NotFound />} />

                {/* Protected — Header rendered once in ProtectedShell */}
                <Route element={<ProtectedShell />}>
                    <Route path="/booking" element={<BookingLayout />} />
                    <Route path="/admin" element={<Admin />} />
                    {/* Add future routes here — header comes free */}
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Suspense>

        <Toaster
            position="bottom-right"
            toastOptions={{
                duration: 3500,
                style: {
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    fontSize: "13px",
                },
                success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
                error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
        />
    </BrowserRouter>
);

export default AppRoutes;
