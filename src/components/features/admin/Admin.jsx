import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../store/authSlice";
import "./Admin.scss";

const Admin = () => {
    const user = useSelector(selectCurrentUser);

    return (
        <div className="admin-page">
            <div className="admin-card">
                <h1>Admin Panel</h1>
                <p>
                    Welcome, <strong>{user?.name || "Admin"}</strong>. Admin content goes here
                </p>
                <Link to="/booking" style={{ fontSize: 13, color: "var(--brand)" }}>
                    ← Back to Booking Page
                </Link>
            </div>
        </div>
    );
};

export default Admin;
