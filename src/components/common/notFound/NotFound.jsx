import React from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "services/auth.service";
import "./NotFound.scss";

const NotFound = () => {
    const navigate = useNavigate();
    const isAuthenticated = AuthService.isAuthenticated();

    return (
        <div className="not-found">
            <div className="card">
                <div className="code">404</div>
                <h1>Page not found</h1>
                <p>
                    {isAuthenticated
                        ? "The page you're looking for doesn't exist or has been moved."
                        : "You need to be logged in to access this page, or this URL doesn't exist."}
                </p>

                {isAuthenticated ? (
                    <button className="btn btn-primary btn-lg" onClick={() => navigate("/booking")}>
                        ← Back to Booking
                    </button>
                ) : (
                    <div className="actions">
                        <p className="auth-hint">Log in to access the booking system.</p>
                        <button className="btn btn-primary btn-lg" onClick={() => navigate("/login")}>
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotFound;
