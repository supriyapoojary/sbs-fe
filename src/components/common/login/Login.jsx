import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "store/authSlice";
import AuthService from "services/auth.service";
import logger from "utils/logger";
import logo from "assets/images/flower.png";
import "./Login.scss";

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const from = location.state?.from?.pathname || "/booking";

    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // prevents page refresh
        if (!form.email || !form.password) {
            setError("Email and password are required.");
            return;
        }

        setLoading(true);
        try {
            const res = await AuthService.login(form);
            dispatch(loginSuccess({ token: res.token, user: res.user }));
            logger.action("User logged in", { email: form.email });
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || "Invalid email or password. Please try again.");
            logger.apiError("Login failed", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="brand">
                    <img src={logo} alt="SPA Booking" />
                    <span>Spa Booking</span>
                </div>

                <h1>Welcome back</h1>
                <p className="subtitle">Sign in to manage your bookings</p>

                <form className="login-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label className="label" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className={`input${error ? " error" : ""}`}
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className={`input${error ? " error" : ""}`}
                            placeholder="••••••••"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                        />
                    </div>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? (
                            <>
                                <span className="spinner" /> Signing in…
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
