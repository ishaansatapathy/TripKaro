import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

type ExpenseCategory = "hotel" | "transport" | "food" | "tickets" | "other";

interface Expense {
    _id: string;
    tripId: string;
    title: string;
    amount: number;
    category: ExpenseCategory;
    paidBy: string;
    splitBetween: string[];
    createdAt: string;
}

interface Member {
    _id: string;
    userId: string;
    role: string;
}

const CATEGORY_META: Record<ExpenseCategory, { label: string; color: string; icon: React.ReactNode }> = {
    hotel: {
        label: "Hotel",
        color: "bg-indigo-100 text-indigo-600",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
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
    food: {
        label: "Food",
        color: "bg-orange-100 text-orange-600",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    tickets: {
        label: "Tickets",
        color: "bg-rose-100 text-rose-600",
        icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
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

function shortUserId(uid: string) {
    return uid.split("|").pop()?.slice(0, 12) || uid.slice(0, 12);
}

// ── Expense Row ─────────────────────────────────────────────────────

interface ExpenseRowProps {
    expense: Expense;
    isOwner: boolean;
    onDeleted?: () => void;
}

function ExpenseRow({ expense, isOwner, onDeleted }: ExpenseRowProps) {
    const { getToken } = useAuth();
    const meta = CATEGORY_META[expense.category || "other"];

    const handleDelete = async () => {
        if (!confirm("Delete this expense?")) return;
        const token = await getToken();
        await apiFetch(`/api/expenses/${expense._id}`, token, { method: "DELETE" });
        onDeleted?.();
    };

    return (
        <div className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
            <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${meta.color}`}>
                {meta.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">{expense.title}</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${meta.color}`}>
                        {meta.label}
                    </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                    Paid by {shortUserId(expense.paidBy)}
                    {(expense.splitBetween?.length ?? 0) > 0 && (
                        <> · Split {expense.splitBetween.length} way{expense.splitBetween.length > 1 ? "s" : ""}</>
                    )}
                </p>
            </div>
            <span className="text-sm font-semibold text-gray-800 tabular-nums">
                ₹{expense.amount.toLocaleString()}
            </span>
            {isOwner && (
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all duration-150"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
        </div>
    );
}

// ── Add Expense Form ────────────────────────────────────────────────

interface AddExpenseFormProps {
    tripId: string;
    members: Member[];
    onDone: () => void;
    onAdded?: () => void;
}

function AddExpenseForm({ tripId, members, onDone, onAdded }: AddExpenseFormProps) {
    const { getToken } = useAuth();
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState<ExpenseCategory>("other");
    const [paidBy, setPaidBy] = useState(members[0]?.userId ?? "");
    const [splitAll, setSplitAll] = useState(true);
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();
        const num = parseFloat(amount);
        if (!trimmed || isNaN(num) || num <= 0) return;

        setSaving(true);
        try {
            const token = await getToken();
            await apiFetch("/api/expenses", token, {
                method: "POST",
                body: JSON.stringify({
                    tripId,
                    title: trimmed,
                    amount: num,
                    category,
                    paidBy,
                    splitBetween: splitAll ? members.map((m) => m.userId) : [paidBy],
                }),
            });
            onDone();
            onAdded?.();
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Expense title *"
                    required
                    className="col-span-full text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 outline-none transition-all placeholder:text-gray-300"
                />
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount *"
                        required
                        className="w-full text-sm pl-7 pr-3 py-2 rounded-xl border border-gray-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 outline-none transition-all placeholder:text-gray-300"
                    />
                </div>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 outline-none transition-all text-gray-700"
                >
                    <option value="hotel">Hotel</option>
                    <option value="transport">Transport</option>
                    <option value="food">Food</option>
                    <option value="tickets">Tickets</option>
                    <option value="other">Other</option>
                </select>
                <select
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="text-sm px-3 py-2 rounded-xl border border-gray-200 focus:border-emerald-300 focus:ring-1 focus:ring-emerald-200 outline-none transition-all text-gray-700"
                >
                    {members.map((m) => (
                        <option key={m._id} value={m.userId}>
                            {shortUserId(m.userId)} ({m.role})
                        </option>
                    ))}
                </select>
                <label className="col-span-full flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={splitAll}
                        onChange={(e) => setSplitAll(e.target.checked)}
                        className="rounded border-gray-300 text-emerald-500 focus:ring-emerald-200"
                    />
                    Split equally among all members
                </label>
            </div>
            <div className="flex items-center gap-2 justify-end">
                <button
                    type="button"
                    onClick={onDone}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!title.trim() || !amount || saving}
                    className="px-4 py-1.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                >
                    {saving ? "Adding…" : "Add Expense"}
                </button>
            </div>
        </form>
    );
}

// ── Summary Card ────────────────────────────────────────────────────

interface SummaryProps {
    expenses: Expense[];
    memberCount: number;
}

function BudgetSummary({ expenses, memberCount }: SummaryProps) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const perPerson = memberCount > 0 ? total / memberCount : 0;

    const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.category || "other"] = (acc[e.category || "other"] || 0) + e.amount;
        return acc;
    }, {});

    const sortedCategories = Object.entries(byCategory).sort(([, a], [, b]) => b - a);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Trip Cost</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">₹{total.toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Per Person</p>
                    <p className="text-lg font-semibold text-emerald-600 mt-0.5">
                        ₹{Math.ceil(perPerson).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">{memberCount} member{memberCount !== 1 ? "s" : ""}</p>
                </div>
            </div>

            {sortedCategories.length > 1 && (
                <>
                    <div className="h-2 rounded-full overflow-hidden flex bg-gray-100">
                        {sortedCategories.map(([cat, amt]) => {
                            const meta = CATEGORY_META[cat as ExpenseCategory];
                            const pct = total > 0 ? (amt / total) * 100 : 0;
                            const barColor: Record<string, string> = {
                                hotel: "bg-indigo-400",
                                transport: "bg-sky-400",
                                food: "bg-orange-400",
                                tickets: "bg-rose-400",
                                other: "bg-gray-400",
                            };
                            return (
                                <div
                                    key={cat}
                                    className={`${barColor[cat] || "bg-gray-400"} transition-all duration-300`}
                                    style={{ width: `${pct}%` }}
                                    title={`${meta?.label}: ₹${amt.toLocaleString()}`}
                                />
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {sortedCategories.map(([cat, amt]) => {
                            const meta = CATEGORY_META[cat as ExpenseCategory];
                            return (
                                <div key={cat} className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <span className={`w-2 h-2 rounded-full ${meta?.color.split(" ")[0] || "bg-gray-200"}`} />
                                    {meta?.label}: ₹{amt.toLocaleString()}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

// ── Panel ───────────────────────────────────────────────────────────

interface BudgetPanelProps {
    tripId: string;
    userRole: string;
    members: Member[];
}

export function BudgetPanel({ tripId, userRole, members }: BudgetPanelProps) {
    const { getToken } = useAuth();
    const [showAdd, setShowAdd] = useState(false);
    const [expenses, setExpenses] = useState<Expense[] | null>(null);

    const readOnly = userRole === "Viewer";
    const isOwner = userRole === "Owner";

    const loadExpenses = useCallback(async () => {
        try {
            const token = await getToken();
            const data = await apiFetch(`/api/expenses/trip/${tripId}`, token);
            setExpenses(data.expenses || []);
        } catch (err) {
            console.error("Failed to load expenses:", err);
        }
    }, [tripId, getToken]);

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Expenses</h2>
                {!readOnly && !showAdd && (
                    <button
                        onClick={() => setShowAdd(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Expense
                    </button>
                )}
            </div>

            {showAdd && (
                <AddExpenseForm tripId={tripId} members={members} onDone={() => setShowAdd(false)} onAdded={loadExpenses} />
            )}

            {!expenses ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : expenses.length === 0 && !showAdd ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <svg className="w-10 h-10 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-400 text-sm">
                        No expenses yet.{!readOnly && " Start tracking your trip budget!"}
                    </p>
                </div>
            ) : (
                <>
                    {expenses.length > 0 && (
                        <BudgetSummary expenses={expenses} memberCount={members.length} />
                    )}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                        {expenses.map((exp) => (
                            <ExpenseRow key={exp._id} expense={exp} isOwner={isOwner} onDeleted={loadExpenses} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
