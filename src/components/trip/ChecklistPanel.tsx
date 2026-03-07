import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";
import { ChecklistCard } from "./ChecklistCard";

interface Checklist {
    _id: string;
    tripId: string;
    title: string;
    items: { _id: string; checklistId: string; text: string; completed: boolean }[];
}

interface ChecklistPanelProps {
    tripId: string;
    userRole: string;
}

export function ChecklistPanel({ tripId, userRole }: ChecklistPanelProps) {
    const { getToken } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [checklists, setChecklists] = useState<Checklist[] | null>(null);

    const readOnly = userRole === "Viewer";
    const isOwner = userRole === "Owner";

    const loadChecklists = useCallback(async () => {
        try {
            const token = await getToken();
            const data = await apiFetch(`/api/checklists?tripId=${tripId}`, token);
            setChecklists(data);
        } catch (err) {
            console.error("Failed to load checklists:", err);
        }
    }, [tripId, getToken]);

    useEffect(() => {
        loadChecklists();
    }, [loadChecklists]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        const token = await getToken();
        await apiFetch("/api/checklists", token, {
            method: "POST",
            body: JSON.stringify({ tripId, title: trimmed }),
        });
        setTitle("");
        setShowForm(false);
        await loadChecklists();
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Checklists</h2>
                {!readOnly && (
                    <button
                        onClick={() => setShowForm((v) => !v)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-500 hover:bg-violet-600 text-white transition-colors"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        New Checklist
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleCreate} className="flex items-center gap-2">
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Checklist title (e.g. Packing List)"
                        autoFocus
                        className="flex-1 text-sm px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 outline-none transition-all placeholder:text-gray-300"
                    />
                    <button
                        type="submit"
                        disabled={!title.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors"
                    >
                        Create
                    </button>
                    <button
                        type="button"
                        onClick={() => { setShowForm(false); setTitle(""); }}
                        className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                </form>
            )}

            {!checklists ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : checklists.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <svg className="w-10 h-10 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <p className="text-gray-400 text-sm">No checklists yet.{!readOnly && " Create one to start organizing!"}</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {checklists.map((cl) => (
                        <ChecklistCard key={cl._id} checklist={cl} readOnly={readOnly} isOwner={isOwner} onChanged={loadChecklists} />
                    ))}
                </div>
            )}
        </section>
    );
}
