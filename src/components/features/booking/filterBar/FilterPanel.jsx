import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFilters, clearFilters, selectFilters } from "store/uiSlice";
import "./FilterPanel.scss";

const STATUSES = [
    { id: "Confirmed", label: "Confirmed" },
    { id: "Unconfirmed", label: "Unconfirmed" },
    { id: "checked_in", label: "Checked In" },
    { id: "Completed", label: "Completed" },
    { id: "Cancelled", label: "Cancelled" },
    { id: "No-show", label: "No Show" },
    { id: "Holding", label: "Holding" },
    { id: "Check-in (In Progress)", label: "Check-in (In Progress)" },
];

const RESOURCES = ["Rooms", "Sofa", "Monkey Chair"];

const DEFAULT_STATUSES = ["Confirmed", "Unconfirmed", "Checked In", "Completed", "Holding", "Check-in (In Progress)"];

const FilterPanel = ({ onClose }) => {
    const dispatch = useDispatch();
    const filters = useSelector(selectFilters);

    const group = filters.group || "all";
    const statuses = filters.status?.length ? filters.status : DEFAULT_STATUSES;
    const resource = filters.resource || null;

    const setGroup = (g) => dispatch(setFilters({ group: g }));

    const toggleStatus = (id) => {
        const updated = statuses.includes(id) ? statuses.filter((x) => x !== id) : [...statuses, id];
        dispatch(setFilters({ status: updated }));
    };

    const setResource = (r) => dispatch(setFilters({ resource: resource === r ? null : r }));

    const handleClear = () => {
        dispatch(clearFilters());
        onClose();
    };

    return (
        <div className="filter-panel">
            <section>
                <h4>Show by group (Person who is on duty)</h4>
                {["all", "male", "female"].map((g) => (
                    <label key={g} className="radio-row">
                        <input type="radio" name="group" value={g} checked={group === g} onChange={() => setGroup(g)} />
                        {g === "all" ? "All Therapist" : g.charAt(0).toUpperCase() + g.slice(1)}
                    </label>
                ))}
            </section>

            <hr />

            <section>
                <h4>Resources</h4>
                {RESOURCES.map((r) => (
                    <label key={r} className="radio-row">
                        <input type="radio" name="resource" value={r} checked={resource === r} onChange={() => setResource(r)} />
                        {r}
                    </label>
                ))}
            </section>

            <hr />

            <section>
                <h4>Booking Status</h4>
                <div className="status-grid">
                    {STATUSES.map(({ id, label }) => (
                        <label key={id} className="check-row">
                            <input type="checkbox" checked={statuses.includes(id)} onChange={() => toggleStatus(id)} />
                            {label}
                        </label>
                    ))}
                </div>
            </section>

            <hr />

            <button className="clear-btn" onClick={handleClear}>
                Clear Filter (Return to Default)
            </button>
        </div>
    );
};

export default FilterPanel;
