import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/react";
import Link from "@/lib/link";
import Logo from "@/components/Logo";
import { apiFetch } from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────
interface Trip {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    ownerId: string;
    createdAt: string;
}
interface Day { _id: string; tripId: string; date: string; order: number; }
interface Activity { _id: string; dayId: string; title: string; description?: string; startTime?: string; endTime?: string; estimatedCost?: number; order: number; }
interface ChecklistItem { _id: string; checklistId: string; text: string; completed: boolean; }
interface Checklist { _id: string; tripId: string; title: string; items: ChecklistItem[]; }
type ExpenseCategory = "hotel" | "transport" | "food" | "tickets" | "other";
interface Expense { _id: string; tripId: string; title: string; amount: number; category: ExpenseCategory; paidBy: string; createdAt: string; }
interface Attachment { _id: string; tripId: string; fileName: string; fileType: string; fileSize: number; dataUrl: string; createdAt: number; }
type ReservationType = "hotel" | "restaurant" | "tour" | "transport" | "other";
interface Reservation { _id: string; tripId: string; title: string; type: ReservationType; location?: string; date?: string; time?: string; notes?: string; }

// ─── localStorage helpers ───────────────────────────────────────────
function load<T>(key: string, fallback: T): T { try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } }
function save(key: string, data: unknown) { localStorage.setItem(key, JSON.stringify(data)); }

// ─── Date helpers ───────────────────────────────────────────────────
function fmtDate(d: string) { return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function fmtDayDate(d: string) { return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); }

const EXPENSE_META: Record<ExpenseCategory, { label: string; color: string; bar: string }> = {
    hotel: { label: "Hotel", color: "bg-indigo-100 text-indigo-600", bar: "bg-indigo-400" },
    transport: { label: "Transport", color: "bg-sky-100 text-sky-600", bar: "bg-sky-400" },
    food: { label: "Food", color: "bg-orange-100 text-orange-600", bar: "bg-orange-400" },
    tickets: { label: "Tickets", color: "bg-rose-100 text-rose-600", bar: "bg-rose-400" },
    other: { label: "Other", color: "bg-gray-100 text-gray-600", bar: "bg-gray-400" },
};
const RESERVATION_META: Record<ReservationType, { label: string; color: string }> = {
    hotel: { label: "Hotel", color: "bg-indigo-100 text-indigo-600" },
    restaurant: { label: "Restaurant", color: "bg-orange-100 text-orange-600" },
    tour: { label: "Tour", color: "bg-emerald-100 text-emerald-600" },
    transport: { label: "Transport", color: "bg-sky-100 text-sky-600" },
    other: { label: "Other", color: "bg-gray-100 text-gray-600" },
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
function formatFileSize(bytes: number) { if (bytes < 1024) return `${bytes} B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`; return `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }

// ═══════════════════════════════════════════════════════════════════
// TRIP PAGE
// ═══════════════════════════════════════════════════════════════════
export default function TripPage() {
    const { tripId } = useParams<{ tripId: string }>();
    const { userId, getToken } = useAuth();
    const { user } = useUser();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [tripLoading, setTripLoading] = useState(true);
    const [days, setDays] = useState<Day[]>([]);
    const [activitiesMap, setActivitiesMap] = useState<Record<string, Activity[]>>({});
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [activeTab, setActiveTab] = useState<"itinerary" | "checklists" | "budget" | "attachments" | "reservations">("itinerary");

    const reload = useCallback(async () => {
        if (!tripId) return;
        try {
            setTripLoading(true);
            const token = await getToken();
            const tripData = await apiFetch(`/api/trips/${tripId}`, token);
            setTrip(tripData);
        } catch {
            setTrip(null);
        } finally {
            setTripLoading(false);
        }
        const loadedDays: Day[] = load(`tripkaro_days_${tripId}`, []);
        setDays(loadedDays);
        const aMap: Record<string, Activity[]> = {};
        for (const d of loadedDays) aMap[d._id] = load(`tripkaro_activities_${d._id}`, []);
        setActivitiesMap(aMap);
        setChecklists(load(`tripkaro_checklists_${tripId}`, []));
        setExpenses(load(`tripkaro_expenses_${tripId}`, []));
        setAttachments(load(`tripkaro_attachments_${tripId}`, []));
        setReservations(load(`tripkaro_reservations_${tripId}`, []));
    }, [tripId, getToken]);

    useEffect(() => { reload(); }, [reload]);

    const saveDays = (d: Day[]) => { setDays(d); save(`tripkaro_days_${tripId}`, d); };
    const saveActivities = (dayId: string, a: Activity[]) => { setActivitiesMap((p) => ({ ...p, [dayId]: a })); save(`tripkaro_activities_${dayId}`, a); };
    const saveChecklists = (c: Checklist[]) => { setChecklists(c); save(`tripkaro_checklists_${tripId}`, c); };
    const saveExpenses = (e: Expense[]) => { setExpenses(e); save(`tripkaro_expenses_${tripId}`, e); };
    const saveAttachments = (a: Attachment[]) => { setAttachments(a); save(`tripkaro_attachments_${tripId}`, a); };
    const saveReservations = (r: Reservation[]) => { setReservations(r); save(`tripkaro_reservations_${tripId}`, r); };

    if (tripLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!trip) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
                <p className="text-slate-400 text-sm">Trip not found</p>
                <Link href="/dashboard" className="text-sm font-semibold text-black hover:underline">← Back to Dashboard</Link>
            </div>
        );
    }

    const totalDays = Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000) + 1;
    const tabs = [
        { key: "itinerary" as const, label: "Itinerary", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
        { key: "checklists" as const, label: "Checklists", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
        { key: "budget" as const, label: "Budget", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
        { key: "attachments" as const, label: "Files", icon: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" },
        { key: "reservations" as const, label: "Reservations", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-black transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <Logo className="h-10 w-auto" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span className="font-medium text-slate-700">{trip.title}</span>
                        <span>·</span>
                        <span>{fmtDate(trip.startDate)} — {fmtDate(trip.endDate)}</span>
                        <span className="ml-2 text-xs bg-slate-100 px-2 py-0.5 rounded-full font-bold">{totalDays} days</span>
                    </div>
                </div>
            </header>

            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 flex gap-1 overflow-x-auto">
                    {tabs.map((t) => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeTab === t.key ? "border-black text-black" : "border-transparent text-slate-400 hover:text-slate-600"}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={t.icon} /></svg>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 py-8">
                {activeTab === "itinerary" && <ItineraryTab tripId={tripId!} days={days} activitiesMap={activitiesMap} onDaysChange={saveDays} onActivitiesChange={saveActivities} />}
                {activeTab === "checklists" && <ChecklistTab checklists={checklists} onChange={saveChecklists} />}
                {activeTab === "budget" && <BudgetTab expenses={expenses} onChange={saveExpenses} userId={userId ?? user?.id ?? "local"} />}
                {activeTab === "attachments" && <AttachmentTab tripId={tripId!} attachments={attachments} onChange={saveAttachments} />}
                {activeTab === "reservations" && <ReservationTab reservations={reservations} onChange={saveReservations} />}
            </main>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  ITINERARY TAB
// ═══════════════════════════════════════════════════════════════════
function ItineraryTab({ tripId, days, activitiesMap, onDaysChange, onActivitiesChange }: {
    tripId: string; days: Day[]; activitiesMap: Record<string, Activity[]>; onDaysChange: (d: Day[]) => void; onActivitiesChange: (dayId: string, a: Activity[]) => void;
}) {
    const [addDayDate, setAddDayDate] = useState("");
    const [showAddDay, setShowAddDay] = useState(false);

    const handleAddDay = (e: React.FormEvent) => {
        e.preventDefault();
        if (!addDayDate) return;
        const newDay: Day = { _id: crypto.randomUUID(), tripId, date: addDayDate, order: days.length + 1 };
        onDaysChange([...days, newDay]);
        setAddDayDate("");
        setShowAddDay(false);
    };

    const handleDeleteDay = (dayId: string) => {
        if (!confirm("Delete this day and all its activities?")) return;
        onDaysChange(days.filter((d) => d._id !== dayId).map((d, i) => ({ ...d, order: i + 1 })));
        localStorage.removeItem(`tripkaro_activities_${dayId}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Itinerary</h2>
                {!showAddDay ? (
                    <button onClick={() => setShowAddDay(true)} className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-slate-800 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Day
                    </button>
                ) : (
                    <form onSubmit={handleAddDay} className="flex items-center gap-2">
                        <input type="date" value={addDayDate} onChange={(e) => setAddDayDate(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/10" autoFocus />
                        <button type="submit" className="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl">Add</button>
                        <button type="button" onClick={() => setShowAddDay(false)} className="px-3 py-2 text-sm text-slate-400 hover:text-slate-600">Cancel</button>
                    </form>
                )}
            </div>
            {days.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <svg className="w-12 h-12 mx-auto text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-slate-400 text-sm">No days added yet. Add your first day to start planning!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {days.sort((a, b) => a.order - b.order).map((day) => (
                        <DaySection key={day._id} day={day} activities={activitiesMap[day._id] || []} onActivitiesChange={(a) => onActivitiesChange(day._id, a)} onDelete={() => handleDeleteDay(day._id)} />
                    ))}
                </div>
            )}
        </div>
    );
}

function DaySection({ day, activities, onActivitiesChange, onDelete }: {
    day: Day; activities: Activity[]; onActivitiesChange: (a: Activity[]) => void; onDelete: () => void;
}) {
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAddActivity = (a: Omit<Activity, "_id" | "dayId" | "order">) => {
        onActivitiesChange([...activities, { ...a, _id: crypto.randomUUID(), dayId: day._id, order: activities.length + 1 }]);
        setShowAdd(false);
    };
    const handleEditActivity = (id: string, a: Partial<Activity>) => { onActivitiesChange(activities.map((x) => (x._id === id ? { ...x, ...a } : x))); setEditingId(null); };
    const handleDeleteActivity = (id: string) => { if (!confirm("Delete this activity?")) return; onActivitiesChange(activities.filter((x) => x._id !== id)); };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center text-sm font-bold">{day.order}</div>
                    <h3 className="font-semibold text-slate-800">{fmtDayDate(day.date)}</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{activities.length} activit{activities.length === 1 ? "y" : "ies"}</span>
                    <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors" title="Delete day">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </div>
            <div className="p-4 space-y-3">
                {activities.length === 0 && !showAdd && <p className="text-center text-sm text-slate-400 py-4">No activities yet</p>}
                {activities.sort((a, b) => a.order - b.order).map((act) =>
                    editingId === act._id ? (
                        <ActivityForm key={act._id} initial={act} onSubmit={(data) => handleEditActivity(act._id, data)} onCancel={() => setEditingId(null)} submitLabel="Save" />
                    ) : (
                        <div key={act._id} className="group relative bg-slate-50 hover:bg-white rounded-xl p-4 border border-slate-100 hover:border-slate-200 transition-all">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-slate-800 text-sm">{act.title}</h4>
                                    {(act.startTime || act.endTime) && (
                                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <span>{act.startTime || "—"}{act.endTime && ` → ${act.endTime}`}</span>
                                        </div>
                                    )}
                                    {act.description && <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{act.description}</p>}
                                    {(act.estimatedCost ?? 0) > 0 && <span className="mt-2 inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">₹{act.estimatedCost!.toLocaleString()}</span>}
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditingId(act._id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    <button onClick={() => handleDeleteActivity(act._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </div>
                        </div>
                    )
                )}
                {showAdd ? (
                    <ActivityForm onSubmit={handleAddActivity} onCancel={() => setShowAdd(false)} submitLabel="Add Activity" />
                ) : (
                    <button onClick={() => setShowAdd(true)} className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-xl text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        Add Activity
                    </button>
                )}
            </div>
        </div>
    );
}

function ActivityForm({ initial, onSubmit, onCancel, submitLabel }: {
    initial?: Partial<Activity>; onSubmit: (data: Omit<Activity, "_id" | "dayId" | "order">) => void; onCancel: () => void; submitLabel: string;
}) {
    const [title, setTitle] = useState(initial?.title || "");
    const [description, setDescription] = useState(initial?.description || "");
    const [startTime, setStartTime] = useState(initial?.startTime || "");
    const [endTime, setEndTime] = useState(initial?.endTime || "");
    const [estimatedCost, setEstimatedCost] = useState(initial?.estimatedCost?.toString() || "");

    return (
        <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onSubmit({ title: title.trim(), description: description.trim() || undefined, startTime: startTime || undefined, endTime: endTime || undefined, estimatedCost: estimatedCost ? Number(estimatedCost) : undefined }); }} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
            <input type="text" placeholder="Activity title *" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black" autoFocus />
            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black resize-none" />
            <div className="grid grid-cols-3 gap-2">
                <div><label className="text-xs text-slate-500 mb-1 block">Start</label><input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                <div><label className="text-xs text-slate-500 mb-1 block">End</label><input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                <div><label className="text-xs text-slate-500 mb-1 block">Cost (₹)</label><input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} className="w-full px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" min="0" /></div>
            </div>
            <div className="flex items-center gap-2 pt-1">
                <button type="submit" className="px-4 py-2 bg-black hover:bg-slate-800 text-white text-sm font-medium rounded-lg">{submitLabel}</button>
                <button type="button" onClick={onCancel} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700">Cancel</button>
            </div>
        </form>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  CHECKLISTS TAB
// ═══════════════════════════════════════════════════════════════════
function ChecklistTab({ checklists, onChange }: { checklists: Checklist[]; onChange: (c: Checklist[]) => void }) {
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");

    const handleCreate = (e: React.FormEvent) => { e.preventDefault(); if (!title.trim()) return; onChange([...checklists, { _id: crypto.randomUUID(), tripId: "", title: title.trim(), items: [] }]); setTitle(""); setShowForm(false); };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Checklists</h2>
                <button onClick={() => setShowForm((v) => !v)} className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-xl transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    New Checklist
                </button>
            </div>
            {showForm && (
                <form onSubmit={handleCreate} className="flex items-center gap-2">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Checklist title (e.g. Packing List)" autoFocus className="flex-1 text-sm px-4 py-2 rounded-xl border border-slate-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none" />
                    <button type="submit" disabled={!title.trim()} className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-40 rounded-xl">Create</button>
                    <button type="button" onClick={() => { setShowForm(false); setTitle(""); }} className="px-3 py-2 text-sm text-slate-400 hover:text-slate-600">Cancel</button>
                </form>
            )}
            {checklists.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <svg className="w-12 h-12 mx-auto text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    <p className="text-slate-400 text-sm">No checklists yet. Create one to start organizing!</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {checklists.map((cl) => (
                        <ChecklistCardLocal key={cl._id} checklist={cl}
                            onDelete={() => { if (confirm("Delete this checklist?")) onChange(checklists.filter((c) => c._id !== cl._id)); }}
                            onToggleItem={(itemId) => onChange(checklists.map((c) => c._id === cl._id ? { ...c, items: c.items.map((i) => i._id === itemId ? { ...i, completed: !i.completed } : i) } : c))}
                            onAddItem={(text) => onChange(checklists.map((c) => c._id === cl._id ? { ...c, items: [...c.items, { _id: crypto.randomUUID(), checklistId: cl._id, text, completed: false }] } : c))}
                            onDeleteItem={(itemId) => onChange(checklists.map((c) => c._id === cl._id ? { ...c, items: c.items.filter((i) => i._id !== itemId) } : c))}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function ChecklistCardLocal({ checklist, onDelete, onToggleItem, onAddItem, onDeleteItem }: {
    checklist: Checklist; onDelete: () => void; onToggleItem: (id: string) => void; onAddItem: (text: string) => void; onDeleteItem: (id: string) => void;
}) {
    const [newText, setNewText] = useState("");
    const completed = checklist.items.filter((i) => i.completed).length;
    const total = checklist.items.length;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-linear-to-r from-violet-50 to-purple-50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 text-sm">{checklist.title}</h3>
                    <div className="flex items-center gap-2">
                        {total > 0 && <span className="text-xs text-slate-400">{completed}/{total}</span>}
                        <button onClick={onDelete} className="p-1 rounded-md hover:bg-red-50 text-slate-300 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                </div>
                {total > 0 && <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden"><div className="h-full bg-violet-400 rounded-full transition-all duration-300" style={{ width: `${(completed / total) * 100}%` }} /></div>}
            </div>
            <div className="px-5 py-3">
                {checklist.items.length === 0 ? <p className="text-center text-xs text-slate-400 py-3">No items yet</p> : (
                    <div className="divide-y divide-slate-50">
                        {checklist.items.map((item) => (
                            <div key={item._id} className="group flex items-center gap-3 py-1.5">
                                <button onClick={() => onToggleItem(item._id)} className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.completed ? "bg-violet-500 border-violet-500" : "border-slate-300 hover:border-violet-400"}`}>
                                    {item.completed && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </button>
                                <span className={`flex-1 text-sm ${item.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>{item.text}</span>
                                <button onClick={() => onDeleteItem(item._id)} className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                            </div>
                        ))}
                    </div>
                )}
                <form onSubmit={(e) => { e.preventDefault(); if (newText.trim()) { onAddItem(newText.trim()); setNewText(""); } }} className="mt-2 flex items-center gap-2">
                    <input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Add item..." className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-slate-200 focus:border-violet-300 focus:ring-1 focus:ring-violet-200 outline-none placeholder:text-slate-300" />
                    <button type="submit" disabled={!newText.trim()} className="px-3 py-1.5 text-xs font-medium text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-40 rounded-lg">Add</button>
                </form>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  BUDGET TAB
// ═══════════════════════════════════════════════════════════════════
function BudgetTab({ expenses, onChange, userId }: { expenses: Expense[]; onChange: (e: Expense[]) => void; userId: string }) {
    const [showAdd, setShowAdd] = useState(false);
    const [title, setTitle] = useState(""); const [amount, setAmount] = useState(""); const [category, setCategory] = useState<ExpenseCategory>("other");
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const byCategory = expenses.reduce<Record<string, number>>((acc, e) => { acc[e.category || "other"] = (acc[e.category || "other"] || 0) + e.amount; return acc; }, {});
    const sorted = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault(); const num = parseFloat(amount);
        if (!title.trim() || isNaN(num) || num <= 0) return;
        onChange([...expenses, { _id: crypto.randomUUID(), tripId: "", title: title.trim(), amount: num, category, paidBy: userId, createdAt: new Date().toISOString() }]);
        setTitle(""); setAmount(""); setCategory("other"); setShowAdd(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Budget & Expenses</h2>
                {!showAdd && <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Expense</button>}
            </div>
            {expenses.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
                    <div><p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Trip Cost</p><p className="text-2xl font-bold text-slate-900 mt-0.5">₹{total.toLocaleString()}</p></div>
                    {sorted.length > 1 && (
                        <>
                            <div className="h-2 rounded-full overflow-hidden flex bg-slate-100">{sorted.map(([cat, amt]) => <div key={cat} className={`${EXPENSE_META[cat as ExpenseCategory]?.bar || "bg-gray-400"}`} style={{ width: `${total > 0 ? (amt / total) * 100 : 0}%` }} />)}</div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">{sorted.map(([cat, amt]) => <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-500"><span className={`w-2 h-2 rounded-full ${EXPENSE_META[cat as ExpenseCategory]?.color.split(" ")[0]}`} />{EXPENSE_META[cat as ExpenseCategory]?.label}: ₹{amt.toLocaleString()}</div>)}</div>
                        </>
                    )}
                </div>
            )}
            {showAdd && (
                <form onSubmit={handleAdd} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Expense title *" required className="col-span-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 outline-none placeholder:text-slate-300" />
                        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span><input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount *" required className="w-full text-sm pl-7 pr-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 outline-none placeholder:text-slate-300" /></div>
                        <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 outline-none text-slate-700"><option value="hotel">Hotel</option><option value="transport">Transport</option><option value="food">Food</option><option value="tickets">Tickets</option><option value="other">Other</option></select>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-600">Cancel</button>
                        <button type="submit" disabled={!title.trim() || !amount} className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 rounded-xl">Add Expense</button>
                    </div>
                </form>
            )}
            {expenses.length === 0 && !showAdd ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <svg className="w-12 h-12 mx-auto text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-slate-400 text-sm">No expenses yet. Start tracking your trip budget!</p>
                </div>
            ) : expenses.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
                    {expenses.map((exp) => { const meta = EXPENSE_META[exp.category || "other"]; return (
                        <div key={exp._id} className="group flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                            <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${meta.color}`}>{meta.label.slice(0, 1)}</div>
                            <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><span className="text-sm font-medium text-slate-800 truncate">{exp.title}</span><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span></div></div>
                            <span className="text-sm font-semibold text-slate-800 tabular-nums">₹{exp.amount.toLocaleString()}</span>
                            <button onClick={() => { if (confirm("Delete?")) onChange(expenses.filter((e) => e._id !== exp._id)); }} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    ); })}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  ATTACHMENTS TAB
// ═══════════════════════════════════════════════════════════════════
function AttachmentTab({ tripId, attachments, onChange }: { tripId: string; attachments: Attachment[]; onChange: (a: Attachment[]) => void }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<Attachment | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) { alert("File must be under 5 MB."); return; }
        setUploading(true);
        try {
            const dataUrl = await new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result as string); r.onerror = reject; r.readAsDataURL(file); });
            onChange([...attachments, { _id: crypto.randomUUID(), tripId, fileName: file.name, fileType: file.type, fileSize: file.size, dataUrl, createdAt: Date.now() }]);
        } catch { alert("Failed to read file."); }
        finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
    };

    const FILE_ICONS: Record<string, { icon: string; color: string }> = { "application/pdf": { icon: "PDF", color: "bg-red-100 text-red-600" }, "image/png": { icon: "PNG", color: "bg-blue-100 text-blue-600" }, "image/jpeg": { icon: "JPG", color: "bg-blue-100 text-blue-600" }, "image/webp": { icon: "WEBP", color: "bg-blue-100 text-blue-600" }, "image/gif": { icon: "GIF", color: "bg-purple-100 text-purple-600" } };
    const getIcon = (t: string) => FILE_ICONS[t] || (t.startsWith("image/") ? { icon: "IMG", color: "bg-blue-100 text-blue-600" } : { icon: "FILE", color: "bg-gray-100 text-gray-600" });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Trip Documents & Files</h2>
                <label className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl text-white cursor-pointer ${uploading ? "bg-amber-400 cursor-wait" : "bg-amber-500 hover:bg-amber-600"}`}>
                    {uploading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Uploading…</> : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Upload File</>}
                    <input ref={fileInputRef} type="file" accept="image/*,application/pdf" onChange={handleUpload} disabled={uploading} className="sr-only" />
                </label>
            </div>
            {attachments.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <svg className="w-12 h-12 mx-auto text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    <p className="text-slate-400 text-sm">No documents yet. Upload flight tickets, bookings or images.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-50">
                    {attachments.map((att) => { const { icon, color } = getIcon(att.fileType); const isImage = att.fileType.startsWith("image/"); return (
                        <div key={att._id} className="group flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors">
                            <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${color}`}>{icon}</div>
                            <div className="flex-1 min-w-0"><p className="text-sm font-medium text-slate-800 truncate">{att.fileName}</p><p className="text-xs text-slate-400">{formatFileSize(att.fileSize)} · {new Date(att.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p></div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {isImage && <button onClick={() => setPreview(att)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Preview"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>}
                                <a href={att.dataUrl} download={att.fileName} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="Download"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></a>
                                <button onClick={() => { if (confirm("Delete?")) onChange(attachments.filter((a) => a._id !== att._id)); }} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500" title="Delete"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                        </div>
                    ); })}
                </div>
            )}
            {preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPreview(null)}>
                    <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                            <h3 className="text-sm font-semibold text-slate-800 truncate">{preview.fileName}</h3>
                            <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-50">
                            <img src={preview.dataUrl} alt={preview.fileName} className="max-w-full max-h-[70vh] rounded-lg object-contain" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
//  RESERVATIONS TAB
// ═══════════════════════════════════════════════════════════════════
function ReservationTab({ reservations, onChange }: { reservations: Reservation[]; onChange: (r: Reservation[]) => void }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = (data: Omit<Reservation, "_id" | "tripId">) => { onChange([...reservations, { ...data, _id: crypto.randomUUID(), tripId: "" }]); setShowAdd(false); };
    const handleEdit = (id: string, data: Omit<Reservation, "_id" | "tripId">) => { onChange(reservations.map((r) => (r._id === id ? { ...r, ...data } : r))); setEditingId(null); };
    const handleDelete = (id: string) => { if (!confirm("Delete this reservation?")) return; onChange(reservations.filter((r) => r._id !== id)); };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Reservations</h2>
                {!showAdd && !editingId && <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-xl"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Add Reservation</button>}
            </div>
            {showAdd && <ReservationForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} submitLabel="Add" />}
            {editingId && (() => { const r = reservations.find((x) => x._id === editingId); if (!r) return null; return <ReservationForm initial={r} onSubmit={(data) => handleEdit(editingId, data)} onCancel={() => setEditingId(null)} submitLabel="Save" />; })()}
            {reservations.length === 0 && !showAdd ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <svg className="w-12 h-12 mx-auto text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-slate-400 text-sm">No reservations yet. Add hotels, restaurants, tours or tickets.</p>
                </div>
            ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                    {reservations.map((r) => { const meta = RESERVATION_META[r.type]; return (
                        <div key={r._id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:border-slate-300 transition-all">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${meta.color}`}>{meta.label.slice(0, 1)}</div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap"><h4 className="font-semibold text-slate-800 text-sm">{r.title}</h4><span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${meta.color}`}>{meta.label}</span></div>
                                        {r.location && <p className="text-xs text-slate-500 mt-1">{r.location}</p>}
                                        {(r.date || r.time) && <p className="text-xs text-slate-500 mt-0.5">{r.date && fmtDate(r.date)}{r.date && r.time && " · "}{r.time}</p>}
                                        {r.notes && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{r.notes}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <button onClick={() => setEditingId(r._id)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    <button onClick={() => handleDelete(r._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </div>
                        </div>
                    ); })}
                </div>
            )}
        </div>
    );
}

function ReservationForm({ initial, onSubmit, onCancel, submitLabel }: {
    initial?: Partial<Reservation>; onSubmit: (data: Omit<Reservation, "_id" | "tripId">) => void; onCancel: () => void; submitLabel: string;
}) {
    const [title, setTitle] = useState(initial?.title || "");
    const [type, setType] = useState<ReservationType>(initial?.type || "hotel");
    const [location, setLocation] = useState(initial?.location || "");
    const [date, setDate] = useState(initial?.date || "");
    const [time, setTime] = useState(initial?.time || "");
    const [notes, setNotes] = useState(initial?.notes || "");

    return (
        <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; onSubmit({ title: title.trim(), type, location: location.trim() || undefined, date: date || undefined, time: time.trim() || undefined, notes: notes.trim() || undefined }); }} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Reservation title *" required className="col-span-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none placeholder:text-slate-300" />
                <select value={type} onChange={(e) => setType(e.target.value as ReservationType)} className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none text-slate-700"><option value="hotel">Hotel</option><option value="restaurant">Restaurant</option><option value="tour">Tour</option><option value="transport">Transport</option><option value="other">Other</option></select>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none placeholder:text-slate-300" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none text-slate-700" />
                <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="Time (e.g. 7 PM)" className="text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none placeholder:text-slate-300" />
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (optional)" rows={2} className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-300 focus:ring-1 focus:ring-teal-200 outline-none placeholder:text-slate-300 resize-none" />
            <div className="flex items-center gap-2 justify-end">
                <button type="button" onClick={onCancel} className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-600">Cancel</button>
                <button type="submit" disabled={!title.trim()} className="px-4 py-1.5 text-sm font-medium text-white bg-teal-500 hover:bg-teal-600 disabled:opacity-40 rounded-xl">{submitLabel}</button>
            </div>
        </form>
    );
}
