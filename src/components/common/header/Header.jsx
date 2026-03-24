import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, NavLink } from "react-router-dom";
import { toggleTheme, selectThemeMode } from "../../../store/themeSlice";
import { selectCurrentUser, logoutSuccess } from "../../../store/authSlice";
import AuthService from "../../../services/auth.service";
import logo from "../../../assets/images/logo.PNG";
import "./Header.scss";

const NAV_LINKS = [
    { label: "Home", path: "/booking" },
    { label: "Therapists", path: "/therapists" },
    { label: "Sales", path: "/sales" },
    { label: "Clients", path: "/clients" },
    { label: "Transactions", path: "/transactions" },
    { label: "Reports", path: "/reports" },
];

const Header = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const theme = useSelector(selectThemeMode);
    const user = useSelector(selectCurrentUser);

    const [menuOpen, setMenuOpen] = useState(false);
    const [userOpen, setUserOpen] = useState(false);

    const initials =
        user?.name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "U";

    const handleLogout = useCallback(() => {
        AuthService.logout();
        dispatch(logoutSuccess());
        navigate("/login", { replace: true });
    }, [dispatch, navigate]);

    return (
        <header className="header">
            <NavLink to="/booking" className="header-brand">
                <img src={logo} alt="spa" />
            </NavLink>

            <nav className="header-nav">
                {NAV_LINKS.map(({ label, path }) => (
                    <NavLink key={path} to={path} className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="header-actions">
                <button className="btn-icon" title="Notifications">
                    <BellIcon />
                </button>

                <div className="user-menu">
                    <button className="user-menu-trigger" onClick={() => setUserOpen((v) => !v)} title={user?.name}>
                        <div className="avatar">{initials}</div>
                    </button>

                    {userOpen && (
                        <div className="user-dropdown">
                            <div className="user-info">
                                <strong>{user?.name || "User"}</strong>
                                <span>{user?.role || "Staff"}</span>
                            </div>
                            <hr />
                            <button
                                onClick={() => {
                                    dispatch(toggleTheme());
                                    setUserOpen(false);
                                }}
                            >
                                {theme === "light" ? <MoonIcon /> : <SunIcon />}
                                {theme === "light" ? "Dark mode" : "Light mode"}
                            </button>
                            <button
                                onClick={() => {
                                    navigate("/admin");
                                    setUserOpen(false);
                                }}
                            >
                                <AdminIcon /> Admin
                            </button>
                            <hr />
                            <button className="danger" onClick={handleLogout}>
                                <LogoutIcon /> Sign out
                            </button>
                        </div>
                    )}
                </div>

                <button className="btn-icon hamburger" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
                    <HamburgerIcon />
                </button>
            </div>

            {menuOpen && (
                <>
                    <div className="mobile-nav">
                        {NAV_LINKS.map(({ label, path }) => (
                            <NavLink key={path} to={path} className={({ isActive }) => (isActive ? "active" : "")} onClick={() => setMenuOpen(false)}>
                                {label}
                            </NavLink>
                        ))}
                    </div>
                    <div className="overlay" onClick={() => setMenuOpen(false)} />
                </>
            )}

            {userOpen && <div className="overlay transparent" onClick={() => setUserOpen(false)} />}
        </header>
    );
};

const BellIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
);
const MoonIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
    </svg>
);
const SunIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);
const AdminIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 10-16 0" />
    </svg>
);
const LogoutIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const HamburgerIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

export default Header;
