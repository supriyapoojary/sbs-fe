import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import {
    selectActiveDate,
    selectActiveOutlet,
    selectDisplayInterval,
    setSearchQuery,
    setActiveOutlet,
    setDisplayInterval,
    goToPrevDay,
    goToNextDay,
    goToToday,
    setActiveDate,
} from "../../../../store/uiSlice";
import { useGetOutletsQuery } from "../../../../store/bookingApi";
import FilterPanel from "./FilterPanel";
import "./FilterBar.scss";

const FilterBar = () => {
    const dispatch = useDispatch();
    const date = useSelector(selectActiveDate);
    const outletId = useSelector(selectActiveOutlet);
    const interval = useSelector(selectDisplayInterval);

    const [outletOpen, setOutletOpen] = useState(false);
    const [intervalOpen, setIntervalOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);

    const searchTimer = useRef(null);
    const filterRef = useRef(null);
    const dateInputRef = useRef(null);

    // Fetch outlets for current month range
    const start_date = dayjs(date).startOf("month").format("DD-MM-YYYY");
    const end_date = dayjs(date).endOf("month").format("DD-MM-YYYY");
    const { data: outlets = [] } = useGetOutletsQuery({ outlet: outletId, start_date, end_date });
    const activeOutlet = outlets.find((o) => o.id === outletId);
    const displayDate = dayjs(date).format("ddd, MMM D");

    // Close filter panel on outside click
    useEffect(() => {
        if (!filterOpen) return;
        const handleClick = (e) => {
            if (filterRef.current && !filterRef.current.contains(e.target)) {
                setFilterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [filterOpen]);

    const handleSearch = useCallback(
        (e) => {
            clearTimeout(searchTimer.current);
            const val = e.target.value;
            searchTimer.current = setTimeout(() => dispatch(setSearchQuery(val)), 250);
        },
        [dispatch]
    );

    // Trigger date picker directly
    const openDatePicker = () => {
        if (dateInputRef.current) {
            try {
                dateInputRef.current.showPicker();
            } catch {
                dateInputRef.current.click();
            }
        }
    };

    return (
        <div className="filter-bar">
            {/* ── LEFT: outlet + interval ── */}
            <div className="filter-left">
                <Dropdown label={activeOutlet?.name || "Select Outlet"} open={outletOpen} onToggle={() => setOutletOpen((v) => !v)}>
                    {outlets.map((o) => (
                        <button
                            key={o.id}
                            className={o.id === outletId ? "active" : ""}
                            onClick={() => {
                                dispatch(setActiveOutlet(o.id));
                                setOutletOpen(false);
                            }}
                        >
                            {o.name}
                        </button>
                    ))}
                </Dropdown>

                <Dropdown label={`Display : ${interval} Min`} open={intervalOpen} onToggle={() => setIntervalOpen((v) => !v)} small>
                    {[15, 30, 60].map((i) => (
                        <button
                            key={i}
                            className={i === interval ? "active" : ""}
                            onClick={() => {
                                dispatch(setDisplayInterval(i));
                                setIntervalOpen(false);
                            }}
                        >
                            {i} Min
                        </button>
                    ))}
                </Dropdown>
            </div>

            {/* ── CENTER: search ── */}
            <div className="filter-center">
                <div className="fb-search">
                    <SearchIcon />
                    <input placeholder="Search Sales by phone/name" onChange={handleSearch} />
                </div>
            </div>

            {/* ── RIGHT: filter + date nav ── */}
            <div className="filter-right">
                {/* Filter — ref used for outside click detection */}
                <div className="filter-wrap" ref={filterRef}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setFilterOpen((v) => !v)}>
                        Filter <FilterIcon />
                    </button>
                    {filterOpen && <FilterPanel onClose={() => setFilterOpen(false)} />}
                </div>

                {/* Date navigation */}
                <div className="date-nav">
                    <button className="btn btn-ghost btn-sm " onClick={() => dispatch(goToToday())}>
                        Today
                    </button>
                    <button className="btn btn-icon" onClick={() => dispatch(goToPrevDay())}>
                        ‹
                    </button>

                    {/* Date label — click opens picker via ref */}
                    <span className="date-label" onClick={openDatePicker}>
                        {displayDate}
                    </span>

                    <button className="btn btn-icon" onClick={() => dispatch(goToNextDay())}>
                        ›
                    </button>

                    {/* Calendar icon — also opens picker */}
                    <button className="btn btn-icon" onClick={openDatePicker} title="Pick date">
                        <CalendarIcon />
                    </button>

                    {/* Hidden date input — positioned off-screen, triggered programmatically */}
                    <input
                        ref={dateInputRef}
                        type="date"
                        value={date}
                        onChange={(e) => dispatch(setActiveDate(e.target.value))}
                        className="date-input-hidden"
                    />
                </div>
            </div>

            {/* Close dropdowns on outside click */}
            {(outletOpen || intervalOpen) && (
                <div
                    style={{ position: "fixed", inset: 0, zIndex: 40 }}
                    onClick={() => {
                        setOutletOpen(false);
                        setIntervalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

const Dropdown = ({ label, open, onToggle, small, children }) => (
    <div className="fb-dropdown">
        <button className={`trigger${small ? " sm" : ""}`} onClick={onToggle}>
            {label} <ChevronIcon />
        </button>
        {open && <div className="menu">{children}</div>}
    </div>
);

const ChevronIcon = () => (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const SearchIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);
const FilterIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="4" y1="6" x2="20" y2="6" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="11" y1="18" x2="13" y2="18" />
    </svg>
);
const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

export default FilterBar;
