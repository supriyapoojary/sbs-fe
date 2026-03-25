import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useGetTherapistsQuery } from "../../../store/bookingApi";
import { selectActiveOutlet } from "../../../store/uiSlice";
import { getTherapistBg, getTherapistColor } from "../../../constants/therapistColors";
import dayjs from "dayjs";
import "./Therapists.scss";

const TherapistsPage = () => {
    const outletId = useSelector(selectActiveOutlet);
    const {
        data: therapists = [],
        isLoading,
        isError,
    } = useGetTherapistsQuery({
        availability: 1,
        outlet: outletId,
        service_at: `${dayjs().format("DD-MM-YYYY")} 09:00:00`,
        services: 1,
        status: 1,
        pagination: 0,
        panel: "outlet",
        outlet_type: 2,
        leave: 0,
    });

    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");

    const filtered = therapists.filter((t) => t.name?.toLowerCase().includes(search.toLowerCase()));

    if (isLoading) return <div className="page-state">Loading therapists…</div>;
    if (isError) return <div className="page-state page-state--error">Failed to load therapists.</div>;

    return (
        <div className="therapists-page">
            <div className="therapist_header">
                <div>
                    <h1>Therapists</h1>
                    <p>{therapists.length} staff on duty today</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    + Add Therapist
                </button>
            </div>

            <input className="input search-input" placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} />

            <table className="therapist-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Pager</th>
                        <th>Level</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((t, i) => (
                        <tr key={t.id}>
                            <td className="num">{i + 1}</td>
                            <td>
                                <div className="name-cell">
                                    <div className="avatar" style={{ background: getTherapistBg(t.gender), color: getTherapistColor(t.gender) }}>
                                        {t.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    {t.name}
                                </div>
                            </td>
                            <td style={{ color: getTherapistColor(t.gender), textTransform: "capitalize" }}>{t.gender}</td>
                            <td>#{t.pager_number}</td>
                            <td>{t.level_name || "—"}</td>
                            <td>
                                <span className={`badge badge--${t.is_available ? "available" : "busy"}`}>
                                    {t.is_available ? "Available" : "Busy"}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && (
                        <tr>
                            <td colSpan={6} className="empty">
                                No therapists found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showForm && <AddTherapistModal onClose={() => setShowForm(false)} />}
        </div>
    );
};

const AddTherapistModal = ({ onClose }) => {
    const [form, setForm] = useState({ name: "", gender: "female", code: "" });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.name) return;
        setLoading(true);
        // TODO: wire to create therapist API when endpoint is available
        setTimeout(() => {
            setLoading(false);
            onClose();
        }, 800);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2>Add Therapist</h2>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Name</label>
                        <input
                            className="input"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Therapist name"
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Gender</label>
                        <select className="input" name="gender" value={form.gender} onChange={handleChange}>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Code</label>
                        <input className="input" name="code" value={form.code} onChange={handleChange} placeholder="e.g. NAT1234" />
                    </div>
                    <div className="modal__footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading || !form.name}>
                            {loading ? (
                                <>
                                    <span className="spinner" /> Saving…
                                </>
                            ) : (
                                "Add Therapist"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TherapistsPage;
