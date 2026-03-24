import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../store/authSlice";

// Guards routes that require authentication.
// Reads auth state from Redux — single source of truth.
// Unauthenticated → /login, preserving intended URL in state.from
// so Login can redirect back after successful sign-in.
const ProtectedRoute = ({ children }) => {
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
