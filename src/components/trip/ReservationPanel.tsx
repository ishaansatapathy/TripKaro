import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

type ReservationType = "hotel" | "restaurant" | "tour" | "transport" | "other";

const TYPE_META: Record<ReservationType, { label: string; color: string; icon: React.ReactNode }> = {
    hotel: {
        label: "Hotel",
        color: "bg-indigo-100 text-indigo-600",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        ),
    },
    restaurant: {
        label: "Restaurant",
        color: "bg-orange-100 text-orange-600",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    tour: {
        label: "Tour",
        color: "bg-emerald-100 text-emerald-600",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
            </svg>
        ),
    },
    transport: {
        label: "Transport",
        color: "bg-sky-100 text-sky-600",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
        ),
    },
    other: {
        label: "Other",
        color: "bg-gray-100 text-gray-600",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
        ),
    },
};

function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

// ── Reservation Card ────────────────────────────────────────────────

interface ReservationCardProps {
    reservation: Doc<"reservations">;
    readOnly: boolean;
    isOwner: boolean;
    onEdit: (r: Doc<"reservations">) => void;
}

function ReservationCard({ reservation, readOnly, isOwner, onEdit }: ReservationCardProps) {
    const deleteReservation = useMutation(api.reservations.deleteReservation);
    const meta = TYPE_META[reservation.type];

    const handleDelete = async () => {
        if (!confirm("Delete this reservation?")) return;
        await deleteReservation({ reservationId: reservation._id });
    };

    return (
        <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-gray-200 transition-all duration-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}>
                        {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-800 text-sm">{reservation.title}</h4>
                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${meta.color}`}>
                                {meta.label}
                            </span>
                        </div>

                        <div className="mt-2 space-y-1">
                            {reservation.location && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{reservation.location}</span>
                                </div>
                            )}
                            {(reservation.date || reservation.time) && (
                                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>
                                        {reservation.date ? formatDate(reservation.date) : ""}
                                        {reservation.date && reservation.time ? " · " : ""}
                                        {reservation.time || ""}
                                    </span>
                                </div>
                            )}
                            {reservation.notes && (
                                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{reservation.notes}</p>
                            )}
                        </div>
                    </div>
                </div>

                {!readOnly && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                        <button
                            onClick={() => onEdit(reservation)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        {isOwner && (
                            <button
                                onClick={handleDelete}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Add / Edit Form ─────────────────────────────────────────────────

interface ReservationFormData {
    title: string;
    type: ReservationType;
    location: string;
    date: string;
    time: string;
    notes: string;
}

const EMPTY_FORM: ReservationFormData = { title: "", type: "hotel", location: "", date: "", time: "", notes: "" };

interface ReservationFormProps {
    initial?: ReservationFormData;
    onSubmit: (data: ReservationFormData) => Promise<void>;
    onCancel: () => void;
    submitLabel: string;
}

function ReservationForm({ initial, onSubmit, onCancel, submitLabel }: ReservationFormProps) {
    const [form, setForm] = useState<ReservationFormData>(initial ?? EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const set = (field: keyof ReservationFormData, value: string) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        setSaving(true);
        try {
            await onSubmit(form);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="Reservation title *"
                    required
                    className="col-span-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none transition-all placeholder:text-gray-300"
                />
                <select
                    value={form.type}
                    onChange={(e) => set("type", e.target.value)}
                    className="text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none transition-all text-gray-700"
                >
                    <option value="hotel">Hotel</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="tour">Tour</option>
                    <option value="transport">Transport</option>
                    <option value="other">Other</option>
                </select>
                <input
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="Location"
                    className="text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none transition-all placeholder:text-gray-300"
                />
                <input
                    type="date"
                    value={form.date}
                    onChange={(e) => set("date", e.target.value)}
                    className="text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none transition-all text-gray-700"
                />
                <input
                    value={form.time}
                    onChange={(e) => set("time", e.target.value)}
                    placeholder="Time (e.g. 7 PM)"
                    className="text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none transition-all placeholder:text-gray-300"
                />
            </div>
            <textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none transition-all placeholder:text-gray-300 resize-none"
            />
            <div className="flex items-center gap-2 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!form.title.trim() || saving}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                    {saving ? "Saving…" : submitLabel}
                </button>
            </div>
        </form>
    );
}

// ── Panel ───────────────────────────────────────────────────────────

interface ReservationPanelProps {
    tripId: Id<"trips">;
    userRole: "owner" | "editor" | "viewer";
}

export function ReservationPanel({ tripId, userRole }: ReservationPanelProps) {
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState<Doc<"reservations"> | null>(null);

    const reservations = useQuery(api.reservations.getReservations, { tripId });
    const addReservation = useMutation(api.reservations.addReservation);
    const editReservation = useMutation(api.reservations.editReservation);

    const readOnly = userRole === "viewer";
    const isOwner = userRole === "owner";

    const handleAdd = async (data: ReservationFormData) => {
        await addReservation({
            tripId,
            title: data.title.trim(),
            type: data.type,
            location: data.location.trim() || undefined,
            date: data.date || undefined,
            time: data.time.trim() || undefined,
            notes: data.notes.trim() || undefined,
        });
        setShowAdd(false);
    };

    const handleEdit = async (data: ReservationFormData) => {
        if (!editing) return;
        await editReservation({
            reservationId: editing._id,
            title: data.title.trim(),
            type: data.type,
            location: data.location.trim() || undefined,
            date: data.date || undefined,
            time: data.time.trim() || undefined,
            notes: data.notes.trim() || undefined,
        });
        setEditing(null);
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Reservations</h2>
                {!readOnly && !showAdd && !editing && (
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-teal-500 hover:bg-teal-600 text-white transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Reservation
                    </button>
                )}
            </div>

            {showAdd && (
                <ReservationForm
                    onSubmit={handleAdd}
                    onCancel={() => setShowAdd(false)}
                    submitLabel="Add"
                />
            )}

            {editing && (
                <ReservationForm
                    initial={{
                        title: editing.title,
                        type: editing.type,
                        location: editing.location ?? "",
                        date: editing.date ?? "",
                        time: editing.time ?? "",
                        notes: editing.notes ?? "",
                    }}
                    onSubmit={handleEdit}
                    onCancel={() => setEditing(null)}
                    submitLabel="Save"
                />
            )}

            {!reservations ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : reservations.length === 0 && !showAdd ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <svg className="w-10 h-10 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400 text-sm">
                        No reservations yet.{!readOnly && " Add hotels, restaurants, tours or tickets."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {reservations.map((r) => (
                        <ReservationCard
                            key={r._id}
                            reservation={r}
                            readOnly={readOnly}
                            isOwner={isOwner}
                            onEdit={setEditing}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
